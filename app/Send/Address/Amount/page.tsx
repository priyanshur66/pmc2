"use client";
import React, { useState, ChangeEvent } from "react";
import {
  ArrowLeft,
  // PenSquare
} from "react-feather";
import { useRouter } from 'next/navigation';


export default function EnterAmount(): JSX.Element {
  const [amount, setAmount] = useState<string>("");
  const [amountUSD, setAmountUSD] = useState<number>(0);
  const availableAmount: number = 512.34;
  const router = useRouter();


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

  return (
    <div className="flex flex-col h-screen bg-[#323030] text-white p-4">
      {/* <div className="flex items-center mb-6 relative">
      <button onClick={() => router.back()} className="text-white">
        <ArrowLeft className="absolute left-0" />
        </button>
        <h1 className="text-xl font-bold flex-grow text-center">
          Enter Amount
        </h1>
        <span className="absolute right-0 text-gray-400">Next</span>
      </div> */}
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
          {/* <input
            type="text"
            value={amount}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              handleAmountChange(e.target.value)
            }
            placeholder="0"
            className="bg-transparent text-center w-full outline-none"
          />
          <span className="absolute right-0 top-1/2 transform -translate-y-1/2 text-4xl">
            APT
          </span> */}
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
      <button className="w-full bg-[#F33439] text-white py-3 rounded-lg font-bold">
        Next
      </button>
        
      </div>
    
    </div>
  );
}
