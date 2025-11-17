import { NextRequest, NextResponse } from "next/server";
import { sendTelegramMessage } from "@/lib/telegram/sendTelegramMessage";
import { prisma } from "@/lib/db/prisma";
import { generateMorningMessage } from "@/lib/openai/generateMorningMessage";

export async function POST(req: NextRequest) {
  try {
    const chatIdNumber = 1795961374;

    const user = await prisma.user.findUnique({
      where: { id: "wF0kDOax2uxYedSbjJ3HbdYtpTF69NWy" },
      select: {
        id: true,
        name: true,
        goals: {
          where: { status: "active" },
          take: 1,
          orderBy: { createdAt: "asc" },
        },
      },
    });

    // Get last few morning summaries for personalization
    const lastReflections = await prisma.dailyReflection.findMany({
      where: {
        userId: user?.id,
        goalId: user?.goals[0]?.id,
      },
      orderBy: { date: "desc" },
      take: 5,
    });

    const lastMorningSummaries = lastReflections
      .map((r) => r.mood)
      .filter((m): m is string => !!m);

    // Generate morning message via OpenAI
    const morningText = await generateMorningMessage({
      name: user?.name,
      goalTitle: user?.goals[0]?.title || "",
      goalDescription: user?.goals[0]?.description || "",
      lastMorningSummaries,
    });

    console.log("🚀 ~ POST ~ morningText:", morningText);

    // Send it to Telegram
    await sendTelegramMessage(Number(chatIdNumber), morningText);

    return NextResponse.json({
      success: true,
      message: "Message sent successfully",
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
