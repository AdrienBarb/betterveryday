import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/better-auth/auth";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";
import { errorHandler } from "@/lib/errors/errorHandler";

const goalSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const goals = await prisma.goal.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ goals });
  } catch (error) {
    return errorHandler(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, endDate } = goalSchema.parse(body);

    const goal = await prisma.goal.create({
      data: {
        userId: session.user.id,
        title,
        description,
        endDate: new Date(endDate),
      },
    });

    return NextResponse.json({ success: true, goal });
  } catch (error) {
    return errorHandler(error);
  }
}
