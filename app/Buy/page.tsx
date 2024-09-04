"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "react-feather";
import dynamic from 'next/dynamic';
import { useState } from "react";

const MoonPayBuyWidget = dynamic(
  () => import('@moonpay/moonpay-react').then((mod) => mod.MoonPayBuyWidget),
  { ssr: false }
);

const MoonPayProvider = dynamic(
  () => import('@moonpay/moonpay-react').then((mod) => mod.MoonPayProvider),
  { ssr: false }
);
function ComingSoonPage() {

  const [visible, setVisible] = useState(false)

  const router = useRouter();



  return (
    
    <MoonPayProvider
    apiKey="pk_test_CiQCSl011smuhjyiYH6YRcdQRBrUw3"
    debug
>

<div className="bg-[#323030] min-h-screen text-white p-4">
      <div className="mb-4 flex items-center">
      <button onClick={() => router.back()} className="text-white">
          {/* Back Arrow Icon */}
          <ArrowLeft className="mr-4" />

        </button>
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 flex ">
      <p className="text-white font-bold text-lg ">
          Select Token
        </p>
      </div>      
      </div>
      
      <div className="flex justify-between items-center mt-10 mb-5 z-[1] space-y-4 ">
            <div className="relative w-full">
              <img
                src="/search.svg"
                alt=""
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
              />
              <input
                type="text"
                placeholder="Search ..."
                className="w-full py-2 pl-10 rounded-2xl bg-[#212020] border border-[#5E5E5E] text-white placeholder-white focus:outline-none"
              />
            </div>
          </div>

          <p className="text-white ml-2"> Please select payment method</p>

          <div className="bg-[#484848] mt-3 rounded-2xl p-6 flex flex-col justify-between items-center mb-4 shadow-lg">
  <div className="flex flex-col items-center">
    <div className="flex items-center mb-4">
      <img
        src="/moon.svg"
        alt=""
        className="w-[46px] h-[46px] rounded-full mr-4 mb-4"
      />
      <div>
        <h2 className="text-lg font-bold">Moonpay</h2>
        <p className="text-sm text-white">
          Buy with credit card, bank transfer, or Apple pay
        </p>
      </div>
    </div>
    <button
      className="bg-red-500 hover:bg-red-600 text-white text-base font-bold py-3 px-8 w-[90%] rounded-lg"
      onClick={() => setVisible(!visible)}
    >
      Continue to Moonpay
    </button>
  </div>
</div>

          <MoonPayBuyWidget
    variant="overlay"
    baseCurrencyCode="usd"
    baseCurrencyAmount="100"
    defaultCurrencyCode="eth"
    visible={visible}
/>

    
    </div>
    </MoonPayProvider>

  );
}
  

export default ComingSoonPage;


    {/* <button onClick={() => setVisible(!visible)}>
      Toggle widget
    </button> */}



// </div>
// </MoonPayProvider>