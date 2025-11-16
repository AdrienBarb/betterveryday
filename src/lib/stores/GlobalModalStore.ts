import { create } from "zustand";

type ModalType = "auth" | "signIn" | "onboarding" | "activeGoalLimit" | null;

interface ModalStackItem {
  type: ModalType;
  data?: any;
}

interface GlobalModalState {
  stack: ModalStackItem[];
  openModal: (type: ModalType, data?: any) => void;
  closeModal: () => void;
  resetModals: () => void;
}

export const useGlobalModalStore = create<GlobalModalState>((set) => ({
  stack: [],
  openModal: (type, data) => {
    return set((state) => ({ stack: [...state.stack, { type, data }] }));
  },
  closeModal: () => set((state) => ({ stack: state.stack.slice(0, -1) })),
  resetModals: () => set({ stack: [] }),
}));
