"use client";

import { useMemo, useEffect, useRef } from "react";
import { useSession } from "@/lib/better-auth/auth-client";
import { useUser } from "@/lib/hooks/useUser";
import { useGlobalModalStore } from "@/lib/stores/GlobalModalStore";
import useApi from "@/lib/hooks/useApi";

export default function Global() {
  const { data: session } = useSession();
  const { user, refetch } = useUser();
  const openModal = useGlobalModalStore((s) => s.openModal);
  const { usePost } = useApi();

  const updateTimezone = usePost("/user/timezone");

  const needsOnboarding = useMemo(() => {
    if (!user || !session?.user) {
      return false;
    }
    return !user.telegramChatId;
  }, [user, session]);

  const timezoneUpdateAttempted = useRef(false);

  useEffect(() => {
    if (needsOnboarding) {
      openModal("onboarding");
    }
  }, [needsOnboarding, openModal]);

  // Update timezone if not set (only once)
  useEffect(() => {
    console.log("🚀 ~ Global ~ user.timezone:", user?.timezone);
    if (user && !user.timezone && !timezoneUpdateAttempted.current) {
      const detectedTimezone =
        Intl?.DateTimeFormat?.().resolvedOptions().timeZone;
      console.log("🚀 ~ Global ~ detectedTimezone:", detectedTimezone);

      if (!detectedTimezone) {
        return;
      }

      timezoneUpdateAttempted.current = true;
      updateTimezone.mutate({ timezone: detectedTimezone });
    }
  }, [user]);

  return null;
}
