import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export type ClassifiedResult = {
  morningMood: string | null;
  progress: string | null;
  stuck: string | null;
};

export async function classifyUserMessage(params: {
  name?: string | null;
  goalTitle: string;
  goalDescription: string;
  userMessage: string;
}): Promise<ClassifiedResult> {
  const { name, goalTitle, goalDescription, userMessage } = params;

  const systemPrompt = `
You are Maarty's background reflection analyzer.

Your ONLY job is to read a single user message and detect:
- the user's mood or energy (morningMood)
- any concrete progress they describe (progress)
- anything they feel stuck or blocked on (stuck)

Definitions:

morningMood:
- emotions, mindset, or energy level
- examples: motivated, tired, anxious, excited, unfocused
- set to null if no mood is expressed

progress:
- clear, concrete actions taken toward the goal
- examples: "I worked on the landing page", "I published the MVP", "I researched pricing"
- set to null if no progress is described

stuck:
- confusion, obstacles, frustration, uncertainty, discouragement
- examples: "I don't know what to do next", "I'm blocked", "This feels overwhelming"
- set to null if nothing indicates feeling stuck

RULES:
- Never generate advice.
- Never interpret loosely. Only extract what is explicitly or clearly implied.
- If nothing fits a field, set it to null.
- Return ONLY the JSON object with the three fields.

Output must match exactly:

{
  "morningMood": null or "...",
  "progress": null or "...",
  "stuck": null or "..."
}
`.trim();

  const userPrompt = `
User name: ${name || "friend"}
Goal: ${goalTitle}
Description: ${goalDescription}

User message: "${userMessage}"

Extract reflection signals and return ONLY the JSON.
`.trim();

  const completion = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    temperature: 0, // deterministic
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
