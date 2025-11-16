// lib/maarty/classifyUserMessage.ts

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export type ClassifiedResult = {
  category: string;
  storedMessage: string | null;
  assistantResponse: string;
  dailyReflectionUpdate: {
    morningMood: string | null;
    progress: string | null;
    stuck: string | null;
  };
};

export async function classifyUserMessage(params: {
  name?: string | null;
  goalTitle: string;
  goalDescription: string;
  userMessage: string;
}) {
  const { name, goalTitle, goalDescription, userMessage } = params;

  const systemPrompt = `
You are Maarty, a warm, compassionate AI mentor.

Your job:
- interpret ANY user message
- detect what kind of message it is
- produce a friendly, supportive response
- fill optional reflection fields

You NEVER give commands.
You NEVER assign tasks.
You ALWAYS validate feelings first.

Choose ONE category:
- "morning_motivation_reply"
- "goal_progress_update"
- "feeling_stuck"
- "new_intention_or_plan"
- "free_talk"
- "irrelevant"

"storedMessage" is a short summary (1 sentence max).
"assistantResponse" is what Maarty says back.
"dailyReflectionUpdate" contains optional fields (null if not relevant).

ALWAYS output valid JSON.
`.trim();

  const userPrompt = `
User name: ${name || "friend"}
Goal: ${goalTitle}
Description: ${goalDescription}

User message: "${userMessage}"

Return ONLY this JSON structure:

{
  "category": "...",
  "storedMessage": "...",
  "assistantResponse": "...",
  "dailyReflectionUpdate": {
    "morningMood": null or "...",
    "progress": null or "...",
    "stuck": null or "..."
  }
}
`.trim();

  const completion = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    temperature: 0.4,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });

  const raw = completion.choices[0].message?.content || "{}";

  let parsed: ClassifiedResult;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    console.error("❌ JSON Parse Error from OpenAI:", raw);
    throw new Error("Invalid JSON returned by OpenAI");
  }

  return parsed;
}
