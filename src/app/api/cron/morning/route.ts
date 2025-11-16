// app/api/cron/morning/route.ts
import { NextResponse } from "next/server";
import { DateTime } from "luxon";
import { prisma } from "@/lib/db/prisma";
import { generateMorningMessage } from "@/lib/openai/generateMorningMessage";
import { sendTelegramMessage } from "@/lib/telegram/sendTelegramMessage";
import { logMessage } from "@/lib/services/messages/logMessage";

/**
 * Get the current hour (0-23) in a specific timezone
 */
function getCurrentHourInTimezone(timezone: string): number {
  return DateTime.now().setZone(timezone).hour;
}

/**
 * Get the start of today in a specific timezone (as UTC Date)
 * This creates a Date object representing midnight (00:00:00) in the given timezone
 */
function getStartOfTodayInTimezone(timezone: string): Date {
  return DateTime.now().setZone(timezone).startOf("day").toJSDate();
}

export async function GET() {
  try {
    // 1) Find users with telegramChatId, timezone, and an active goal
    const users = await prisma.user.findMany({
      where: {
        telegramChatId: { not: null },
        timezone: { not: null },
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
        timezone: true,
        goals: {
          where: { status: "active" },
          take: 1, // one active goal for now
          orderBy: { createdAt: "asc" },
        },
      },
    });

    // Filter users where it's currently 9 AM in their timezone (between 9:00 and 9:59)
    const eligibleUsers = users.filter((user) => {
      if (!user.timezone) return false;
      const currentHour = getCurrentHourInTimezone(user.timezone);
      return currentHour === 9; // 9:00 AM to 9:59 AM
    });

    for (const user of eligibleUsers) {
      const chatId = user.telegramChatId;
      const goal = user.goals[0];

      if (!chatId || !goal || !user.timezone) continue;

      // Get start of today in user's timezone
      const todayStartInUserTz = getStartOfTodayInTimezone(user.timezone);

      // 2) Avoid sending multiple morning messages the same day (in user's timezone)
      const alreadySent = await prisma.userMessage.findFirst({
        where: {
          userId: user.id,
          category: "morning_prompt",
          createdAt: { gte: todayStartInUserTz },
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
      await sendTelegramMessage(Number(chatId), morningText);

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

      // 7) Ensure a DailyReflection row exists for today in user's timezone
      await prisma.dailyReflection.upsert({
        where: {
          userId_goalId_date: {
            userId: user.id,
            goalId: goal.id,
            date: todayStartInUserTz,
          },
        },
        create: {
          userId: user.id,
          goalId: goal.id,
          date: todayStartInUserTz,
        },
        update: {},
      });
    }

    return NextResponse.json({
      ok: true,
      checked: users.length,
      eligible: eligibleUsers.length,
      sent: eligibleUsers.length,
    });
  } catch (error) {
    console.error("Error in morning cron:", error);
    return NextResponse.json({ ok: true }); // don't fail cron hard
  }
}
