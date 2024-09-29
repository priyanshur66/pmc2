"use client";
import React, { useState, ChangeEvent, useEffect } from "react";
import { ArrowLeft } from "react-feather";
import { useRouter } from 'next/navigation';
import { AptosAccount, Types, HexString, AptosClient } from 'aptos';
import { useToKey } from "@/store";

import { useEncryptedValue } from "@/store";
import { useIvData } from "@/store";

const NODE_URL = 'https://fullnode.devnet.aptoslabs.com/v1';
const aptosClient = new AptosClient(NODE_URL);
const crypto = require('crypto');

function decryptPrivateKey(encryptedData: string, iv: string, key: Buffer): string {
  try {
    const algorithm = 'aes-256-cbc';
    const ivBuffer = Buffer.from(iv, 'hex');
    const encryptedTextBuffer = Buffer.from(encryptedData, 'hex');
    const decipher = crypto.createDecipheriv(algorithm, key, ivBuffer);
    let decrypted = decipher.update(encryptedTextBuffer);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString('utf8'); // Specify UTF-8 encoding
  } 
  catch (error) {
    if (error instanceof Error) {
      throw new Error(`Decryption failed: ${error.message}`);
    } else {
      throw new Error('Decryption failed: Unknown error');
    }
  }
  
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
  const availableAmount: number = 512.34;
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  const router = useRouter();
  const { toKey } = useToKey();
  const toAddress = toKey;

  const {encryptedValue} = useEncryptedValue();
  const {ivData} = useIvData();
  const encryptedData = encryptedValue;
  const iv = ivData;


  const addDebugInfo = (info: string) => {
    setDebugInfo(prev => [...prev, info]);
  };

  const decryptedPrivateKey = decryptPrivateKey(encryptedData, iv, key) ;
  const privateKey = HexString.ensure(decryptedPrivateKey).toUint8Array();
  addDebugInfo(`privatekey : ${privateKey}`)


  

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
  
      router.push('/Send/Address/Amount/Success');
    } catch (error) {
      if (error instanceof Error) {
        addDebugInfo(`Transaction failed: ${error.message}`);
      } else {
        addDebugInfo('Transaction failed: Unknown error');
      }
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <div className="flex flex-col h-screen bg-[#323030] text-white p-4">
      {/* ... (previous JSX remains the same) ... */}
      
      <div className="mt-auto px-4 mb-6">
        <button
          className={`w-full bg-[#F33439] text-white py-3 rounded-lg font-bold ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={handleNextClick}
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : 'Next'}
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