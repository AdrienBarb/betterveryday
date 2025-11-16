// lib/maarty/openai.ts
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

type GenerateMorningMessageInput = {
  name?: string | null;
  goalTitle: string;
  goalDescription: string;
  lastMorningSummaries?: string[]; // optional
};

export async function generateMorningMessage(
  input: GenerateMorningMessageInput
) {
  const { name, goalTitle, goalDescription, lastMorningSummaries = [] } = input;

  const systemPrompt = `
You are Maarty, a warm, supportive AI mentor.

Your job is to send a short, friendly morning message to the user.
You do NOT give tasks or to-dos.
You do NOT tell them what they must do.

You:
- remind them gently of their goal,
- encourage them emotionally,
- invite them to share how they feel,
- keep the tone light, human, and non-judgmental.

Messages must:
- be at most 3 short paragraphs,
- use simple language,
- contain at most 1 emoji (optional),
- never sound like a productivity coach or boss,
- never talk about hustling or optimizing,
- focus on compassion, realism, and small honest steps.
`.trim();

  const userPrompt = `
User name: ${name || "friend"}
Goal title: ${goalTitle}
Goal description: ${goalDescription}

Recent morning mood summaries (may be empty):
${lastMorningSummaries.length ? "- " + lastMorningSummaries.join("\n- ") : "(none)"}

Write ONE morning message for this user.
Talk directly to them ("you").
Return ONLY the final message as plain text.
`.trim();

  const completion = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.9,
  });

  const message = completion.choices[0]?.message?.content?.trim();
  if (!message) throw new Error("No morning message generated");

  return message;
}
