"use client";
import React, { useState, ChangeEvent, useEffect } from "react";
import { ArrowLeft } from "react-feather";
import { useRouter } from 'next/navigation';
import { AptosAccount, Types, HexString, AptosClient } from 'aptos';
import { useToKey } from "@/store";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { useTransactionHash } from "@/store";
import db from "@/firebaseConfig";
import WebApp from "@twa-dev/sdk";
import { useCurrentBalance } from "@/store";


const NODE_URL = 'https://fullnode.testnet.aptoslabs.com/v1';
const aptosClient = new AptosClient(NODE_URL);
const crypto = require('crypto');

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

function decryptPrivateKey(encryptedData: string, iv: string, key: Buffer): string {
  const algorithm = 'aes-256-cbc';
  const ivBuffer = Buffer.from(iv, 'hex');
  const encryptedTextBuffer = Buffer.from(encryptedData, 'hex');
  const decipher = crypto.createDecipheriv(algorithm, key, ivBuffer);
  let decrypted = decipher.update(encryptedTextBuffer);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

const key = crypto.createHash('sha256').update('KEY_TEST').digest();


async function transferLegacyCoin(amount: number, privateKey: Uint8Array, toAddress: string) {
  try {
    const contractAddress = '0x1::aptos_coin::AptosCoin';
    const sender = new AptosAccount(privateKey);
    const payload = {
      type: 'entry_function_payload',
      function: '0x1::aptos_account::transfer_coins',
      type_arguments: [contractAddress],
      arguments: [toAddress, amount.toString()],
    };
    const rawTxn = await aptosClient.generateTransaction(sender.address(), payload);
    const signedTxn = await aptosClient.signTransaction(sender, rawTxn);
    const pendingTxn = await aptosClient.submitTransaction(signedTxn);
    await aptosClient.waitForTransaction(pendingTxn.hash);
    return pendingTxn.hash;
  } catch (error) {
    throw error;
  }
}

export default function EnterAmount(): JSX.Element {
  const [amount, setAmount] = useState<string>("");
  const [amountUSD, setAmountUSD] = useState<number>(0);
  const {currentBalance} = useCurrentBalance()
  const availableAmount= currentBalance;
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [data, setData] = useState<MyData[]>([]);
  const [privateKey, setPrivateKey] = useState<Uint8Array | null>(null);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const { transactionHash, setTransactionHash } = useTransactionHash();


  const router = useRouter();
  const { toKey } = useToKey();
  const toAddress = toKey;

  const addDebugInfo = (info: string) => {
    setDebugInfo(prev => [...prev, info]);
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && WebApp.initDataUnsafe.user) {
      setUserData(WebApp.initDataUnsafe.user as UserData);
      addDebugInfo(`User data set: ${JSON.stringify(WebApp.initDataUnsafe.user)}`);
    } else {
      addDebugInfo('WebApp.initDataUnsafe.user not available');
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (userData?.id) {
          addDebugInfo(`Fetching data for user ID: ${userData.id}`);
          const querySnapshot = await getDocs(collection(db, "testWalletUsers"));
          const matchedData = querySnapshot.docs
            .map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }))
            .filter((doc) => doc.id === String(userData.id)) as MyData[];
          
          setData(matchedData);
          addDebugInfo(`Matched data: ${JSON.stringify(matchedData)}`);

          if (matchedData.length > 0) {
            const { iv, encryptedData } = matchedData[0];
            
            if (!iv || !encryptedData) {
              addDebugInfo('IV or encryptedData is missing');
              return;
            }

            addDebugInfo(`IV: ${iv}`);
            addDebugInfo(`Encrypted Data: ${encryptedData}`);

            const decryptedPrivateKey = decryptPrivateKey(encryptedData, iv, key);
            addDebugInfo(`Decrypted Private Key: ${decryptedPrivateKey}`);

            setPrivateKey(HexString.ensure(decryptedPrivateKey).toUint8Array());
            addDebugInfo('Private key set successfully');
          } else {
            addDebugInfo('No matching data found for user');
          }
        }
      } catch (error) {
        addDebugInfo(`Error fetching data: ${error}`);
      }
    };

    fetchData();
  }, [userData]);

  const handleAmountChange = (value: string): void => {
    addDebugInfo(`Handling amount change: ${value}`);
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
      const numericValue: number = parseFloat(value) || 0;
      setAmountUSD(numericValue * 1);
      addDebugInfo(`Amount set: ${value}, USD: ${numericValue * 1}`);
    }
  };

  const handleMaxClick = (): void => {
    setAmount(availableAmount.toString());
    setAmountUSD(availableAmount);
    addDebugInfo(`Max amount set: ${availableAmount}`);
  };

  const handleNextClick = async (): Promise<void> => {
    setIsLoading(true);
    addDebugInfo('Transaction process started');

    try {
      const numericAmount = parseFloat(amount);
      if (isNaN(numericAmount) || numericAmount <= 0) {
        addDebugInfo('Invalid amount entered');
        return;
      }

      if (!privateKey) {
        addDebugInfo('Private key not available');
        return;
      }

      const adjustedAmount = Math.round(numericAmount * (10 ** 8));

      addDebugInfo(`Initiating transfer: Amount: ${adjustedAmount}, To: ${toAddress}`);
      const txnHash = await transferLegacyCoin(adjustedAmount, privateKey, toAddress);
      addDebugInfo(`Transaction successful with hash: ${txnHash}`);
      setTransactionHash(txnHash)


      router.push('/Send/Address/Amount/Success');
    } catch (error) {
      addDebugInfo(`Transaction failed: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#323030] text-white p-4">
      {/* ... (previous JSX remains the same) ... */}

      <div className="mb-6 flex items-center">
        <button onClick={() => router.back()} className="text-white">
          {/* Back Arrow Icon */}
          <ArrowLeft className="mr-4" />
        </button>
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 flex ">
          <p className="text-white font-bold text-lg ">Enter Amount</p>
        </div>
        <span className="absolute right-4 text-lg font-normal text-[#6F6F6F]">Next</span>
      </div>
      <div className="mb-6">
        <div className="flex items-center justify-between bg-[#212020] border border-[#5E5E5E] rounded-2xl py-3 px-4">
          <span>To:
            
          {toAddress.slice(0, 6)}...{toAddress.slice(-4)}
          </span>
          {/* <PenSquare size={18} className="text-gray-400" /> */}
          <img src="/pen.svg" alt="" />
        </div>
      </div>
      <div className="flex-grow flex flex-col items-center justify-center mb-6">
        <div className="text-6xl font-bold mb-2 relative items-center justify-center">
          <div className="text-6xl font-bold mb-2 relative flex items-center justify-center">
            <input
              type="text"
              value={amount}
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleAmountChange(e.target.value)}
              placeholder="0"
              className="bg-transparent text-center w-[20%] outline-none"
            />
            <span className="text-white ml-2">APT</span>
          </div>
        </div>
        <div className="text-gray-400">${amountUSD.toFixed(2)}</div>
      </div>
      <div className="mb-6">
        <div className="h-px bg-[#CACACA] w-full mb-4"></div>
        <div className="flex items-center justify-between">
          <div className="text-left px-4">
            <span className="text-[#FBFFFC] block">Available to send</span>
            <span className="block font-bold text-base">{availableAmount} APT</span>
          </div>
          <div className="flex items-center">
            <button
              className="bg-[#434343] text-white px-8 py-3 rounded-3xl text-sm font-bold"
              onClick={handleMaxClick}
            >
              Max
            </button>
          </div>
        </div>
      </div>
      
      <div className="mt-auto px-4 mb-6">
        <button
          className={`w-full bg-[#F33439] text-white py-3 rounded-lg font-bold ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={handleNextClick}
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : 'Confirm'}
        </button>
      </div>
      
      {/* Debug Information Section */}
      <div className="mt-4 p-4 bg-[#212020] rounded-lg overflow-y-auto max-h-40">
        <h3 className="text-lg font-bold mb-2">Debug Info:</h3>
        {debugInfo.map((info, index) => (
          <p key={index} className="text-sm text-gray-300">{info}</p>
        ))}
      </div>
    </div>
  );
}