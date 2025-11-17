import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import { errorHandler } from "@/lib/errors/errorHandler";

const requestSchema = z.object({
  userGoal: z.string().min(1, "User goal is required"),
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userGoal } = requestSchema.parse(body);

    const today = new Date().toISOString().split("T")[0];

    const systemPrompt = `You are Maarty, a friendly and supportive AI mentor who helps users achieve finite, concrete goals.

Your job:
- Transform any user input into a clear, finite goal.
- Create a short description written in first person ("I will...") that explains what the goal means and what the user will accomplish.

Rules:
- The goal must ALWAYS be finite and achievable. If the user gives a vague or infinite goal ("be healthier", "be more productive", "read more"), convert it into a concrete, measurable objective, like:
  - "Lose 3kg"
  - "Finish one book"
  - "Clean and organize your room"
  - "Launch a minimal MVP"
- The goal description should be 1–2 simple sentences written in first person, starting with "I will..." (e.g., "I will lose 3kg by following a balanced diet and exercising regularly").
- Always return valid JSON with the requested fields and nothing else.`;

    const userPrompt = `User goal: "${userGoal}"
Today is: ${today}

Return ONLY a JSON object with the following fields:
{
  "goalTitle": string,
  "goalDescription": string
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    let goalData;
    try {
      goalData = JSON.parse(content);
    } catch {
      console.error("Failed to parse OpenAI response:", content);
      throw new Error("Invalid response format from AI");
    }

    // Validate the response structure
    const responseSchema = z.object({
      goalTitle: z.string(),
      goalDescription: z.string(),
    });

    const validatedData = responseSchema.parse(goalData);

    return NextResponse.json(validatedData);
  } catch (error) {
    return errorHandler(error);
  }
}
