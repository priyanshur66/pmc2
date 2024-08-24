import React, { useState } from 'react';
import { HomeIcon, GlobeAltIcon, TrophyIcon } from '@heroicons/react/16/solid';
import Link from 'next/link';

const Navbar = () => {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#323030] text-white flex justify-around items-center py-2 shadow-lg">
        <Link href="/">
        
      <button
        className={`flex flex-col items-center ${activeTab === 'home' ? 'text-red-500' : 'text-gray-400'}`}
        onClick={() => setActiveTab('home')}
      >
        <img src='/Home.svg' alt='' className="h-10 w-10 mb-1" />
        {/* <span className="text-xs">Home</span> */}
      </button>
      </Link>


      {/* <Link href="/Dapps">
      <button
        className={`flex flex-col items-center ${activeTab === 'dapps' ? 'text-red-500' : 'text-gray-400'}`}
        onClick={() => setActiveTab('dapps')}
      >
        <div className="relative">
          <GlobeAltIcon className="h-14 w-14 p-2 rounded-full bg-gradient-to-b from-[#F33439] to-[#F33439]/60 text-white" />
          <span className="absolute inset-0 rounded-full border-2 border-[#F33439]" />
        </div>
        <span className="text-xs mt-1">DApps</span>
      </button>
      </Link> */}

<Link href="/Dapps" className="flex flex-col items-center text-white absolute left-1/2 transform -translate-x-1/2 -translate-y-5 ">
          <div className="bg-gradient-to-b from-[#F33439] to-[#8D1E21] rounded-full p-3 ">
            <img src='/Dapps.svg' alt='' className='w-16 h-16'/>
          </div>
        </Link>


      
      <Link href="/Mission">
      <button
        className={`flex flex-col items-center ${activeTab === 'missions' ? 'text-red-500' : 'text-gray-400'}`}
        onClick={() => setActiveTab('missions')}
      >
        
        <img src='/Mission-icon.svg' className="h-10 w-10 mb-1" />
        {/* <span className="text-xs">Missions</span> */}
      </button>
      </Link>

    </div>
  );
};

export default Navbar;
