import { NextRequest, NextResponse } from "next/server";
import { sendTelegramMessage } from "@/lib/telegram/sendTelegramMessage";

export async function POST(req: NextRequest) {
  try {
    const chatIdNumber = 1795961374;

    const message = `✨ You're connected, Adrien!\n\nHere's what happens next:\n\nI'll help you stick to your goal with small daily check-ins.\nEvery morning you'll get a gentle push to start your day.\nEvery evening I'll ask how things went, so you can reflect honestly.\n\nYou can always follow your goal or update it here:\n\n👉 [coachmaarty.com/goals](https://coachmaarty.com/goals)\n\nWe're in this together.\nEnjoy your evening — I'll talk to you tomorrow morning 💛`;

    // Send the message
    const result = await sendTelegramMessage(chatIdNumber, message);

    return NextResponse.json({
      success: true,
      message: "Message sent successfully",
      chatId: chatIdNumber,
      telegramResponse: result,
    });
  } catch (error) {
    console.error("Error sending test Telegram message:", error);
    return NextResponse.json(
      {
        error: "Failed to send message",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
