import { useUserStore } from "@/lib/stores/UserStore";
import useApi from "@/lib/hooks/useApi";
import { useEffect } from "react";
import { useSession } from "@/lib/better-auth/auth-client";
import { Goal, User } from "@prisma/client";

export const useUser = () => {
  const { user, setUser: setUserStore, clearUser } = useUserStore();
  const { useGet } = useApi();
  const { data: session } = useSession();

  const {
    data: fetchedUser,
    isLoading,
    error,
    refetch,
  } = useGet(
    `/me`,
    {},
    {
      enabled: !!session?.user?.id,
      staleTime: 0,
      refetchOnWindowFocus: true,
    }
  );

  const setUser = (partialUser: Partial<User & { goals: Goal[] }>) => {
    const updatedUser = { ...user, ...partialUser };
    setUserStore(updatedUser as User & { goals: Goal[] });
  };

  useEffect(() => {
    if (fetchedUser) {
      setUserStore(fetchedUser);
    }
  }, [fetchedUser, setUserStore]);

  useEffect(() => {
    if (!session?.user?.id) {
      clearUser();
    }
  }, [session?.user?.id, clearUser]);

  return {
    user,
    isLoading,
    error,
    refetch,
    isLoggedIn: () => !!user,
    setUser,
  };
};
