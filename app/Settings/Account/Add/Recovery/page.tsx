"use client";
import { useState, useEffect } from "react";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Account,
  Ed25519PrivateKey,
  SigningSchemeInput,
} from "@aptos-labs/ts-sdk";
import { doc, setDoc } from "firebase/firestore";
import db from "@/firebaseConfig";

export default function ImportAccount() {
  const [recoveryPhrase, setRecoveryPhrase] = useState<string[]>(
    Array(12).fill("")
  );
  const [showPhrase, setShowPhrase] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [cryptoModule, setCryptoModule] = useState<any>(null);
  const [WebApp, setWebApp] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const initializeDependencies = async () => {
      try {
        const crypto = require("crypto");
        const algorithm = "aes-256-cbc";
        const key = crypto.createHash("sha256").update("KEY_TEST").digest();
        const iv = crypto.randomBytes(16);

        setCryptoModule({ crypto, algorithm, key, iv });

        const WebAppModule = await import("@twa-dev/sdk");
        setWebApp(WebAppModule.default);
      } catch (error) {
        console.error("Error initializing dependencies:", error);
        setError("Failed to initialize required modules");
      }
    };

    if (typeof window !== "undefined") {
      initializeDependencies();
    }
  }, []);

  function encrypt(text: string) {
    if (!cryptoModule) return null;
    const { crypto, algorithm, key, iv } = cryptoModule;
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    return { iv: iv.toString("hex"), encryptedData: encrypted };
  }

  const handleInputChange = (index: number, value: string) => {
    const newPhrase = [...recoveryPhrase];

    if (index === 0) {
      const words = value.toLowerCase().trim().split(/\s+/);
      if (words.length > 1) {
        const filledPhrase = Array(12).fill("");
        words.forEach((word, idx) => {
          if (idx < 12) filledPhrase[idx] = word;
        });
        setRecoveryPhrase(filledPhrase);
        return;
      }
    }

    newPhrase[index] = value.toLowerCase().trim();
    setRecoveryPhrase(newPhrase);
    setError("");
  };

  const handlePaste = (
    e: React.ClipboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (index === 0) {
      e.preventDefault();
      const pastedText = e.clipboardData.getData("text");
      const words = pastedText.toLowerCase().trim().split(/\s+/);

      const filledPhrase = Array(12).fill("");
      words.forEach((word, idx) => {
        if (idx < 12) filledPhrase[idx] = word;
      });
      setRecoveryPhrase(filledPhrase);
    }
  };

  const deriveAccountFromMnemonic = async (
    phrase: string[]
  ): Promise<{ privateKey: Ed25519PrivateKey; account: Account } | null> => {
    try {
      const mnemonicPhrase = phrase.join(" ").toLowerCase();
      console.log("Using mnemonic phrase:", mnemonicPhrase);
  
      if (!cryptoModule) return null;
      const { crypto } = cryptoModule;
  
      // Generate seed using BIP39 standard with a random salt
      const salt = crypto.randomBytes(16).toString('hex'); 
      const seedBuffer = crypto.pbkdf2Sync(
        mnemonicPhrase,
        `mnemonic${salt}`,
        2048,
        64,
        "sha512"
      );
  
      // Convert seed to private key bytes
      const privateKeyBytes = new Uint8Array(seedBuffer.slice(0, 32));
      console.log("Private key bytes:", privateKeyBytes);
  
      // Create Ed25519PrivateKey instance
      const privateKey = new Ed25519PrivateKey(privateKeyBytes);
      console.log("Ed25519 private key created");
  
      // Create Account with legacy Ed25519
      const account = Account.fromPrivateKey({
        privateKey,
        legacy: true, 
      });
  
      console.log(
        "Derived account address:",
        account.accountAddress.toString()
      );
      return { privateKey, account };
    } catch (err) {
      console.error("Error deriving account from mnemonic:", err);
      return null;
    }
  };

  const updateFirebaseAccount = async (
    userId: string,
    address: string,
    privateKeyHex: string
  ) => {
    try {
      const encryptedResult = encrypt(privateKeyHex);
      if (!encryptedResult) throw new Error("Encryption failed");

      const walletData = {
        id: userId,
        publicKey: address,
        userName: WebApp?.initDataUnsafe?.user?.username || "Anonymous",
        iv: encryptedResult.iv,
        referralLink: `https://t.me/ZiptosWalletBot?start=${userId}`,
        encryptedData: encryptedResult.encryptedData,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      };

      await setDoc(doc(db, "testWalletUsers", userId), walletData, {
        merge: true,
      });
      return true;
    } catch (error) {
      console.error("Error updating wallet in Firebase:", error);
      return false;
    }
  };

  const validateRecoveryPhrase = () => {
    const isComplete = recoveryPhrase.every((word) => word.trim() !== "");
    if (!isComplete) {
      setError("Please fill in all recovery phrase words");
      return false;
    }
    return true;
  };

  const handleNextClick = async () => {
    if (!validateRecoveryPhrase()) return;

    if (!WebApp) {
      setError("Application not fully initialized");
      return;
    }

    if (!cryptoModule) {
      setError("Encryption module not initialized");
      return;
    }

    setIsLoading(true);
    try {
      const result = await deriveAccountFromMnemonic(recoveryPhrase);
      if (!result) {
        setError("Failed to derive account from recovery phrase");
        return;
      }

      const { privateKey, account } = result;
      const address = account.accountAddress.toString();
      const privateKeyHex = Buffer.from(privateKey.toString()).toString("hex");

      console.log("Account address:", address);
      console.log("Private key (hex):", privateKeyHex);

      const userId = WebApp.initDataUnsafe?.user?.id;
      if (!userId) {
        setError("Unable to get user information");
        return;
      }

      const success = await updateFirebaseAccount(
        String(userId),
        address,
        privateKeyHex
      );

      if (success) {
        console.log("Successfully imported account with address:", address);
        router.push("/");
      } else {
        setError("Failed to update account information");
      }
    } catch (err) {
      console.error("Error in handleNextClick:", err);
      setError("Failed to import account");
    } finally {
      setIsLoading(false);
    }
  };

  const focusNextInput = (index: number) => {
    if (index < 11) {
      const nextInput = document.querySelector(
        `input[data-index="${index + 1}"]`
      ) as HTMLInputElement;
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      focusNextInput(index);
    }
  };

  return (
    <div className="bg-[#323030] min-h-screen text-white p-6 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => router.back()}
          className="text-white hover:text-gray-300 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-white">Import Account</h1>
        <div className="w-6 h-6" />
      </div>

      <main className="flex-grow mt-6">
        <h2 className="text-2xl font-bold mb-2">Enter Recovery Phrase</h2>
        <p className="text-gray-400 mb-6">
          Enter or paste your 12-word recovery phrase into the first box
        </p>

        <div className="grid grid-cols-2 gap-4 mb-8">
          {recoveryPhrase.map((word, index) => (
            <div key={index} className="flex items-center">
              <span className="mr-2 text-gray-400">{index + 1}.</span>
              <input
                type={showPhrase ? "text" : "password"}
                value={word}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onPaste={(e) => handlePaste(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                data-index={index}
                className={`w-full bg-[#494949] rounded-lg py-2 px-3 text-white 
                  placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500
                  ${error && !word ? "border-2 border-red-500" : ""}`}
                placeholder={`Word ${index + 1}`}
              />
            </div>
          ))}
        </div>

        <button
          onClick={() => setShowPhrase(!showPhrase)}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
        >
          {showPhrase ? (
            <>
              <EyeOff className="w-5 h-5" /> Hide recovery phrase
            </>
          ) : (
            <>
              <Eye className="w-5 h-5" /> Show recovery phrase
            </>
          )}
        </button>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      </main>

      <footer className="mt-auto">
        <button
          onClick={handleNextClick}
          disabled={isLoading || !WebApp || !cryptoModule}
          className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold
            hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 
            focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-[#323030]
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Importing..." : "Next"}
        </button>
        <div className="w-1/3 h-1 bg-gray-700 mx-auto mt-6 rounded-full" />
      </footer>
    </div>
  );
}
