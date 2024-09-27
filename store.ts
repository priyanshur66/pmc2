import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
interface PublicKeyState {
  publicKey: string;
  setPublicKey: (key: string) => void;
}

export const usePublicKey = create<PublicKeyState>()(
  persist(
    (set) => ({
      publicKey: '',
      setPublicKey: (key) => set({ publicKey: key }),
    }),
    {
      name: 'public-key-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);