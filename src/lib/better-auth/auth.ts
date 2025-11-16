import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { emailOTP } from "better-auth/plugins";
import { prisma } from "@/lib/db/prisma";
import { resendClient } from "@/lib/resend/resendClient";
import { OTPEmail } from "@/lib/emails/OTPEmail";
import config from "@/lib/config";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    emailOTP({
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      sendVerificationOTP: async ({ email, otp, type }) => {
        try {
          const result = await resendClient.emails.send({
            from: config.contact.email,
            to: email,
            subject: "Your sign-in code for " + config.project.name,
            react: OTPEmail({
              otp,
            }),
          });

          if (result.error) {
            console.error("❌ Resend API error:", result.error);
            throw new Error(
              `Failed to send email: ${result.error.message || JSON.stringify(result.error)}`
            );
          }
        } catch (error) {
          console.error("❌ Error sending OTP email:", error);
          if (error instanceof Error) {
            throw new Error(`Email send failed: ${error.message}`);
          }
          throw error;
        }
      },
    }),
  ],
  secret: process.env.BETTER_AUTH_SECRET,
});
