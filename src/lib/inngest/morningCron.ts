import { inngest } from "./client";
import { prisma } from "@/lib/db/prisma";
import { generateMorningMessage } from "@/lib/openai/generateMorningMessage";
import { sendTelegramMessage } from "@/lib/telegram/sendTelegramMessage";
import { logMessage } from "@/lib/services/messages/logMessage";
import { getCurrentHourInTimezone, getStartOfTodayInTimezone } from "./utils";

export const morningCron = inngest.createFunction(
  { id: "morning-messages-daily" },
  [{ cron: "*/30 * * * *" }, { event: "cron/morning.trigger" }],
  async ({ step }) => {
    const users = await step.run("find-eligible-users", async () => {
      // Find users with telegramChatId, timezone, and an active goal
      const allUsers = await prisma.user.findMany({
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
            take: 1,
            orderBy: { createdAt: "asc" },
          },
        },
      });

      // Filter users where it's currently 9 AM in their timezone (between 9:00 and 9:59)
      return allUsers.filter((user) => {
        if (!user.timezone) return false;
        const currentHour = getCurrentHourInTimezone(user.timezone);
        return currentHour === 9; // 9:00 AM to 9:59 AM
      });
    });

    console.log(`Found ${users.length} users eligible for morning messages`);

    for (const user of users) {
      const chatId = user.telegramChatId;
      const goal = user.goals[0];

      if (!chatId || !goal || !user.timezone) continue;

      await step.run(`send-morning-${user.id}`, async () => {
        if (!user.timezone) return;

        // Get start of today in user's timezone
        const todayStartInUserTz = getStartOfTodayInTimezone(user.timezone);

        // Avoid sending multiple morning messages the same day (in user's timezone)
        const alreadySent = await prisma.userMessage.findFirst({
          where: {
            userId: user.id,
            category: "morning_prompt",
            createdAt: { gte: todayStartInUserTz },
          },
        });

        if (alreadySent) {
          console.log(`Morning message already sent today for user ${user.id}`);
          return;
        }

        // Get last few morning summaries for personalization
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

        // Generate morning message via OpenAI
        const morningText = await generateMorningMessage({
          name: user.name,
          goalTitle: goal.title,
          goalDescription: goal.description,
          lastMorningSummaries,
        });

        // Send it to Telegram
        await sendTelegramMessage(Number(chatId), morningText);

        // Log in UserMessage
        await logMessage({
          userId: user.id,
          goalId: goal.id,
          role: "assistant",
          direction: "outgoing",
          text: morningText,
          category: "morning_prompt",
          storedLabel: null,
        });

        // Ensure a DailyReflection row exists for today in user's timezone
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

        console.log(`Sent morning message to user ${user.id}`);
      });
    }
  }
);
