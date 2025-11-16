import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;

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

    console.log("🚀 ~ Telegram message:", message);

    const chatId = message.chat.id;
    const text = message.text.trim();
    const lower = text.toLowerCase();

    // 1) Is this chat already linked?
    const connectedUser = await prisma.user.findFirst({
      where: { telegramChatId: chatId.toString() },
    });

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
      // TODO later: send this message text to OpenAI to interpret meaning (done? stuck? question? etc.)
      await sendTelegramMessage(
        chatId,
        "📝 Got your message. I'm still learning to understand everything you say — soon I'll use this to track your progress and adapt your priorities."
      );

      // You might also want to log messages for later:
      // await prisma.telegramMessage.create({ data: { userId: connectedUser.id, chatId: chatId.toString(), text } });

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

async function sendTelegramMessage(chatId: number, text: string) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "Markdown",
      }),
    });
  } catch (error) {
    console.error("Failed to send Telegram message:", error);
  }
}
