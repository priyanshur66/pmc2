"use client";
import { useState } from "react";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { Account, Ed25519PrivateKey } from "@aptos-labs/ts-sdk";
import { doc, setDoc } from "firebase/firestore";
import db from "@/firebaseConfig";
import WebApp from "@twa-dev/sdk";
const crypto = require('crypto');


const algorithm = 'aes-256-cbc';
const key = crypto.createHash('sha256').update('KEY_TEST').digest();
const iv = crypto.randomBytes(16);

export default function ImportAccount() {
  const [privateKey, setPrivateKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  function encrypt(text: string) {
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return { iv: iv.toString('hex'), encryptedData: encrypted };
  }

  const getPublicKey = async () => {
    try {
   
      const cleanPrivateKey = privateKey.startsWith("0x") 
        ? privateKey.slice(2) 
        : privateKey;

   
      const privateKeyBytes = new Uint8Array(
        cleanPrivateKey.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []
      );

 
      const privateKeyObj = new Ed25519PrivateKey(privateKeyBytes);

      // Create account from private key
      const account = Account.fromPrivateKey({ 
        privateKey: privateKeyObj,
        legacy: true
      });

      const address = account.accountAddress.toString();
      return { address, privateKeyHex: cleanPrivateKey };
    } catch (err) {
      console.error("Error deriving address:", err);
      setError("Invalid private key format");
      return null;
    }
  };

  const updateFirebaseAccount = async (userId: string, address: string, privateKeyHex: string) => {
    try {
      // Encrypt the private key
      const encryptedResult = encrypt(privateKeyHex);


      const walletData = {
        id: userId,
        publicKey: address,
        userName: WebApp.initDataUnsafe.user?.username || 'Anonymous',
        iv: encryptedResult.iv,
        referralLink: `https://t.me/ZiptosWalletBot?start=${userId}`,
        encryptedData: encryptedResult.encryptedData,
        
      };

      // Update the document in Firebase
      await setDoc(doc(db, "testWalletUsers", userId), walletData, { merge: true });

      return true;
    } catch (error) {
      console.error("Error updating wallet in Firebase:", error);
      return false;
    }
  };

  const handleNextClick = async () => {
    if (!privateKey.trim()) {
      setError("Please enter a private key");
      return;
    }

    setIsLoading(true);
    try {
      const accountInfo = await getPublicKey();
      if (accountInfo) {
        const { address, privateKeyHex } = accountInfo;
        
        // Get user ID from Telegram WebApp
        const userId = WebApp.initDataUnsafe.user?.id;
        if (!userId) {
          setError("Unable to get user information");
          return;
        }

        // Update account in Firebase
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
      }
    } catch (err) {
      console.error("Error in handleNextClick:", err);
      setError("Failed to import account");
    } finally {
      setIsLoading(false);
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

      <main className="flex-grow mt-10">
        <h2 className="text-2xl font-bold mb-2">Enter Private Key</h2>
        <p className="text-gray-400 mb-6">
          Add an existing wallet with your private key
        </p>

        <div className="relative mb-8">
          <input
            type={showKey ? "text" : "password"}
            placeholder="Enter private key"
            value={privateKey}
            onChange={(e) => {
              setPrivateKey(e.target.value);
              setError(""); // Clear error when input changes
            }}
            className={`w-full bg-[#494949] rounded-lg py-3 px-4 pr-12 text-white 
              placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500
              ${error ? 'border-2 border-red-500' : ''}`}
          />
          <button 
            onClick={() => setShowKey(!showKey)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 
              text-white hover:text-gray-300 transition-colors"
          >
            {showKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        {error && (
          <p className="text-red-500 text-sm mb-4">{error}</p>
        )}
      </main>

      <footer className="mt-auto">
        <button
          onClick={handleNextClick}
          disabled={isLoading}
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