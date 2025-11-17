"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useUser } from "@/lib/hooks/useUser";
import toast from "react-hot-toast";
import { Copy } from "lucide-react";

interface OnboardingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function OnboardingModal({
  open,
  onOpenChange,
}: OnboardingModalProps) {
  const { user, refetch } = useUser();

  const handleDone = async () => {
    try {
      const result = await refetch();
      const updatedUser = result.data;

      if (updatedUser?.telegramChatId) {
        onOpenChange(false);
        toast.success("Great! You're all set! 🎉");
      } else {
        toast.error(
          "Not connected yet. Make sure you've sent your code to Maarty on Telegram."
        );
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  };

  const telegramBotUrl = "https://t.me/maarty_bot";

  const handleCopyCode = async () => {
    if (user?.telegramIdentifier) {
      try {
        await navigator.clipboard.writeText(user.telegramIdentifier);
        toast.success("Code copied to clipboard! 📋");
      } catch {
        toast.error("Failed to copy code. Please try again.");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Hey, welcome on Maarty! 👋
          </DialogTitle>
          <DialogDescription className="text-base pt-2">
            Maarty uses Telegram to help you achieve your goals. Every morning,
            you&apos;ll receive your daily priority directly in Telegram.
            It&apos;s simple, fast, and keeps you focused. Let&apos;s connect
            your account!
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 mt-4">
          <div className="space-y-4">
            <div className="space-y-3">
              <p className="text-sm font-medium text-text">
                Step 1: Open Maarty on Telegram
              </p>
              <a
                href={telegramBotUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button className="w-full bg-[#0088cc] text-white hover:bg-[#0088cc]/90">
                  Open Maarty on Telegram
                </Button>
              </a>
            </div>

            {user?.telegramIdentifier && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-text">
                  Step 2: Send your code to Maarty
                </p>
                <div className="bg-primary rounded-lg p-4 text-center border-2 border-dashed border-text/20 relative">
                  <p className="text-xs text-text/60 mb-2">Copy this code:</p>
                  <div className="flex items-center justify-center gap-2">
                    <p className="text-xl font-mono font-bold text-text break-all select-all">
                      {user?.telegramIdentifier}
                    </p>
                    <button
                      onClick={handleCopyCode}
                      className="p-1.5 hover:bg-text/10 rounded-md transition-colors cursor-pointer"
                      aria-label="Copy code"
                    >
                      <Copy className="w-4 h-4 text-text/70 hover:text-text" />
                    </button>
                  </div>
                </div>
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <p className="text-sm text-text/80 text-center">
                    <span className="font-semibold">What to do:</span> Once
                    you&apos;ve opened Telegram, send this code to Maarty.
                    He&apos;ll recognize you and connect your account
                    automatically!
                  </p>
                </div>
              </div>
            )}

            <div className="pt-4">
              <Button
                onClick={handleDone}
                className="w-full bg-black text-white hover:bg-black/90"
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
