"use client"
import React from 'react';
import { BellIcon, Bars3Icon } from '@heroicons/react/16/solid';
import Navbar from '@/components/Navbar';

interface MissionCardProps {
    title: string;
    description: string;
    reward: string;
    gradientColors: string;
    imageSrc: string;
  }

const MissionCard: React.FC<MissionCardProps> = ({ title, description, reward, gradientColors, imageSrc }) => {
    return (
      <div className={`bg-gradient-to-r ${gradientColors} rounded-lg p-4 flex justify-between items-center shadow-lg mb-4`}>
        <div>
          <h2 className="text-lg font-bold">{title}</h2>
          <p className="text-sm">{description}</p>
          <div className="flex items-center mt-2">
            <img src={imageSrc} alt="reward icon" className="w-50 h-40 mr-1" />
            <span>{reward}</span>
          </div>
        </div>
        <button className="bg-red-600 text-white rounded-full px-4 py-2">Start</button>
      </div>
    );
  };
  
const ZiptosPocket = () => {
  return (
<div className=" bg-gradient-to-b from-gray-800 to-black text-white h-screen items-center w-full px-4 py-6 space-y-4">
{/* Header */}
    

      {/* User Info */}
      {/* <div className="w-full px-4 py-4 flex flex-col items-center border-b border-gray-700">
        <div className="flex items-center w-full">
          <span className="text-xl font-bold">jandounchained</span>
          <button className="ml-2 text-gray-400">▼</button>
        </div>
        <div className="w-full bg-gray-600 h-2 rounded-full mt-2">
          <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '10%' }}></div>
        </div>
        <div className="w-full flex justify-between items-center mt-2">
          <span>0.1/10.0 ZPTS</span>
          <button className="text-gray-400">
            <i className="fas fa-bell"></i>
          </button>
        </div>
      </div> */}
        <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <img
            src="ziptos.svg"
            alt="Profile"
            className="rounded-full h-10 w-10 mr-2"
          />
          <div>
            <div className="flex items-center">
            {/* <img src="ziptos.svg" alt="" height={4} width={4} /> */}

              <span className="text-sm font-medium">jandounchained</span>
              <svg
                className="ml-1 h-4 w-4 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <img src="loading.svg" alt="" className='p-2' />
            <span className="text-s text-white">0.1/10.0 <b>ZPTS</b> </span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <BellIcon className="h-6 w-6" />
          <Bars3Icon className="h-6 w-6" />
        </div>
      </div>

      <div className=" min-h-screen text-white p-4">
      <h3 className="text-lg font-semibold mb-4">Complete your first Mission</h3>
      
      <MissionCard 
        title="Backup your seed phrase"
        description="Complete this mission to unlock Special mission 2"
        reward="0.1 ZPTS"
        gradientColors="from-red-500 to-orange-500"
        imageSrc="mission.svg"
      />
      
      <MissionCard 
        title="Subscribe to Youtube"
        description="Subscribe to the Ziptos channel on youtube."
        reward="0.1 ZPTS"
        gradientColors="from-orange-500 to-yellow-500"
        imageSrc="mission.svg"
      />
    </div>

        <Navbar/>
    </div>
  );
};

export default ZiptosPocket;
