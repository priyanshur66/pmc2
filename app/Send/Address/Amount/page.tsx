"use client";
import React, { useState, ChangeEvent, useEffect } from "react";
import { ArrowLeft } from "react-feather";
import { useRouter } from 'next/navigation';
import { aptos } from '@/components/WalletScreen';
import { Ed25519PrivateKey, Account } from "@aptos-labs/ts-sdk";
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

export default function EnterAmount(): JSX.Element {
  const [amount, setAmount] = useState<string>("");
  const [amountUSD, setAmountUSD] = useState<number>(0);
  const availableAmount: number = 512.34;
  const router = useRouter();
  const [transferFunction, setTransferFunction] = useState<((sender: string,contractAddress: string, toAddress: string, amount: string) => Promise<string>) | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [account, setAccount] = useState<Account | null>(null);
  const [data, setData] = useState<MyData[]>([]);

  const crypto = require('crypto');
  const algorithm = 'aes-256-cbc';
  const key = crypto.createHash('sha256').update('TEST_KEY').digest();

  function decrypt(text: any) {
    let iv = Buffer.from(text.iv, 'hex');
    let encryptedText = Buffer.from(text.encryptedData, 'hex');
    let decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (userData?.id) {
          const querySnapshot = await getDocs(collection(db, "testWalletUsers"));
          const matchedData = querySnapshot.docs
            .map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }))
            .filter((doc) => doc.id === String(userData.id)) as MyData[];

          if (matchedData.length > 0) {
            const accountData = matchedData[0];
            const decryptedPrivateKey = decrypt({
              iv: accountData.iv,
              encryptedData: accountData.encryptedData,
            });

            const accountPrivateKey = new Ed25519PrivateKey(decryptedPrivateKey);
            const accountArgs = {
              privateKey: accountPrivateKey,
              address: accountData.publicKey,
            };
            const userAccount = Account.fromPrivateKey(accountArgs);
            setAccount(userAccount);

            setTransferFunction(() => async (contractAddress: string, toAddress: string, amount: string) => {
              if (!userAccount) throw new Error("User account not set");
              return transferLegacyCoin(userAccount, contractAddress, toAddress, amount);
            });

            setData(matchedData);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [userData]);

  const handleAmountChange = (value: string): void => {
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
      const numericValue: number = parseFloat(value) || 0;
      setAmountUSD(numericValue * 1); // Assuming 1 APT = $1 USD for simplicity
    }
  };

  const handleMaxClick = (): void => {
    setAmount(availableAmount.toString());
    setAmountUSD(availableAmount);
  };

  async function transferLegacyCoin(sender: any, contractAddress: string, toAddresses: string, amount: string): Promise<string> {
    try {
      console.log("Transfer params:", { sender, contractAddress, toAddresses, amount });

      const transaction = await aptos.transaction.build.simple({
        sender: sender,
        data: {
          function: "0x1::aptos_account::transfer_coins",
          typeArguments: [contractAddress],
          functionArguments: [toAddresses, amount],
        },
      });

      console.log("Transaction built:", transaction);

      const senderAuthenticator = aptos.transaction.sign({ signer: sender, transaction });
      console.log("Transaction signed");

      const pendingTxn = await aptos.transaction.submit.simple({ transaction, senderAuthenticator });
      console.log("Transaction submitted:", pendingTxn);

      return pendingTxn.hash;
    } catch (error) {
      console.error("Error in transferLegacyCoin:", error);
      throw error;
    }
  }

  return (
    <div className="flex flex-col h-screen bg-[#323030] text-white p-4">

       <div className="mb-6 flex items-center">
      <button onClick={() => router.back()} className="text-white">
          {/* Back Arrow Icon */}
          <ArrowLeft className="mr-4" />

        </button>
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 flex ">
      <p className="text-white font-bold text-lg ">
      Enter Amount
        </p>
      </div>  
      <span className="absolute right-4 text-lg font-normal text-[#6F6F6F]">Next</span>
    
      </div>
      <div className="mb-6">
        <div className="flex items-center justify-between bg-[#212020] border border-[#5E5E5E] rounded-2xl py-3 px-4">
          <span>To: 0x41...c866</span>
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
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              handleAmountChange(e.target.value)
            }
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
      <button className="w-full bg-[#F33439] text-white py-3 rounded-lg font-bold"
        onClick={() => {
          if (transferFunction) {
            transferFunction(
              "0xbb629c088b696f8c3500d0133692a1ad98a90baef9d957056ec4067523181e9a",
              "0x1::aptos_coin::AptosCoin",
              "0x413f9bd280f85fc556aac588a2dbe82d6bfede35c7e45118c2c16e3e4636b83b",
              "1000"
            )
              .then(hash => console.log("Transaction hash:", hash))
              .catch(error => console.error("Transfer error:", error));
          } else {
            console.error("Transfer function not set");
          }
        }}
      >
        Next
      </button>
        
      </div>
    
    </div>
  );
}
