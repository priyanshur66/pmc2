import React from 'react';

function SelectTokenPage() {
  const tokens = [
    { icon: '/aptos.svg', name: 'APT', description: 'Aptos', enabled: true },
    { icon: '/btc.svg', name: 'BTC', description: 'Bitcoin', enabled: false },
    { icon: '/eth.svg', name: 'ETH', description: 'Ethereum', enabled: false },
    { icon: '/sol.svg', name: 'SOL', description: 'Solana', enabled: false },
    { icon: '/dash.svg', name: 'DASH', description: 'Dash', enabled: false },
    { icon: '/bnb.svg', name: 'BNB', description: 'Binance BNB', enabled: false },
    { icon: '/near.svg', name: 'NEAR', description: 'Near Protocol', enabled: false },
    { icon: '/akt.svg', name: 'AKT', description: 'Akash Network', enabled: false },
  ];

  return (
    <div className="h-screen bg-[#323030] text-white px-4">
      {/* Back button */}
      <div className="absolute top-4 left-4">
        <button className="text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>
      </div>

      {/* Header */}
      <div className="flex justify-center py-6">
        <h1 className="text-lg font-semibold">Select Token</h1>
      </div>

      {/* Search Box */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search ..."
          className="w-full px-4 py-2 rounded-full bg-[#212020] text-white placeholder-gray-500"
        />
      </div>

      {/* Token List */}
      <div className="space-y-2 ">
        {tokens.map((token, index) => (
          <div key={index} className="flex items-center justify-between px-4 py-3 rounded-lg bg-[#4848484F]">
            <div className="flex items-center">
              <img src={token.icon} alt={token.name} className="w-8 h-8 mr-4" />
              <div>
                <p className="font-semibold">{token.name}</p>
                <p className="text-gray-400 text-sm">{token.description}</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={token.enabled} readOnly />
              <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-focus:ring-4 peer-focus:ring-red-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SelectTokenPage;
