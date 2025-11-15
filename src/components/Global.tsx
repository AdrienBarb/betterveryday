"use client";

import { useMemo, useEffect } from "react";
import { useSession } from "@/lib/better-auth/auth-client";
import { useUser } from "@/lib/hooks/useUser";
import { useGlobalModalStore } from "@/lib/stores/GlobalModalStore";

export default function Global() {
  const { data: session } = useSession();
  const { user } = useUser();
  const openModal = useGlobalModalStore((s) => s.openModal);

  const needsOnboarding = useMemo(() => {
    if (!user || !session?.user) {
      return false;
    }
    return !user.name || !user.phone;
  }, [user, session]);
  console.log("🚀 ~ Global ~ needsOnboarding:", needsOnboarding);

  useEffect(() => {
    if (needsOnboarding) {
      openModal("onboarding");
    }
  }, [needsOnboarding, openModal]);

  return null;
}
