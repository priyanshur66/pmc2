import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
interface PublicKeyState {
  publicKey: string;
  setPublicKey: (key: string) => void;
}
interface toKeyState {
  toKey: string;
  setToKey: (key: string) => void;
}
interface ivState {
  ivData: string;
  setIvData: (key: string) => void;
}
interface encryptedState {
  encryptedValue: string;
  setEncryptedValue: (key: string) => void;
}
interface transactionState {
  transactionHash: string;
  setTransactionHash: (key: string) => void;
}
interface currentBalanceState {
  currentBalance: number;
  setCurrentBalance: (key: number) => void;
}
interface currentSymbolState {
  currentSymbol: string;
  setCurrentSymbol: (key: string) => void;
}
interface selectedTokenState {
  selectedToken: string;
  setSelectedToken: (key: string) => void;
}
interface selectedNFTState {
  selectedNFT: string;
  setSelectedNFT: (key: string) => void;
}
interface nftImageState {
  nftImage: string;
  setNftImage: (key: string) => void;
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

export const useIvData = create<ivState>()(
  persist(
    (set) => ({
      ivData: '',
      setIvData: (key) => set({ ivData: key }),
    }),
    {
      name: 'public-key-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
  
);
export const useToKey = create<toKeyState>()(
  persist(
    (set) => ({
      toKey: '',
      setToKey: (key) => set({ toKey: key }),
    }),
    {
      name: 'public-key-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
  
);
export const useEncryptedValue = create<encryptedState>()(
  persist(
    (set) => ({
      encryptedValue: '',
      setEncryptedValue: (key) => set({ encryptedValue: key }),
    }),
    {
      name: 'public-key-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
  
);

export const useTransactionHash = create <transactionState>()(
  persist(
    (set) => ({
      transactionHash: '',
      setTransactionHash: (key) => set({transactionHash: key}),
    }),
    {
      name: 'public-key-storage',
      storage: createJSONStorage(()=>localStorage),
    }
  )
);
export const useCurrentBalance = create <currentBalanceState>()(
  persist(
    (set) => ({
      currentBalance: parseFloat('') || 0,
      setCurrentBalance: (key) => set({currentBalance: key}),
    }),
    {
      name: 'public-key-storage',
      storage: createJSONStorage(()=>localStorage),
    }
  )
);
export const useCurrentSymbol = create <currentSymbolState>()(
  persist(
    (set) => ({
      currentSymbol: '' ,
      setCurrentSymbol: (key) => set({currentSymbol: key}),
    }),
    {
      name: 'public-key-storage',
      storage: createJSONStorage(()=>localStorage),
    }
  )
);

export const useSelectedToken = create <selectedTokenState>()(
  persist(
    (set) => ({
      selectedToken: '' ,
      setSelectedToken: (key) => set({selectedToken: key}),
    }),
    {
      name: 'public-key-storage',
      storage: createJSONStorage(()=>localStorage),
    }
  )
);
export const useSelectedNFT = create <selectedNFTState>()(
  persist(
    (set) => ({
      selectedNFT: '' ,
      setSelectedNFT: (key) => set({selectedNFT: key}),
    }),
    {
      name: 'public-key-storage',
      storage: createJSONStorage(()=>localStorage),
    }
  )
);
export const useNftImage = create <nftImageState>()(
  persist(
    (set) => ({
      nftImage: '' ,
      setNftImage: (key) => set({nftImage: key}),
    }),
    {
      name: 'public-key-storage',
      storage: createJSONStorage(()=>localStorage),
    }
  )
);