import Anthropic from "@anthropic-ai/sdk";
import { anthropic } from "../claude/client";

export async function generateMentorReply({
  name,
  goalTitle,
  goalDescription,
  userMessage,
  category,
  reflection,
}: {
  name: string;
  goalTitle: string;
  goalDescription: string;
  userMessage: string;
  category: string;
  reflection: {
    morningMood: string | null;
    progress: string | null;
    stuck: string | null;
  };
}) {
  const systemPrompt = `
You are Maarty, a warm, soft-spoken, emotionally intelligent micro-mentor.
Your style:
- validating
- empathetic
- gentle encouragement
- no judgment, no pressure
- never gives tasks or instructions
- helps the user think, reflect, clarify feelings

You ALWAYS:
- acknowledge emotion first
- normalize struggle
- encourage small steps
- keep messages short and warm
- speak like a supportive little companion

`.trim();

  const userPrompt = `
User: ${name}
Goal: ${goalTitle}
Description: ${goalDescription}

User message: "${userMessage}"
Category detected: ${category}

Daily reflection signals:
- Mood: ${reflection.morningMood || "null"}
- Progress: ${reflection.progress || "null"}
- Stuck: ${reflection.stuck || "null"}

Now generate Maarty's answer in a warm, human-like voice.
`.trim();

  const completion = await anthropic.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
    temperature: 0.9,
  });

  const message =
    completion.content[0]?.type === "text"
      ? completion.content[0].text.trim()
      : null;

  if (!message) throw new Error("No mentor reply generated");

  return message;
}
