"use client"
import React, { useState, ChangeEvent } from 'react';
import { ArrowLeft} from 'react-feather';
import { useRouter } from 'next/navigation';

export default function SendAPT() {
  const [address, setAddress] = useState('');
  const router = useRouter();



  const handleAddressChange = (value: string): void => {
    console.log("Handling address change", value);
      if (value === "" || (value)) {
      setAddress(value);
      console.log("Entered address:", value); 
    }
    
    
  };


  return (
    <div className="flex flex-col h-screen bg-[#323030] text-white p-4">
    
      <div className="mb-6 flex items-center ">
      <button onClick={() => router.back()} className="text-white">
          <ArrowLeft className="mr-4" />

        </button>
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 flex ">
      <p className="text-white font-bold text-lg ">
      Send APT        </p>
      </div>  
      <span className="absolute right-4 text-lg font-normal text-[#6F6F6F]">Next</span>
    
      </div>

      <div className="mb-6 ">
        <div className="relative ">
          <input
            type="text"
            placeholder="To: Name or address"
            value={address}
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleAddressChange(e.target.value)}            className="w-full bg-[#212020] border border-[#5E5E5E] rounded-2xl py-3 px-4 pr-10 text-white placeholder-white"
          />
          <img src="/qr-scan.svg" alt="" className="absolute right-3 top-1/2 transform -translate-y-1/2 " />
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-sm text-white mb-2">Recently used</h2>
        <div className="flex items-center  rounded-lg p-3">
          <div className="bg-[#212020] rounded-full p-2 mr-3">
            <img src="/empty-wallet.svg" alt="" />
          </div>
          <div>
            <p className="font-medium">0x41...c866</p>
            <p className="text-sm text-gray-400">Used 2d ago</p>
          </div>
        </div>
      </div>

      <div className="mt-auto px-4 mb-6">
        <button className="w-full bg-[#F33439] text-white py-3 rounded-lg font-bold text-base"
      onClick={() => router.push('/Send/Address/Amount')}  >
          Next
        </button>
      </div>
    </div>
  );
}