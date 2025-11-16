// app/api/cron/evening/route.ts
import { NextResponse } from "next/server";
import { DateTime } from "luxon";
import { prisma } from "@/lib/db/prisma";
import { generateEveningMessage } from "@/lib/openai/generateEveningMessage";
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

    // Filter users where it's currently 7 PM in their timezone (between 19:00 and 19:59)
    const eligibleUsers = users.filter((user) => {
      if (!user.timezone) return false;
      const currentHour = getCurrentHourInTimezone(user.timezone);
      return currentHour === 19; // 7:00 PM to 7:59 PM
    });

    for (const user of eligibleUsers) {
      const chatId = user.telegramChatId;
      const goal = user.goals[0];

      if (!chatId || !goal || !user.timezone) continue;

      // Get start of today in user's timezone
      const todayStartInUserTz = getStartOfTodayInTimezone(user.timezone);

      // 2) Avoid sending multiple evening messages the same day (in user's timezone)
      const alreadySent = await prisma.userMessage.findFirst({
        where: {
          userId: user.id,
          category: "evening_prompt",
          createdAt: { gte: todayStartInUserTz },
        },
      });

      if (alreadySent) continue;

      // 3) Generate evening message via OpenAI
      const eveningText = await generateEveningMessage({
        name: user.name,
        goalTitle: goal.title,
      });

      if (!eveningText) {
        console.error(`Failed to generate evening message for user ${user.id}`);
        continue;
      }

      // 4) Send it to Telegram
      await sendTelegramMessage(Number(chatId), eveningText);

      // 5) Log in UserMessage
      await logMessage({
        userId: user.id,
        goalId: goal.id,
        role: "assistant",
        direction: "outgoing",
        text: eveningText,
        category: "evening_prompt",
        storedLabel: null,
      });
    }

    return NextResponse.json({
      ok: true,
      checked: users.length,
      eligible: eligibleUsers.length,
      sent: eligibleUsers.length,
    });
  } catch (error) {
    console.error("Error in evening cron:", error);
    return NextResponse.json({ ok: true }); // don't fail cron hard
  }
}

