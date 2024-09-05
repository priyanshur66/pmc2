"use client";
import Navbar from "@/components/Navbar";
import React from "react";
import NavforDapps from "@/components/NavforDapps";
import { useState, useRef, useEffect } from "react";
import SwipeNavigator from "@/components/SwipeNavigator";
interface TokenCardProps {
  name: string;
  symbol: string;
  price: string;
  change: string;
  iconSrc: string;
  changePositive: boolean;
}

function Layout({ children }: { children: React.ReactNode }) {
  const [scrollY, setScrollY] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const deltaY = startY - e.touches[0].clientY;
    setScrollY((prevScrollY) => {
      const newScrollY = prevScrollY + deltaY;
      return Math.max(0, newScrollY);
    });
    setStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = scrollY;
    }
  }, [scrollY]);
  return (
    <div className="bg-[#0F0F0F] min-h-screen text-white">
      <div className="items-center w-full">

        <div className=" bg-gradient-to-b from-[#F33439]/25  to-[#0F0F0F]  inset-0">
          {/* <div className="mb-4"> */}
          <div className="flex justify-between items-center mb-4 z-[1] px-4 py-6 space-y-4">
            <div className="relative w-full">
              <img
                src="/search.svg"
                alt=""
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
              />
              <input
                type="text"
                placeholder="Search or enter dApp URL"
                className="w-full p-2 pl-10 rounded-lg bg-[#323030] text-white placeholder-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <NavforDapps />

        {/* DApp Card */}
        <div 
        className="flex-grow overflow-hidden"
        ref={contentRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex flex-col">{children}</div>
      </div>

      <Navbar />
    </div>
    </div>
  );
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
    <div className="bg-[#4848487A] rounded-lg p-4 flex justify-between items-center mb-4 shadow-lg">
      {/* <div className="bg-gradient-to-b from-[#F33439]/25  to-[#0F0F0F]  inset-0"> */}

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
      {/* </div> */}

      <span className="text-white font-bold">{symbol}</span>
    </div>
  );
};

const page = () => {
  return (
    <SwipeNavigator currentPage="swap">
    <Layout>
      <div className="px-4 py-2 space-y-4">
        <div className="bg-[#4848487A] rounded-xl p-4 flex justify-between items-center ">
          <div className="flex items-center ">
            <img
              src="ziptos.svg"
              alt="DApp Icon"
              className="w-12 h-12 rounded-full mr-4"
            />
            <div>
              <h2 className="text-lg font-bold">Zipswap</h2>
              <p className="text-sm text-gray-200 font-extralight">
              Fastest telegram based swap{" "}
              </p>
            </div>
          </div>
          <img src="/arrow.svg" alt="" />

          <button className="text-red-500">
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
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
    </Layout>
    </SwipeNavigator>
  );
};

export default page;
