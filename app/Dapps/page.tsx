"use client";
import Navbar from "@/components/Navbar";
import React from "react";
import { useRouter } from "next/navigation";
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
    <div className="bg-gray-800 rounded-lg p-4 flex justify-between items-center mb-4 shadow-lg">
      <div className="flex items-center">
        <img
          src={iconSrc}
          alt={`${name} icon`}
          className="w-10 h-10 rounded-full mr-4"
        />
        <div>
          <h2 className="text-lg font-semibold">{name}</h2>
          <p className="text-sm text-gray-400">
            {price}{" "}
            <span
              className={changePositive ? "text-green-500" : "text-red-500"}
            >
              {change}
            </span>
          </p>
        </div>
      </div>
      <span className="text-gray-400 font-bold">{symbol}</span>
    </div>
  );
};
const page = () => {
  return (
    <div className=" bg-gradient-to-b from-gray-800 to-black text-white h-screen items-center w-full px-4 py-6 space-y-4">
      <div className=" min-h-screen text-white p-4">
        {/* Search Bar */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search or enter dApp URL"
            className="w-full p-2 rounded-lg bg-gray-800 text-gray-400 placeholder-gray-500 focus:outline-none"
          />
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-4 mb-4">
          <button className="text-white border-b-2 border-red-500 pb-1">
            Swap
          </button>
          <button className="text-gray-400">DE-Fi</button>
          <button className="text-gray-400">Game-Fi</button>
          <button className="text-gray-400">Socials</button>
          <button className="text-gray-400">Marketplace</button>
        </div>

        {/* DApp Card */}
        <div className="bg-gray-800 rounded-lg p-4 flex justify-between items-center">
          <div className="flex items-center">
            <img
              src="ziptos.svg"
              alt="DApp Icon"
              className="w-10 h-10 rounded-full mr-4"
            />
            <div>
              <h2 className="text-lg font-semibold">Ziployer</h2>
              <p className="text-sm text-gray-400">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              </p>
            </div>
          </div>
          <button className="text-red-500">
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center mt-4">
          <span className="h-2 w-2 bg-red-500 rounded-full mx-1"></span>
          <span className="h-2 w-2 bg-gray-400 rounded-full mx-1"></span>
          <span className="h-2 w-2 bg-gray-400 rounded-full mx-1"></span>
        </div>

        <div className="min-h-screen text-white p-4">
          <h3 className="text-lg font-semibold mb-4">Top DApp tokens</h3>

          <TokenCard
            name="Bitcoin"
            symbol="BTC"
            price="$61,052.45"
            change="+0.60%"
            iconSrc="btc.svg"
            changePositive={true}
          />

          <TokenCard
            name="Ethereum"
            symbol="ETH"
            price="$2,614.57"
            change="+0.58%"
            iconSrc="eth.svg"
            changePositive={true}
          />

          <TokenCard
            name="Aptos"
            symbol="APT"
            price="$6.27"
            change="+9.74%"
            iconSrc="aptos.svg"
            changePositive={true}
          />
        </div>
      </div>

      <Navbar />
    </div>
  );
};

export default page;
