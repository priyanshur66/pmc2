import { create } from "zustand";

type PublicKey = {
  publicKey: string;
};

export const usePublicKey = create<PublicKey>((set) => ({
  publicKey: "",
}));