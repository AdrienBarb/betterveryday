"use client";

import { useGlobalModalStore } from "@/lib/stores/GlobalModalStore";
import AuthModal from "@/components/AuthModal";
import SignInModal from "@/components/SignInModal";
import OnboardingModal from "@/components/OnboardingModal";
import ActiveGoalLimitModal from "@/components/ActiveGoalLimitModal";

export default function ModalWrapper() {
  const stack = useGlobalModalStore((s) => s.stack);
  const closeModal = useGlobalModalStore((s) => s.closeModal);
  const top = stack[stack.length - 1];

  if (!top) return null;

  switch (top.type) {
    case "auth":
      return <AuthModal open onOpenChange={closeModal} {...top.data} />;
    case "signIn":
      return <SignInModal open onOpenChange={closeModal} {...top.data} />;
    case "onboarding":
      return <OnboardingModal open onOpenChange={closeModal} {...top.data} />;
    case "activeGoalLimit":
      return (
        <ActiveGoalLimitModal open onOpenChange={closeModal} {...top.data} />
      );
    default:
      return null;
  }
}
