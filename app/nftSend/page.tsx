"use client"
import React, { useState, ChangeEvent } from 'react';
import { ArrowLeft } from 'react-feather';
import { useRouter } from 'next/navigation';
import { useToKey } from '@/store';
import { useNftImage } from '@/store';
import { AptosClient, AptosAccount, TxnBuilderTypes, HexString } from 'aptos';
import { useSelectedNFT } from '@/store';
import { useTransactionHash, useIvData, useEncryptedValue } from '@/store';

const NODE_URL = 'https://fullnode.testnet.aptoslabs.com/v1';
const aptosClient = new AptosClient(NODE_URL);
const crypto = require('crypto');

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

  

  const transferNFTV2 = async (privateKey: Uint8Array, toAddress: string, nftAddress: string) => {
    try {
      // Create an AptosAccount from the receiver's private key
      const sender = new AptosAccount(privateKey);


      const transaction = await aptosClient.generateTransaction(sender.address(), {
        function: "0x1::object::transfer",
        type_arguments: ["0x4::token::Token"],
        arguments: [nftAddress, toAddress]
      });

      const signedTxn = await aptosClient.signTransaction(sender, transaction);
      const pendingTxn = await aptosClient.submitTransaction(signedTxn);

      await aptosClient.waitForTransaction(pendingTxn.hash);
      return pendingTxn.hash;
    } catch (error) {
      throw error;
    }
  };
  
  
export default function SendNFT() {
  const [address, setAddress] = useState('');
  const router = useRouter();
  const [isValidAddress, setIsValidAddress] = useState(false);
  const [privateKey, setPrivateKey] = useState<Uint8Array | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { transactionHash, setTransactionHash } = useTransactionHash();



 
  const { nftImage } = useNftImage();  
  const toAddress = address;
  const { selectedNFT } = useSelectedNFT();
  const nftAddress = selectedNFT;
  const { ivData } = useIvData();
  const iv = ivData;
  const { encryptedValue } = useEncryptedValue();
  const encryptedData = encryptedValue;
  
  const decryptedPrivateKey = decryptPrivateKey(encryptedData, iv, key);

  setPrivateKey(HexString.ensure(decryptedPrivateKey).toUint8Array());


  
  const handleAddressChange = (value: string): void => {
    console.log("Handling address change", value);
    setAddress(value);
    
    // Check if the entered address is a valid Aptos address
    const isValidAptosAddress = /^0x[a-fA-F0-9]{61,64}$/.test(value.trim());
    setIsValidAddress(isValidAptosAddress);
    console.log("Entered address:", value);
  };

  const handleNext = () => {
    if (isValidAddress) {
      router.push('/Send/Address/Amount');
    }
  };

  const handleNextClick = async (): Promise<void> => {
    setIsLoading(true);
    // addDebugInfo('Transaction process started');

    try {
      

      if (!privateKey) {
        // addDebugInfo('Private key not available');
        return;
      }

    //   const adjustedAmount = Math.round(numericAmount * (10 ** 8));

    //   addDebugInfo(`Initiating transfer: Amount: ${adjustedAmount}, To: ${toAddress}`);
      const txnHash = await transferNFTV2(privateKey, toAddress, nftAddress);
    //   addDebugInfo(`Transaction successful with hash: ${txnHash}`);
      setTransactionHash(txnHash)


      router.push('/Send/Address/Amount/Success');
    } catch (error) {
    //   addDebugInfo(`Transaction failed: ${error}`);
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
        <span className="absolute right-4 text-lg font-normal text-[#6F6F6F]">Next</span>
      </div>

      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="To: Name or address"
            value={address}
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleAddressChange(e.target.value)}
            className="w-full bg-[#212020] border border-[#5E5E5E] rounded-2xl py-3 px-4 pr-10 text-white placeholder-white"
          />
          <img src="/qr-scan.svg" alt="" className="absolute right-3 top-1/2 transform -translate-y-1/2" />
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-sm text-white mb-2">Recently used</h2>
        <div className="h-64 rounded-xl overflow-hidden mb-4">
          {nftImage ? (
            <img
              src={nftImage}
              alt='NFT'
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-700">
              <span>No image available</span>
            </div>
          )}
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
    </div>
  );
}
