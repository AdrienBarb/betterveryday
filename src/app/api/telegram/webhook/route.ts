import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { sendTelegramMessage } from "@/lib/telegram/sendTelegramMessage";
import { logMessage } from "@/lib/services/messages/logMessage";
import { User } from "@prisma/client";
import { generateMentorReply } from "@/lib/openai/generateMentorReply";
import { inngest } from "@/lib/inngest/client";

type TelegramUpdate = {
  update_id: number;
  message?: {
    message_id: number;
    text?: string;
    chat: {
      id: number;
      type: string;
      first_name?: string;
      username?: string;
    };
  };
};

export async function POST(req: NextRequest) {
  try {
    const update = (await req.json()) as TelegramUpdate;
    const message = update.message;

    if (!message || !message.text) {
      return NextResponse.json({ ok: true });
    }

    const chatId = message.chat.id;
    const text = message.text.trim();
    const lower = text.toLowerCase();

    // 1) Check if this chat is already linked to a user account
    const connectedUser = (await prisma.user.findFirst({
      where: { telegramChatId: chatId.toString() },
      select: {
        id: true,
        name: true,
      },
    })) as User | null;

    // 2) Handle /start command
    if (lower === "/start") {
      if (connectedUser) {
        await sendTelegramMessage(
          chatId,
          "✅ You're already connected to Maarty.\nYou can just talk to me naturally here — soon I'll use your messages to understand your progress and help you better."
        );
      } else {
        await sendTelegramMessage(
          chatId,
          "👋 Hey, I'm Maarty.\nI'll help you move toward your goals with small daily priorities.\n\nTo connect your account, please send me the code you see in the Maarty web app."
        );
      }

      return NextResponse.json({ ok: true });
    }

    // 3) If chat is already linked to a user, handle as active user message flow
    if (connectedUser) {
      // Update user name if Telegram profile provides a different first_name
      if (
        message.chat.first_name &&
        message.chat.first_name !== connectedUser.name
      ) {
        await prisma.user.update({
          where: { id: connectedUser.id },
          data: { name: message.chat.first_name },
        });
        connectedUser.name = message.chat.first_name;
      }

      // Fetch the user's active goal
      const activeGoal = await prisma.goal.findFirst({
        where: { userId: connectedUser.id, status: "active" },
      });

      if (!activeGoal) {
        await sendTelegramMessage(
          chatId,
          "Before I can really help, You first need to create a goal in the web app."
        );
        return NextResponse.json({ ok: true });
      }

      // Log the user's incoming message
      await logMessage({
        userId: connectedUser.id,
        goalId: activeGoal.id,
        role: "user",
        direction: "incoming",
        text,
        category: "free_talk",
        storedLabel: null,
      });

      // Trigger downstream ingress event for processing (classification, etc)
      await inngest.send({
        name: "maarty/message.received",
        userId: connectedUser.id,
        goalId: activeGoal.id,
        text,
      });

      // Generate mentor reply using Claude Sonnet
      const assistantReply = await generateMentorReply({
        name: connectedUser.name || "friend",
        goalTitle: activeGoal.title,
        goalDescription: activeGoal.description,
        userMessage: text,
      });

      // Send mentor's reply back to user
      await sendTelegramMessage(chatId, assistantReply);

      // Log the assistant's outgoing message
      await logMessage({
        userId: connectedUser.id,
        goalId: activeGoal.id,
        role: "assistant",
        direction: "outgoing",
        text: assistantReply,
        category: "free_talk",
        storedLabel: null,
      });

      return NextResponse.json({ ok: true });
    }

    // 4) If chat is not linked, treat message text as a potential telegramIdentifier (link code)
    const userByIdentifier = await prisma.user.findUnique({
      where: { telegramIdentifier: text },
    });

    if (userByIdentifier) {
      // Extra safety: avoid linking the same code to multiple Telegram accounts
      if (
        userByIdentifier.telegramChatId &&
        userByIdentifier.telegramChatId !== chatId.toString()
      ) {
        await sendTelegramMessage(
          chatId,
          "⚠️ This code is already linked to another account. Please generate a new code from the web app."
        );
        return NextResponse.json({ ok: true });
      }

      // Prepare update for telegramChatId and (optionally) name from Telegram profile
      const updateData: { telegramChatId: string; name?: string } = {
        telegramChatId: chatId.toString(),
      };

      if (message.chat.first_name) {
        updateData.name = message.chat.first_name;
      }

      await prisma.user.update({
        where: { id: userByIdentifier.id },
        data: updateData,
      });

      const displayName =
        message.chat.first_name || userByIdentifier.name || "friend";

      await sendTelegramMessage(
        chatId,
        `✨ You're connected, ${displayName}!\n\nHere's what happens next:\n\nI'll help you stick to your goal with small daily check-ins.\nEvery morning you'll get a gentle push to start your day.\nEvery evening I'll ask how things went, so you can reflect honestly.\n\nYou can always follow your goal or update it here:\n\n👉 [coachmaarty.com/goals](https://coachmaarty.com/goals)\n\nWe're in this together.\nEnjoy your evening — I'll talk to you tomorrow morning 💛`
      );

      return NextResponse.json({ ok: true });
    }

    // 5) If message is not a known code, reply with instructions
    await sendTelegramMessage(
      chatId,
      "I couldn't find this code.\n\nPlease open the Maarty web app, go to the Telegram section, and send me the code you see there."
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error processing Telegram webhook:", error);
    // Always respond 200 so Telegram doesn't retry forever
    return NextResponse.json({ ok: true });
  }
}
