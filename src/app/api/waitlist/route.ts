import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";
import { render } from "@react-email/render";
import { WaitlistConfirmationEmail } from "@/lib/emails/WaitlistConfirmationEmail";
import { resendClient } from "@/lib/resend/resendClient";
import config from "@/lib/config";

const waitlistSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name } = waitlistSchema.parse(body);

    const existing = await prisma.waitlist.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Email already on waitlist" },
        { status: 400 }
      );
    }

    const totalCount = await prisma.waitlist.count();

    const waitlistEntry = await prisma.waitlist.create({
      data: {
        email,
        name,
        position: totalCount + 1,
      },
    });

    if (config.features.waitlist?.confirmationEmail !== false) {
      try {
        const emailHtml = await render(
          WaitlistConfirmationEmail({
            email: waitlistEntry.email,
            position: waitlistEntry.position!,
          })
        );

        await resendClient.emails.send({
          from: config.contact.email,
          to: email,
          subject: `You're on the ${config.project.name} waitlist!`,
          html: emailHtml,
        });
      } catch (emailError) {
        console.error(
          "Failed to send waitlist confirmation email:",
          emailError
        );
      }
    }

    return NextResponse.json(
      {
        success: true,
        position: waitlistEntry.position,
        message: "You've been added to the waitlist!",
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error("Waitlist error:", error);
    return NextResponse.json(
      { error: "Failed to join waitlist" },
      { status: 500 }
    );
  }
}
