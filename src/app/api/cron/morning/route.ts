// app/api/cron/morning/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { generateMorningMessage } from "@/lib/openai/generateMorningMessage";
import { sendTelegramMessage } from "@/lib/telegram/sendTelegramMessage";
import { logMessage } from "@/lib/services/messages/logMessage";

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function GET(_req: NextRequest) {
  try {
    const todayStart = startOfToday();

    // 1) Find users with telegramChatId and an active goal
    const users = await prisma.user.findMany({
      where: {
        telegramChatId: { not: null },
        goals: {
          some: {
            status: "active",
          },
        },
      },
      select: {
        id: true,
        name: true,
        telegramChatId: true,
        goals: {
          where: { status: "active" },
          take: 1, // one active goal for now
          orderBy: { createdAt: "asc" },
        },
      },
    });

    for (const user of users) {
      const chatId = user.telegramChatId;
      const goal = user.goals[0];

      if (!chatId || !goal) continue;

      // 2) Avoid sending multiple morning messages the same day
      const alreadySent = await prisma.userMessage.findFirst({
        where: {
          userId: user.id,
          category: "morning_prompt",
          createdAt: { gte: todayStart },
        },
      });

      if (alreadySent) continue;

      // 3) Get last few morning summaries for personalization
      const lastReflections = await prisma.dailyReflection.findMany({
        where: {
          userId: user.id,
          goalId: goal.id,
        },
        orderBy: { date: "desc" },
        take: 5,
      });

      const lastMorningSummaries = lastReflections
        .map((r) => r.mood)
        .filter((m): m is string => !!m);

      // 4) Generate morning message via OpenAI
      const morningText = await generateMorningMessage({
        name: user.name,
        goalTitle: goal.title,
        goalDescription: goal.description,
        lastMorningSummaries,
      });

      // 5) Send it to Telegram
      await sendTelegramMessage(chatId, morningText);

      // 6) Log in UserMessage
      await logMessage({
        userId: user.id,
        goalId: goal.id,
        role: "assistant",
        direction: "outgoing",
        text: morningText,
        category: "morning_prompt",
        storedLabel: null,
      });

      // 7) Ensure a DailyReflection row exists for today (optional but useful)
      await prisma.dailyReflection.upsert({
        where: {
          userId_goalId_date: {
            userId: user.id,
            goalId: goal.id,
            date: todayStart,
          },
        },
        create: {
          userId: user.id,
          goalId: goal.id,
          date: todayStart,
        },
        update: {},
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error in morning cron:", error);
    return NextResponse.json({ ok: true }); // don't fail cron hard
  }
}
