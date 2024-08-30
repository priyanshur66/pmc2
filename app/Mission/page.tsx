"use client";
import React from "react";
import { BellIcon, Bars3Icon } from "@heroicons/react/16/solid";
import Navbar from "@/components/Navbar";

interface MissionCardProps {
  title: string;
  description: string;
  reward: string;
  gradientColors: string;
  imageSrc: string;
}

const MissionCard: React.FC<MissionCardProps> = ({
  title,
  description,
  reward,
  gradientColors,
  imageSrc,
}) => {
  return (
    <div 

    className={`bg-gradient-to-r ${gradientColors} rounded-2xl px-2 mb-4`}
    >
    <div className="flex justify-between items-center mb-2">
      <div className="flex flex-col space-x-2">
        <h3 className="font-bold ml-[14px] w-5/6 text-xl " >{title}</h3>
        <p className="text-sm mb-2 mt-4 items-center">{description}</p>

      </div>
      <div className="flex flex-col items-center space-x-1">
        <img src={imageSrc} alt="Flag" className="w-[132px] h-[132px]" />
        <button className="bg-[#F33439] text-white rounded-2xl px-4 py-2 text-sm font-normal mb-2">Start</button>
      </div>
    </div>

  </div>
  );
};

const ZiptosPocket = () => {
  return (
    <div className=" bg-[#0F0F0F] text-white min-h-screen ">
      <div className=" items-center w-full">
        <div className=" bg-gradient-to-b from-[#F33439]/25  to-[#0F0F0F]  inset-0">


          {/* trial */}

            <div className="py-4 ">

          <div className="flex justify-between items-center px-4">
  <div className="flex items-center">
    <img
      src="ziptos.svg"
      alt="Profile"
      className="rounded-full h-4 w-4 mr-2"
    />
    <span className="text-base font-normal">jandounchained</span>
    <img src="/dropdown.svg" alt="" className="ml-4 w-6 h-6" />
  </div>

  <div className="flex items-center space-x-4">
    <img src="/bell.svg" alt="" className="h-6 w-6" />
    <Bars3Icon className="h-6 w-6" />
  </div>
</div>

<div className="flex flex-col items-start px-4">
  <div className="flex flex-col">
    <img src="loading.svg" alt="" className="mt-1 ml-[0.5]" />
    <span className="text-sm font-normal text-white mt-1">
      0.1/10.0 <b>ZPTS</b>
    </span>
  </div>
</div>
</div>

        </div>
      </div>

      <div className="max-w-md mx-auto p-4 rounded-lg">
      <div className="flex items-center space-x-10 mb-2 justify-center mt-6">
  <h2 className="text-white text-base font-bold">Complete your first Mission</h2>
  <div className="flex items-center space-x-1">
    <img src="/ziptos.svg" alt="Flag" className="w-[24px] h-[24px] rounded-full" />
    <span className="text-sm">0.1 ZPTS</span>
  </div>
</div>

<div className="mx-4 mt-4">
<MissionCard
          title="Backup your seed phrase"
          description="Complete this mission to unlock Special mission 2"
          reward="0.1 ZPTS"
          gradientColors="from-[#F33439] to-[#FFCA28]"
          imageSrc="mission.svg"
        />
        <div className="flex justify-end items-center space-x-1 mb-2 mx-4">
    <img src="/ziptos.svg" alt="Flag" className="w-[24px] h-[24px] rounded-full" />
    <span className="text-sm">0.1 ZPTS</span>
  </div>



        {/* <MissionCard
          title="Subscribe to Youtube"
          description="Subscribe to the Ziptos channel on youtube."
          reward="0.1 ZPTS"
          gradientColors="from-[#F33439] to-[#FFCA28]"
          imageSrc="mission.svg"
        /> */}
        <div 

className={`bg-gradient-to-r from-[#F33439] to-[#FFCA28] rounded-2xl p-2 mb-4`}
>
<div className="flex justify-between items-center mb-2">
  <div className="flex flex-col space-x-2">
    <h3 className="font-bold ml-[14px] w-5/6 text-xl mt-2" >Subscribe to Youtube</h3>
    <p className="text-sm mb-2 mt-4 items-center">Subscribe to the Ziptos channel on youtube.
    </p>

  </div>
  <div className="flex flex-col items-center space-x-1">
    {/* <img src={imageSrc} alt="Flag" className="w-[132px] h-[132px]" /> */}
    <button className="bg-[#F33439] text-white rounded-2xl px-4 py-2 text-sm font-normal">Start</button>
  </div>
</div>

</div>
  
</div>




      </div>

      <Navbar />
    </div>
  );
};

export default ZiptosPocket;
