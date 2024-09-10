"use client";
import React, { useState, ChangeEvent } from "react";
import {
  ArrowLeft,
} from "react-feather";
import { useRouter } from 'next/navigation';
import { aptos } from '@/components/WalletScreen';




export default function EnterAmount(): JSX.Element {
  const [amount, setAmount] = useState<string>("");
  const [amountUSD, setAmountUSD] = useState<number>(0);
  const availableAmount: number = 512.34;
  const router = useRouter();
  const [transferFunction, setTransferFunction] = useState<((contractAddress: string, toAddress: string, amount: string) => Promise<string>) | null>(null);



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

  async function transferLegacyCoin(sender: any, contractAddress: string, toAddresses: string, amount: any): Promise<string> {
    const transaction = await aptos.transaction.build.simple({
      sender: sender.accountAddress,
      data: {
        function: "0x1::aptos_account::transfer_coins",
        typeArguments: [
          contractAddress
        ],
        functionArguments: [
          toAddresses,
          amount
        ],
      },
    });
  
    const senderAuthenticator = aptos.transaction.sign({ signer: sender, transaction });
    const pendingTxn = await aptos.transaction.submit.simple({ transaction, senderAuthenticator });
  
    return pendingTxn.hash;
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
        transferLegacyCoin("0xbb629c088b696f8c3500d0133692a1ad98a90baef9d957056ec4067523181e9a","0x1::aptos_coin::AptosCoin", "0x413f9bd280f85fc556aac588a2dbe82d6bfede35c7e45118c2c16e3e4636b83b", "1000")
          .then(hash => console.log("Transaction hash:", hash))
          .catch(error => console.error("Transfer error:", error));
      }}
      
      >
        Next
      </button>
        
      </div>
    
    </div>
  );
}
