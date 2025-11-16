import { prisma } from "@/lib/db/prisma";

export async function updateDailyReflection({
  userId,
  goalId,
  morningMood,
  progress,
  stuck,
}: {
  userId: string;
  goalId: string;
  morningMood: string | null;
  progress: string | null;
  stuck: string | null;
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await prisma.dailyReflection.upsert({
    where: {
      userId_goalId_date: { userId, goalId, date: today },
    },
    create: {
      userId,
      goalId,
      date: today,
      mood: morningMood || undefined,
      progress: progress || undefined,
      stuck: stuck || undefined,
    },
    update: {
      mood: morningMood || undefined,
      progress: progress || undefined,
      stuck: stuck || undefined,
    },
  });
}
