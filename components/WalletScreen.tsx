import React from 'react';

const WalletScreen = () => {
  return (
    <div className="bg-black text-white h-screen flex flex-col items-center px-4 py-2 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <button className="text-xl font-bold">Cancel</button>
        <div className="flex items-center space-x-2">
          <p className="font-semibold">Ziptos Pocket</p>
          <button className="text-xl">&#x2026;</button> {/* Three dots icon */}
        </div>
      </div>

      {/* Profile Section */}
      <div className="flex flex-col items-center space-y-2">
        <div className="w-12 h-12 bg-red-500 rounded-full"></div> {/* Placeholder for profile image */}
        <p className="font-semibold">jandounchained</p>
        <p className="text-xs text-gray-400">0x418...C8661</p>
      </div>

      {/* Main Balance */}
      <div className="bg-gray-800 rounded-lg w-full p-4 flex items-center justify-between">
        <p className="text-lg font-semibold">Main Balance</p>
        <p className="text-2xl font-bold">$2,172.38</p>
        <button className="text-xl">&#128065;</button> {/* Eye icon */}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between w-full space-x-4">
        <button className="flex flex-col items-center space-y-1 text-center">
          <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">&#x27A1;</div> {/* Arrow icon */}
          <p className="text-xs">Send</p>
        </button>
        <button className="flex flex-col items-center space-y-1 text-center">
          <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">&#x25B6;</div> {/* Request icon */}
          <p className="text-xs">Request</p>
        </button>
        <button className="flex flex-col items-center space-y-1 text-center">
          <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">&#x24;</div> {/* Dollar icon */}
          <p className="text-xs">Buy</p>
        </button>
        <button className="flex flex-col items-center space-y-1 text-center">
          <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">&#x1F4CB;</div> {/* Activity icon */}
          <p className="text-xs">Activity</p>
        </button>
      </div>

      {/* Advertisement Section */}
      <div className="bg-red-600 w-full h-24 rounded-lg relative">
        <p className="absolute bottom-2 right-2 bg-white text-black px-2 py-1 rounded-full">Exclusive</p>
      </div>

      {/* Token Information */}
      <div className="bg-gray-800 rounded-lg w-full p-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-gray-600 rounded-full"></div> {/* Placeholder for token icon */}
          <p className="font-semibold">Aptos</p>
        </div>
        <p className="text-xl font-bold">$2,142.28</p>
        <p className="text-sm text-green-400">+0.91%</p>
      </div>

      {/* Footer */}
      <div className="flex justify-between w-full mt-auto">
        <button className="flex-1 text-center py-2">Home</button>
        <button className="flex-1 text-center py-2 bg-red-600 rounded-lg">DApps</button>
        <button className="flex-1 text-center py-2">Missions</button>
      </div>
    </div>
  );
};

export default WalletScreen;
