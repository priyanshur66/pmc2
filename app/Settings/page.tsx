"use client"
// import AccountDetails from "@/components/AccountDetails";
import React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "react-feather";

function SettingsPage() {

  const [choose, setChoose] = useState(true);
  const router = useRouter();






  const menuItems = [
    {
      icon: "/ziptos.svg",
      text: "Account details",
      route:"/Settings/Account",
    },
    {
      icon: "/lang.svg",
      text: "Language",
      route:"/Account",
    },
    {
      icon: "/seed.svg",
      text: "Seed Phrase & Private key",
      route:"/Settings/Seed",

    },
    {
      icon: "/key.svg",
      text: "Keyless connect",
      route:"/Account",

    },
    {
      icon: "/help.svg",
      text: "Help & support",
      route:"/Account",

    },
    {
      icon: "/telegram.svg",
      text: "Telegram",
      route:"/Account",

    },
    {
      icon: "/twitter.svg",
      text: "X (formerly Twitter)",
      route:"/Account",

    },
  ];



  return (
    <>
    <div className= {`h-screen bg-[#323030] text-white px-4 `}>
      {/* Back button */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => router.back()} className="text-white">
          {/* Back Arrow Icon */}
          <ArrowLeft className="mr-4" />
        </button>
        <h1 className="text-xl font-bold text-white py-6">Settings</h1>
        <div className="w-6 h-6" /> {/* Placeholder for alignment */}
      </div>

      {/* Header */}
      {/* <div className="flex justify-center py-6">
        <h1 className="text-lg font-semibold">Settings</h1>
      </div> */}

      {/* Menu Items */}
      <div className="space-y-2">
        {menuItems.slice(0, 5).map((item, index) => (
          
          <div
            key={index}
            className={`flex items-center px-4 py-3 rounded-lg `} 
            onClick={() => router.push(item.route)}
          
          >
            <img src={item.icon} alt="" className="w-6 h-6 mr-4" />
            <span className="flex-1 font-semibold">{item.text}</span>
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5l7 7-7 7"
              ></path>
            </svg>
          </div>
          
        ))}

        <hr className="border-gray-700 my-4" />

        {menuItems.slice(5).map((item, index) => (
          <div
            key={index}
            className="flex items-center px-4 py-3 rounded-lg hover:bg-gray-800"
          


          >
            <img src={item.icon} alt="" className="w-6 h-6 mr-4" />
            <span className="flex-1">{item.text}</span>
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5l7 7-7 7"
              ></path>
            </svg>
          </div>
        ))}
      </div>
      
    </div>
</>
  );
}

export default SettingsPage;
