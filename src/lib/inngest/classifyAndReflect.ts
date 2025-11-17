import { prisma } from "../db/prisma";
import { classifyUserMessage } from "../openai/classifyUserMessage";
import { updateDailyReflection } from "../openai/updateDailyReflection";
import { inngest } from "./client";

export const classifyAndReflect = inngest.createFunction(
  { id: "classify-and-reflect" },
  { event: "maarty/message.received" },
  async ({ event, step }) => {
    const { userId, goalId, text } = event.data;
    console.log("🚀 ~ event.data:", event.data);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    console.log("🚀 ~ user:", user);
    const goal = await prisma.goal.findUnique({ where: { id: goalId } });
    console.log("🚀 ~ goal:", goal);

    if (!user || !goal) return;

    const classification = await classifyUserMessage({
      name: user.name,
      goalTitle: goal.title,
      goalDescription: goal.description,
      userMessage: text,
    });

    await updateDailyReflection({
      userId,
      goalId,
      morningMood: classification.morningMood,
      progress: classification.progress,
      stuck: classification.stuck,
    });
  }
);
