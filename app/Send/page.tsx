"use client"
import React from 'react';
import { useRouter } from "next/navigation";
import { ArrowLeft, Link } from "react-feather";

interface TokenCardProps {
    name: string;
    symbol: string;
    price: string;
    change: string;
    iconSrc: string;
    changePositive: boolean;
  }

const TokenCard: React.FC<TokenCardProps> = ({
    name,
    symbol,
    price,
    change,
    iconSrc,
    changePositive,
  }) => {
    return (
            
      <div className="bg-[#484848] rounded-2xl p-4 flex justify-between items-center mb-4 shadow-lg">
          <a href='/Send/Address'>
        <div className="flex items-center">
          <img
            src={iconSrc}
            alt={`${name} icon`}
            className="w-12 h-12 rounded-full mr-4"
          />
          <div>
            <h2 className="text-lg font-bold">{name}</h2>
            <p className="text-sm text-white">
              {price}{" "}
              <span
                className={changePositive ? "text-green-500" : "text-red-500"}
              >
                {change}
              </span>
            </p>
          </div>
        </div>
        </a>

        <div className='flex flex-col'>
        {/* <span className="text-white font-bold text-end">{symbol}</span> */}
        {/* <span className='text-white'>$0.00</span> */}
        </div>

      </div>
      


    );
  };

const Send = () => {

    const router = useRouter();

  return (
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
      {/* <div className="mb-4 mt-6">
        <button className="flex items-center bg-[#434343] rounded-2xl px-4 py-2">
            <img src="/i.svg" alt=""/>
          <span className="flex-grow text-left ml-2">All Networks</span>
          <img src='/dropdown.svg' alt='' className='ml-4'/>
        </button>
      </div> */}


    <TokenCard
          name="APT"
          symbol="0"
          price="521.90 APT"
          change=""
          iconSrc="aptos.svg"
          changePositive={true}

        />

        <TokenCard
          name="APT"
          symbol="0"
          price="521.90 APT"
          change=""
          iconSrc="aptos.svg"
          changePositive={true}
        />

        <TokenCard
          name="APT"
          symbol="0"
          price="521.90 APT"
          change=""
          iconSrc="aptos.svg"
          changePositive={true}
        />
    </div>
  );
};

export default Send;