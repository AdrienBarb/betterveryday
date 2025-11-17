import { anthropic } from "../claude/client";

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

  const completion = await anthropic.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 1024,
    system: system,
    messages: [{ role: "user", content: user }],
    temperature: 0.9,
  });

  const message =
    completion.content[0]?.type === "text"
      ? completion.content[0].text.trim()
      : null;

  if (!message) throw new Error("No evening message generated");

  return message;
}
