"use client"
import React from 'react';
import { useRouter } from "next/navigation";
import { ArrowLeft } from "react-feather";
import MyQRCode from '@/components/MyQRCode';
import { usePublicKey } from '@/store';

const AptosReceive = () => {
    const router = useRouter();
    const walletAddress = usePublicKey.getState().publicKey
  // const walletAddress = '0xbb629c088b696f8c3500d0133692a1ad98a90baef9d957056ec4067523181e9a';

  return (
    <div className="bg-[#323030] min-h-screen text-white p-4">
      {/* Header */}
      <div className="mb-4 flex items-center">
      <button onClick={() => router.back()} className="text-white">
          {/* Back Arrow Icon */}
          <ArrowLeft className="mr-4" />

        </button>
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 flex ">
      <p className="text-white font-bold text-lg ">
          Aptos - Receive
        </p>
      </div>      
      </div>

      {/* Warning */}
      <div className="bg-[#F4A100]/25 text-white p-3 rounded-2xl mb-6 mt-10">
        <p className="text-sm">
          <span className="mr-2">ⓘ</span>
          Only send Aptos (APT) assets to this address. Other assets will be lost forever
        </p>
      </div>

      {/* QR Code */}
      <div className="flex justify-center mb-6">
        <div className="w-48 h-48 mt-6 bg-white p-2 rounded-xl">
          {/* Replace with actual QR code component */}
          <div className="w-full h-full flex items-center justify-center">
          <MyQRCode/>

            <span className="text-white"></span>
          </div>
        </div>
      </div>

      {/* Wallet Address */}
      <div className="mb-4">
        <p className="text-white text-sm mb-2">Wallet Address &gt;</p>
        <div className="bg-[#434343] p-3 rounded-lg flex justify-between items-center">
          <span className="text-sm font-bold truncate mr-2">{walletAddress}</span>
          <button className=" p-1 rounded">
            <img src="/copy.svg" alt="" />
          </button>
        </div>
      </div>

      {/* Minimum Deposit Amount */}
      <div className="mb-6 flex justify-between items-center">
        <p className="text-[#979797] font-normal text-sm">Minimum Deposit Amount</p>
        <p className="text-white">0.01 APT</p>
      </div>

      {/* Copy Address Button */}
      <div className="flex justify-center mt-6">

      <button className="w-2/5 bg-red-500 text-white py-3 rounded-lg font-normal">
        Copy this address
      </button>
      </div>

    </div>
  );
};

export default AptosReceive;