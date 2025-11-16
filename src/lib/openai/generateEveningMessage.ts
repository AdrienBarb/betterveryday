import OpenAI from "openai";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function generateEveningMessage({
  name,
  goalTitle,
}: {
  name: string;
  goalTitle: string;
}) {
  const system = `
You are Maarty, a warm, supportive AI mentor.
Your job is to send a short evening reflection message.

Rules:
- Never assign tasks
- Never judge the user
- Never talk about productivity or optimization
- Keep it emotional, gentle, reflective, human
- Maximum 3 short lines
- At most 1 emoji (optional)
- Ask how the day went
- Ask if they moved a little toward their goal
- Validate any kind of day (good, bad, neutral)
  `.trim();

  const user = `
User name: ${name || "friend"}
Goal: ${goalTitle}

Return only the final message as text.
  `.trim();

  const completion = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    temperature: 0.9,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });

  return completion.choices[0].message?.content?.trim();
}
