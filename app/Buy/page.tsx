"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "react-feather";
import dynamic from 'next/dynamic';
import { useState } from "react";
import { MoonPayBuyWidget, MoonPayProvider } from '@moonpay/moonpay-react';


function ComingSoonPage() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);


  return (
    <MoonPayProvider
    apiKey="pk_test_CiQCSl011smuhjyiYH6YRcdQRBrUw3"
    debug
>

    <div className="h-screen flex flex-col justify-center items-center bg-[#323030] text-center px-4">
      {/* Back button */}
      <div className="absolute top-4 left-4" >
      <button onClick={() => router.back()} className="text-white">
          {/* Back Arrow Icon */}
          <ArrowLeft className="mr-4" />

        </button>
      </div>

      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 flex">
      <p className="text-white font-semibold text-lg">
          Choose payment method
        </p>
      </div>

      <div className="absolute top-20 inset-x-0 flex justify-center">
        {/* <div className="w-3/4">
          <input
            type="text"
            placeholder="Search ..."
            className="w-full px-4 py-2 rounded-full bg-[#0F0F0F] text-white placeholder-gray-500"
          />
        </div> */}
                    {/* <div className="relative w-[90%]">
              <img
                src="/search.svg"
                alt=""
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
              />
              <input
                type="text"
                placeholder="Search ..."
                className="w-full p-2 pl-10 rounded-2xl bg-[#212020] text-white placeholder-white focus:outline-none border border-[#5E5E5E]"
              />
            </div> */}
      </div>

      {/* <div className="mt-32">
        <div className="flex justify-center mb-6">
          <img src="/clock.svg" alt="" />
          
        </div>
        <p className="text-white font-semibold text-lg">Coming Soon</p>
        <p className="text-gray-400 mt-2">
          Please be patient while we curate these features shortly
        </p>
      </div> */}
      <MoonPayBuyWidget
            variant="overlay"
            baseCurrencyCode="usd"
            baseCurrencyAmount="100"
            defaultCurrencyCode="eth"
            visible
        />

    {/* <button onClick={() => setVisible(!visible)}>
      Toggle widget
    </button> */}
    </div>
    </MoonPayProvider>

  );
  
}

export default ComingSoonPage;
