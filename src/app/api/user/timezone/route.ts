import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/better-auth/auth";
import { prisma } from "@/lib/db/prisma";
import { errorHandler } from "@/lib/errors/errorHandler";

const timezoneSchema = z.object({
  timezone: z.string().min(1, "Timezone is required"),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { timezone } = timezoneSchema.parse(body);

    await prisma.user.update({
      where: { id: session.user.id },
      data: { timezone },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 400 }
      );
    }
    return errorHandler(error);
  }
}
