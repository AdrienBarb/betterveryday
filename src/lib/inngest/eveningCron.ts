import { inngest } from "./client";
import { prisma } from "@/lib/db/prisma";
import { generateEveningMessage } from "@/lib/openai/generateEveningMessage";
import { sendTelegramMessage } from "@/lib/telegram/sendTelegramMessage";
import { logMessage } from "@/lib/services/messages/logMessage";
import { getCurrentHourInTimezone, getStartOfTodayInTimezone } from "./utils";

export const eveningCron = inngest.createFunction(
  { id: "evening-messages-daily" },
  [{ cron: "*/30 * * * *" }, { event: "cron/evening.trigger" }],
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

      // Filter users where it's currently 7 PM in their timezone (between 19:00 and 19:59)
      return allUsers.filter((user) => {
        if (!user.timezone) return false;
        const currentHour = getCurrentHourInTimezone(user.timezone);
        return currentHour === 19; // 7:00 PM to 7:59 PM
      });
    });

    console.log(`Found ${users.length} users eligible for evening messages`);

    for (const user of users) {
      const chatId = user.telegramChatId;
      const goal = user.goals[0];

      if (!chatId || !goal || !user.timezone) continue;

      await step.run(`send-evening-${user.id}`, async () => {
        if (!user.timezone) return;

        // Get start of today in user's timezone
        const todayStartInUserTz = getStartOfTodayInTimezone(user.timezone);

        // Avoid sending multiple evening messages the same day (in user's timezone)
        const alreadySent = await prisma.userMessage.findFirst({
          where: {
            userId: user.id,
            category: "evening_prompt",
            createdAt: { gte: todayStartInUserTz },
          },
        });

        if (alreadySent) {
          console.log(`Evening message already sent today for user ${user.id}`);
          return;
        }

        // Generate evening message via OpenAI
        const eveningText = await generateEveningMessage({
          name: user.name,
          goalTitle: goal.title,
        });

        if (!eveningText) {
          console.error(
            `Failed to generate evening message for user ${user.id}`
          );
          return;
        }

        // Send it to Telegram
        await sendTelegramMessage(Number(chatId), eveningText);

        // Log in UserMessage
        await logMessage({
          userId: user.id,
          goalId: goal.id,
          role: "assistant",
          direction: "outgoing",
          text: eveningText,
          category: "evening_prompt",
          storedLabel: null,
        });

        console.log(`Sent evening message to user ${user.id}`);
      });
    }
  }
);
