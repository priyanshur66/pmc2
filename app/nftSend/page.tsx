"use client";
import React, { useState, ChangeEvent } from "react";
import { ArrowLeft } from "react-feather";
import { useRouter } from "next/navigation";
import { useToKey } from "@/store";
import { useNftImage } from "@/store";
import { AptosClient, AptosAccount, TxnBuilderTypes, HexString } from "aptos";
import { useSelectedNFT } from "@/store";
import { useTransactionHash, useIvData, useEncryptedValue } from "@/store";
import { useEffect } from "react";
import WebApp from "@twa-dev/sdk";
import { getFirestore, collection, getDocs } from "firebase/firestore";

import db from "@/firebaseConfig";

interface UserData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code: string;
  is_premium?: boolean;
}

interface MyData {
  id: string;
  publicKey: string;
  userName: number;
  iv: string;
  referralLink: string;
  referredBy: string;
  encryptedData: string;
}

const NODE_URL = "https://fullnode.testnet.aptoslabs.com/v1";
const aptosClient = new AptosClient(NODE_URL);
const crypto = require("crypto");

function decryptPrivateKey(
  encryptedData: string,
  iv: string,
  key: Buffer
): string {
  const algorithm = "aes-256-cbc";
  const ivBuffer = Buffer.from(iv, "hex");
  const encryptedTextBuffer = Buffer.from(encryptedData, "hex");
  const decipher = crypto.createDecipheriv(algorithm, key, ivBuffer);
  let decrypted = decipher.update(encryptedTextBuffer);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

const key = crypto.createHash("sha256").update("KEY_TEST").digest();

// Updated transfer function to handle both NFT and token transfer
const transferNFTV2 = async (
  privateKey: Uint8Array,
  toAddress: string,
  nftAddress: string
) => {
  try {
    const sender = new AptosAccount(privateKey);
    console.log("Sender address:", sender.address().toString());
    console.log("To address:", toAddress);
    console.log("NFT address:", nftAddress);

    // First, get the token information
    const tokenInfo = await aptosClient.getAccountResource(
      nftAddress,
      "0x4::token::Token"
    );

    // Create a multi-transaction payload
    const transaction = await aptosClient.generateTransaction(
      sender.address(),
      {
        function: "0x4::token::transfer",
        type_arguments: [],
        arguments: [nftAddress, toAddress],
      }
    );

    // Sign and submit the transaction
    const signedTxn = await aptosClient.signTransaction(sender, transaction);
    const pendingTxn = await aptosClient.submitTransaction(signedTxn);

    // Wait for transaction confirmation
    const txnResult = await aptosClient.waitForTransaction(pendingTxn.hash);

    // Verify the transaction success
    if (txnResult.success) {
      console.log("Transfer successful:", pendingTxn.hash);
      return pendingTxn.hash;
    } else {
      throw new Error("Transaction failed");
    }
  } catch (error) {
    console.error("Transfer error:", error);
    throw error;
  }
};

export default function SendNFT() {
  const [address, setAddress] = useState("");
  const router = useRouter();
  const [isValidAddress, setIsValidAddress] = useState(false);
  const [privateKey, setPrivateKey] = useState<Uint8Array | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { transactionHash, setTransactionHash } = useTransactionHash();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [data, setData] = useState<MyData[]>([]);

  const { nftImage } = useNftImage();
  const toAddress = address;
  const { selectedNFT } = useSelectedNFT();
  const nftAddress = selectedNFT;

  useEffect(() => {
    if (typeof window !== "undefined" && WebApp.initDataUnsafe.user) {
      setUserData(WebApp.initDataUnsafe.user as UserData);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (userData?.id) {
          const querySnapshot = await getDocs(
            collection(db, "testWalletUsers")
          );
          const matchedData = querySnapshot.docs
            .map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }))
            .filter((doc) => doc.id === String(userData.id)) as MyData[];

          setData(matchedData);

          if (matchedData.length > 0) {
            const { iv, encryptedData } = matchedData[0];

            if (!iv || !encryptedData) {
              setError("Missing encryption data");
              return;
            }

            const decryptedPrivateKey = decryptPrivateKey(
              encryptedData,
              iv,
              key
            );

            setPrivateKey(HexString.ensure(decryptedPrivateKey).toUint8Array());
          }
        }
      } catch (error) {
        setError("Failed to fetch user data");
        console.error(error);
      }
    };

    fetchData();
  }, [userData]);

  const handleAddressChange = (value: string): void => {
    setAddress(value);
    const isValidAptosAddress = /^0x[a-fA-F0-9]{61,64}$/.test(value.trim());
    setIsValidAddress(isValidAptosAddress);
  };

  const handleNextClick = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      if (!privateKey) {
        throw new Error("Private key not available");
      }

      if (!isValidAddress) {
        throw new Error("Invalid recipient address");
      }

      if (!nftAddress) {
        throw new Error("No NFT selected");
      }

      const txnHash = await transferNFTV2(privateKey, toAddress, nftAddress);
      setTransactionHash(txnHash);
      router.push("/nftSend/Success");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Transaction failed");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#323030] text-white p-4">
      <div className="mb-6 flex items-center">
        <button onClick={() => router.back()} className="text-white">
          <ArrowLeft className="mr-4" />
        </button>
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 flex">
          <p className="text-white font-bold text-lg">Send NFT</p>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="To: Name or address"
            value={address}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              handleAddressChange(e.target.value)
            }
            className="w-full bg-[#212020] border border-[#5E5E5E] rounded-2xl py-3 px-4 pr-10 text-white placeholder-white"
          />
          <img
            src="/qr-scan.svg"
            alt=""
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500 bg-opacity-20 rounded-lg text-red-300">
          {error}
        </div>
      )}

      <div className="mt-auto px-4 mb-6">
        <button
          className={`w-full bg-[#F33439] text-white py-3 rounded-lg font-bold ${
            isLoading || !isValidAddress ? "opacity-50 cursor-not-allowed" : ""
          }`}
          onClick={handleNextClick}
          disabled={isLoading || !isValidAddress}
        >
          {isLoading ? "Processing..." : "Confirm"}
        </button>
      </div>
    </div>
  );
}
