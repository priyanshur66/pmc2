"use client";
import React, { useState, ChangeEvent } from "react";
import { ArrowLeft } from "react-feather";
import { useRouter } from 'next/navigation';
import { AptosAccount, Types, HexString, AptosClient } from 'aptos';
import { useIvData } from "@/store";
import { useEncryptedValue } from "@/store";
import { useToKey } from '@/store';



const NODE_URL = 'https://fullnode.devnet.aptoslabs.com/v1'; // Testnet URL
const aptosClient = new AptosClient(NODE_URL);
const crypto = require('crypto');




// Decrypt private key function


function decryptPrivateKey(encryptedData: string, iv: string, key: Buffer): string {
  const algorithm = 'aes-256-cbc'; // Encryption algorithm

  // Convert IV and encrypted data from hex to Buffer
  const ivBuffer = Buffer.from(iv, 'hex');
  const encryptedTextBuffer = Buffer.from(encryptedData, 'hex');

  // Create a decipher instance
  const decipher = crypto.createDecipheriv(algorithm, key, ivBuffer);

  // Decrypt the data
  let decrypted = decipher.update(encryptedTextBuffer);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  // Return the decrypted data as a string
  return decrypted.toString(); // No encoding specified
}

// Generate the key from 'TEST_KEY'
const key = crypto.createHash('sha256').update('KEY_TEST').digest();

// Example encrypted data and IV (these should be provided or obtained from your encryption process)
const {encryptedValue} = useEncryptedValue()

const encryptedData = encryptedValue;

const {ivData} = useIvData()
// The encrypted private key in hex format
const iv = ivData; // The initialization vector in hex format


const decryptedPrivateKey = decryptPrivateKey(encryptedData, iv, key);
console.log('Decrypted Private Key:', decryptedPrivateKey);



// Hardcoded account address
const accountAddress = '0xbb629c088b696f8c3500d0133692a1ad98a90baef9d957056ec4067523181e9a'; // Hardcoded account address
const privateKey = HexString.ensure(decryptedPrivateKey).toUint8Array(); // Convert to Uint8Array

async function transferLegacyCoin(amount: number, privateKey: any, toAddress: string) {
  try {
    const contractAddress = '0x1::aptos_coin::AptosCoin'; // Hardcoded contract address

    // Initialize the Aptos Account with the private key
    const sender = new AptosAccount(privateKey);

    // Build the transaction payload
    const payload = {
      type: 'entry_function_payload',
      function: '0x1::aptos_account::transfer_coins',
      type_arguments: [contractAddress],
      arguments: [toAddress, amount.toString()],
    };

    // Create a raw transaction
    const rawTxn = await aptosClient.generateTransaction(sender.address(), payload);

    // Sign the transaction
    const signedTxn = await aptosClient.signTransaction(sender, rawTxn);

    // Submit the transaction
    const pendingTxn = await aptosClient.submitTransaction(signedTxn);

    // Wait for the transaction to be confirmed
    await aptosClient.waitForTransaction(pendingTxn.hash);

    return pendingTxn.hash; // Return the transaction hash
  } catch (error) {
    console.error('Error transferring coins:', error);
    throw error;
  }
}

export default function EnterAmount(): JSX.Element {

  const [amount, setAmount] = useState<string>("");
  const [amountUSD, setAmountUSD] = useState<number>(0);
  const availableAmount: number = 512.34;
  const router = useRouter();

  const hardcodedAmount: number = 10000000;
  // const privateKey: string = '0x4c2282e2ff820ccb3ec2a3c5583d612d6d5a1556b38cce94068ff4dde74c1f5c'; // Hardcoded private key
  // const toAddress: string = '0x0ee25eca6f5c8aee94b3198ee8663c3509cc0e9d5cff244f4990c86dfbd7569d';
  const {toKey} = useToKey();


  const toAddress = toKey;

   // Hardcoded receiver address

  const handleAmountChange = (value: string): void => {
    console.log("Handling amount change", value);  // Log before setting state
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
      const numericValue: number = parseFloat(value) || 0;
      setAmountUSD(numericValue * 1);
      console.log("Entered amount:", value);  // Log after processing
    }
  };

  const handleMaxClick = (): void => {
    setAmount(availableAmount.toString());
    setAmountUSD(availableAmount);
  };

  // const handleNextClick = async (): Promise<void> => {
  //   try {
  //     const txnHash = await transferLegacyCoin(hardcodedAmount, privateKey, toAddress);
  //     console.log('Transaction successful with hash:', txnHash);
  //     // Optionally navigate to another page or show a success message
  //   } catch (error) {
  //     console.error('Transaction failed:', error);
  //     // Optionally show an error message to the user
  //   }
  // };

  const handleNextClick = async (): Promise<void> => {
    try {
      const numericAmount = parseFloat(amount);  // Convert amount from string to number
      if (isNaN(numericAmount) || numericAmount <= 0) {
        console.error('Invalid amount entered');
        return;
      }
  
      const adjustedAmount = Math.round(numericAmount * (10 ** 8));  // Multiply by 10^8
  
      const txnHash = await transferLegacyCoin(adjustedAmount, privateKey, toAddress);  // Pass adjustedAmount here
      console.log('Transaction successful with hash:', txnHash);
      // Optionally navigate to another page or show a success message
    } catch (error) {
      console.error('Transaction failed:', error);
      // Optionally show an error message to the user
    }
  };

  
  return (
    <div className="flex flex-col h-screen bg-[#323030] text-white p-4">
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
          <span>To: {toAddress.slice(0, 6)}...{toAddress.slice(-4)}

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
          className="w-full bg-[#F33439] text-white py-3 rounded-lg font-bold"
          onClick={handleNextClick}
        >
          Next
        </button>
      </div>
    </div>
  );
}