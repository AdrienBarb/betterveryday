// lib/maarty/logMessage.ts
import { prisma } from "@/lib/db/prisma";

type LogMessageParams = {
  userId: string;
  goalId?: string | null;
  role: "user" | "assistant";
  channel?: "telegram";
  direction: "incoming" | "outgoing";
  text: string;
  category?: string | null; // e.g. "morning_prompt", "morning_motivation_reply"
  storedLabel?: string | null; // short internal summary if needed
};

export async function logMessage(params: LogMessageParams) {
  const {
    userId,
    goalId = null,
    role,
    channel = "telegram",
    direction,
    text,
    category = null,
    storedLabel = null,
  } = params;

  return prisma.userMessage.create({
    data: {
      userId,
      goalId,
      role,
      channel,
      direction,
      text,
      category,
      storedLabel,
    },
  });
}
