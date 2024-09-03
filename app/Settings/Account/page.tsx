"use client";
import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "react-feather";
import WebApp from "@twa-dev/sdk";
import { useState, useEffect } from "react";

interface UserData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code: string;
  is_premium?: boolean;
}
const AccountDetails = () => {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null)

  useEffect(() =>{
    if (typeof window !== 'undefined') {

    if (WebApp.initDataUnsafe.user) {
      setUserData(WebApp.initDataUnsafe.user as UserData)
    } 
 } })



  const accounts = [
    {
      name: "",
      address: "0x41...c866",
      icon: "/ziptos.svg", // Replace with your actual icon path
      isSelected: true,
    },
  ];

  return (
    <div className="bg-[#323030] min-h-screen p-4">
    <div className="flex items-center justify-between mb-4">
        <button onClick={() => router.back()} className="text-white">
          {/* Back Arrow Icon */}
          <ArrowLeft className="mr-4" />
        </button>
        <h1 className="text-xl font-bold text-white">Account</h1>
        <div className="w-6 h-6" /> {/* Placeholder for alignment */}
      </div>

      {accounts.map((account, index) => (
        <div
          key={index}
          className="flex items-center mt-12 justify-between p-4 bg-[#4D4D4D] rounded-xl mb-4"
        >
          <div className="flex items-center">
            <Image
              src={account.icon}
              alt={account.name}
              width={40}
              height={40}
              className="rounded-full"
            />
            <div className="ml-4">
              <p className="text-white font-semibold">{userData?.username || 'N/A'}</p>
              <p className="text-gray-400">{account.address}</p>
            </div>
          </div>
          {account.isSelected && (
            <div className="text-green-500">
              {/* Check Mark Icon */}
              <img src="/success.svg" alt="" />
            </div>
          )}
        </div>
      ))}

      <div
        className="flex items-center mt-6 p-4 bg-[#383838] border border-solid border-[#747474]  rounded-xl cursor-pointer"
        onClick={() => router.push("/Settings/Account/Add")}
      >
        <div className="flex items-center text-gray-400">
          {/* Add Account Icon */}
          <img src="/add.svg" />
          <span className="ml-8">Add Account</span>
        </div>
      </div>
    </div>
  );
};

export default AccountDetails;
