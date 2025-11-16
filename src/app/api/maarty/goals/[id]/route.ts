import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/better-auth/auth";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";
import { GoalStatus } from "@prisma/client";
import { errorHandler } from "@/lib/errors/errorHandler";
import { errorMessages } from "@/lib/constants/errorMessage";
import { ERROR_CODES } from "@/lib/constants/errorCodes";

const updateGoalSchema = z.object({
  status: z.nativeEnum(GoalStatus).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return NextResponse.json(
        { error: errorMessages.UNAUTHORIZED },
        { status: 401 }
      );
    }

    const { id: goalId } = await params;

    const goal = await prisma.goal.findFirst({
      where: {
        id: goalId,
        userId: session.user.id,
      },
      include: {
        reflections: {
          orderBy: {
            date: "desc",
          },
        },
      },
    });

    if (!goal) {
      return NextResponse.json(
        { error: errorMessages.GOAL_NOT_FOUND },
        { status: 404 }
      );
    }

    return NextResponse.json({ goal });
  } catch (error) {
    return errorHandler(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return NextResponse.json(
        { error: errorMessages.UNAUTHORIZED },
        { status: 401 }
      );
    }

    const { id: goalId } = await params;
    console.log("🚀 ~ PUT ~ goalId:", goalId);
    const body = await request.json();

    let parsedBody;
    try {
      parsedBody = updateGoalSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: errorMessages.INVALID_REQUEST_DATA, details: error.issues },
          { status: 400 }
        );
      }
      throw error;
    }

    const { status } = parsedBody;

    // Check if goal belongs to user
    const existingGoal = await prisma.goal.findFirst({
      where: {
        id: goalId,
        userId: session.user.id,
      },
    });

    if (!existingGoal) {
      return NextResponse.json(
        { error: errorMessages.GOAL_NOT_FOUND },
        { status: 404 }
      );
    }

    // If setting to active, check if user already has an active goal
    if (status === GoalStatus.active) {
      const activeGoal = await prisma.goal.findFirst({
        where: {
          userId: session.user.id,
          status: GoalStatus.active,
          id: { not: goalId },
        },
      });

      if (activeGoal) {
        return NextResponse.json(
          {
            error: errorMessages.ACTIVE_GOAL_EXISTS_UPDATE,
            code: ERROR_CODES.ACTIVE_GOAL_EXISTS,
          },
          { status: 409 }
        );
      }
    }

    const updatedGoal = await prisma.goal.update({
      where: {
        id: goalId,
      },
      data: {
        ...(status && { status }),
      },
    });

    return NextResponse.json({ success: true, goal: updatedGoal });
  } catch (error) {
    return errorHandler(error);
  }
}
