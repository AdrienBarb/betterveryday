"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSession } from "@/lib/better-auth/auth-client";
import { useQueryClient } from "@tanstack/react-query";
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
import useApi from "@/lib/hooks/useApi";
import { useUser } from "@/lib/hooks/useUser";

const onboardingSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "WhatsApp number is required"),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

interface OnboardingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function OnboardingModal({
  open,
  onOpenChange,
}: OnboardingModalProps) {
  const { usePut } = useApi();
  const { refetch: refetchUser } = useUser();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
  });

  const updateProfile = usePut("/user/profile", {
    onSuccess: () => {
      reset();
      onOpenChange(false);
      refetchUser();
    },
    onError: (error: unknown) => {
      const errorMessage =
        error && typeof error === "object" && "response" in error
          ? (error as { response?: { data?: { error?: string } } }).response
              ?.data?.error
          : undefined;
      toast.error(
        errorMessage || "Failed to update profile. Please try again."
      );
    },
  });

  const onSubmit = async (data: OnboardingFormData) => {
    updateProfile.mutate({
      name: data.name,
      phone: data.phone,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Welcome to Maarty!</DialogTitle>
          <DialogDescription className="text-base pt-2">
            To start using the app and receive your daily priorities via
            WhatsApp, we need your name and WhatsApp number.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              {...register("name")}
              disabled={updateProfile.isPending}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">WhatsApp Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+33 6 12 34 56 78"
              {...register("phone")}
              disabled={updateProfile.isPending}
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
            )}
            <p className="text-sm text-text/60">
              Include country code (e.g., +33 for France, +1 for USA)
            </p>
          </div>
          <Button
            type="submit"
            className="w-full bg-black text-white hover:bg-black/90"
            disabled={updateProfile.isPending}
          >
            {updateProfile.isPending ? "Saving..." : "Continue"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
