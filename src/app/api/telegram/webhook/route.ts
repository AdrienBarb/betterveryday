import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { sendTelegramMessage } from "@/lib/telegram/sendTelegramMessage";
import { classifyUserMessage } from "@/lib/openai/classifyUserMessage";
import { logMessage } from "@/lib/services/messages/logMessage";
import { updateDailyReflection } from "@/lib/openai/updateDailyReflection";
import { User } from "@prisma/client";

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

    // 1) Is this chat already linked?
    const connectedUser = (await prisma.user.findFirst({
      where: { telegramChatId: chatId.toString() },
      select: {
        id: true,
        name: true,
      },
    })) as User | null;

    // 2) Handle /start
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

    // 3) If chat already linked → just acknowledge message (no logic for now)
    if (connectedUser) {
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

      // User is connected → classify the message
      const result = await classifyUserMessage({
        name: connectedUser?.name || "friend",
        goalTitle: activeGoal.title,
        goalDescription: activeGoal.description,
        userMessage: text,
      });

      // 1. Save user message
      await logMessage({
        userId: connectedUser.id,
        goalId: activeGoal.id,
        role: "user",
        direction: "incoming",
        text,
        category: result.category,
        storedLabel: result.storedMessage,
      });

      // 2. Update reflection if needed
      await updateDailyReflection({
        userId: connectedUser.id,
        goalId: activeGoal.id,
        morningMood: result.dailyReflectionUpdate.morningMood,
        progress: result.dailyReflectionUpdate.progress,
        stuck: result.dailyReflectionUpdate.stuck,
      });

      // 3. Send AI reply
      await sendTelegramMessage(chatId, result.assistantResponse);

      // 4. Log assistant message
      await logMessage({
        userId: connectedUser.id,
        goalId: activeGoal.id,
        role: "assistant",
        direction: "outgoing",
        text: result.assistantResponse,
        category: result.category,
        storedLabel: null,
      });

      return NextResponse.json({ ok: true });
    }

    // 4) Chat NOT linked → treat text as potential telegramIdentifier (your unique code)
    const userByIdentifier = await prisma.user.findUnique({
      where: { telegramIdentifier: text },
    });

    if (userByIdentifier) {
      // Extra safety: avoid linking same code to multiple chats
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

      await prisma.user.update({
        where: { id: userByIdentifier.id },
        data: {
          telegramChatId: chatId.toString(),
        },
      });

      await sendTelegramMessage(
        chatId,
        `✅ Great! Your account is now connected, ${
          userByIdentifier.name || "friend"
        }.\n\nFrom now on, you can just talk to me here like you would to a real mentor.`
      );

      return NextResponse.json({ ok: true });
    }

    // 5) Unknown chat, unknown code
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
