"use client"

import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { ArrowLeft } from "react-feather";

function SelectTokenPage() {
  // const tokens = [
  //   { icon: '/aptos.svg', name: 'APT', description: 'Aptos', enabled: true },
  //   { icon: '/btc.svg', name: 'BTC', description: 'Bitcoin', enabled: false },
  //   { icon: '/eth.svg', name: 'ETH', description: 'Ethereum', enabled: false },
  //   { icon: '/sol.svg', name: 'SOL', description: 'Solana', enabled: false },
  //   { icon: '/dash.svg', name: 'DASH', description: 'Dash', enabled: false },
  //   { icon: '/bnb.svg', name: 'BNB', description: 'Binance BNB', enabled: false },
  //   { icon: '/near.svg', name: 'NEAR', description: 'Near Protocol', enabled: false },
  //   { icon: '/akt.svg', name: 'AKT', description: 'Akash Network', enabled: false },
  // ];

  const [tokens, setTokens] = useState([
    { icon: '/aptos.svg', name: 'APT', description: 'Aptos', enabled: true },
    { icon: '/btc.svg', name: 'BTC', description: 'Bitcoin', enabled: false },
    { icon: '/eth.svg', name: 'ETH', description: 'Ethereum', enabled: false },
    { icon: '/sol.svg', name: 'SOL', description: 'Solana', enabled: false },
    { icon: '/dash.svg', name: 'DASH', description: 'Dash', enabled: false },
    { icon: '/bnb.svg', name: 'BNB', description: 'Binance BNB', enabled: false },
    { icon: '/near.svg', name: 'NEAR', description: 'Near Protocol', enabled: false },
    { icon: '/akt.svg', name: 'AKT', description: 'Akash Network', enabled: false },
  ]);


  const router = useRouter();

  const toggleToken = useCallback((index: number) => {
    setTokens((prevTokens) => {
      const newTokens = [...prevTokens];
      newTokens[index] = { ...newTokens[index], enabled: !newTokens[index].enabled };
      console.log(`Toggled token at index ${index}:`, newTokens[index]);
      return newTokens;
    });
  }, []);

  return (
    <div className="h-screen bg-[#323030] text-white p-4">
      {/* Back button */}
      <div className="mb-4 flex items-center">
      <button onClick={() => router.back()} className="text-white">
          {/* Back Arrow Icon */}
          <ArrowLeft className="mr-4" />

        </button>
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 flex ">
      <p className="text-white font-bold text-lg ">
          Select Network
        </p>
      </div>      
      </div>
     

      {/* Search Box */}
      <div className="flex justify-between items-center mt-10 mb-3 z-[1] space-y-4">
            <div className="relative w-full">
              <img
                src="/search.svg"
                alt=""
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
              />
              <input
                type="text"
                placeholder="Search ..."
                  className="w-full py-2 pl-10 rounded-2xl bg-[#212020] text-white placeholder-white focus:outline-none border border-[#5E5E5E]"
              />
            </div>
          </div>

      {/* Token List */}
      <div className="space-y-2 ">

        {tokens.map((token, index) => (
          <div key={index} className="flex items-center justify-between px-4 py-3 rounded-2xl bg-[#4848484F]">
            <div className="flex items-center">
              <img src={token.icon} alt={token.name} className="w-8 h-8 mr-4" />
              <div>
                <p className="font-bold text-lg">{token.name}</p>
                <p className="text-white text-sm">{token.description}</p>
              </div>
            </div>
 <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={token.enabled}
                onChange={() => {
                  console.log(`Toggling ${token.name}`);
                  toggleToken(index);
                }}
              />
              <div className={`relative w-11 h-6 rounded-full peer 
                peer-focus:ring-4 peer-focus:ring-red-300 
                dark:peer-focus:ring-red-800 
                after:content-[''] after:absolute after:top-0.5 
                after:start-[2px] after:bg-[#212020] after:border-gray-300 
                after:border after:rounded-full after:h-5 after:w-5 
                after:transition-all dark:border-gray-600 
                ${token.enabled ? 'bg-red-600' : 'bg-[#212020] dark:bg-[#B5B5B5]'}
                ${token.enabled ? ' after:translate-x-full rtl:after:-translate-x-full' : ''}`}>
              </div>
            </label>

          </div>
        ))}
      </div>
    </div>
  );
}

export default SelectTokenPage;
