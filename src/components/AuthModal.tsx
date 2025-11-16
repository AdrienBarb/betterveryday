"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authClient, useSession } from "@/lib/better-auth/auth-client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";

const signInSchema = z.object({
  email: z.email("Please enter a valid email address"),
});

const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
});

type SignInFormData = z.infer<typeof signInSchema>;
type OTPFormData = z.infer<typeof otpSchema>;

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

export default function AuthModal({
  open,
  onOpenChange,
  onComplete,
}: AuthModalProps) {
  const [step, setStep] = useState<"auth" | "otp">("auth");
  const [isLoading, setIsLoading] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const { data: session } = useSession();

  const {
    register: registerAuth,
    handleSubmit: handleSubmitAuth,
    formState: { errors: authErrors },
    reset: resetAuth,
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  });

  const {
    register: registerOTP,
    handleSubmit: handleSubmitOTP,
    formState: { errors: otpErrors },
    reset: resetOTP,
  } = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
  });

  // Reset step when modal closes
  useEffect(() => {
    if (!open) {
      // Modal closed, reset everything
      setStep("auth");
      setUserEmail("");
      resetAuth();
      resetOTP();
    }
  }, [open, resetAuth, resetOTP]);

  // Check if user is already authenticated when modal opens
  useEffect(() => {
    if (open && session?.user) {
      // User is already authenticated, close modal and call onComplete
      onComplete();
      onOpenChange(false);
    }
  }, [open, session, onComplete, onOpenChange]);

  const onSubmitAuth = async (data: SignInFormData) => {
    setIsLoading(true);
    try {
      const result = await authClient.emailOtp.sendVerificationOtp({
        email: data.email,
        type: "sign-in",
      });

      if (result.error) {
        throw new Error(result.error.message || "Failed to send the code");
      }

      setUserEmail(data.email);
      setStep("otp");
      toast.success("Check your email for the code!");
      resetAuth();
    } catch (error) {
      toast.error("Failed to send the code. Please try again.");
      console.error("OTP send error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitOTP = async (data: OTPFormData) => {
    setIsLoading(true);
    try {
      const result = await authClient.signIn.emailOtp({
        email: userEmail,
        otp: data.otp,
      });

      if (result.error) {
        throw new Error(result.error.message || "Invalid OTP");
      }

      resetOTP();
      onComplete();
      onOpenChange(false);
    } catch (error) {
      toast.error("Invalid OTP. Please try again.");
      console.error("OTP verify error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setStep("auth");
    setUserEmail("");
    resetAuth();
    resetOTP();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        {step === "auth" ? (
          <>
            <DialogHeader>
              <DialogTitle>Sign In</DialogTitle>
              <DialogDescription>
                Enter your email address and we&apos;ll send you a code to sign
                in.
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={handleSubmitAuth(onSubmitAuth)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  {...registerAuth("email")}
                  disabled={isLoading}
                />
                {authErrors.email && (
                  <p className="text-sm text-destructive">
                    {authErrors.email.message}
                  </p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send Code"}
              </Button>
            </form>
          </>
        ) : step === "otp" ? (
          <>
            <DialogHeader>
              <DialogTitle>Enter Verification Code</DialogTitle>
              <DialogDescription>
                We&apos;ve sent a 6-digit code to {userEmail}. Please enter it
                below.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitOTP(onSubmitOTP)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  {...registerOTP("otp")}
                  disabled={isLoading}
                  className="text-center text-2xl tracking-widest"
                />
                {otpErrors.otp && (
                  <p className="text-sm text-destructive">
                    {otpErrors.otp.message}
                  </p>
                )}
              </div>
              <Button
                variant="default"
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Verifying..." : "Verify Code"}
              </Button>
            </form>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
