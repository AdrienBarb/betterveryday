import { create } from "zustand";
import { Goal, User } from "@prisma/client";

interface UserState {
  user: (User & { goals: Goal[] }) | null;
  setUser: (user: User & { goals: Goal[] }) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}));
