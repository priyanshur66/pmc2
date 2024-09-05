"use client";
import React from "react";
import Navbar from "./Navbar";
import {
  Bars3Icon,
  EllipsisVerticalIcon,
} from "@heroicons/react/16/solid";
import { useState, useEffect } from "react";
import Link from "next/link";
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { getDoc, setDoc } from "firebase/firestore";
import db from "@/firebaseConfig";
import WebApp from "@twa-dev/sdk";
import axios from 'axios';

import {
  Account,
  AccountAddress,
  AnyNumber,
  Aptos,
  AptosConfig,
  InputViewFunctionData,
  Network,
  NetworkToNetworkName,
  CreateEd25519AccountFromPrivateKeyArgs,
  Ed25519PrivateKey,
  Ed25519Account,
  U8,
} from "@aptos-labs/ts-sdk";
import crypto from 'crypto';



interface UserData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code: string;
  is_premium?: boolean;
}

interface MyData {
  id: string;
  publicKey: string;
  userName: number;
  iv: string;
  referralLink: string;
  referredBy: string;
  encryptedData: string;
}


type TabType = 'Tokens' | 'NFTs';


interface TabContentProps {
  activeTab: TabType;
}


function encrypt(text: string, key: Buffer, iv: Buffer) {
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encryptedData = cipher.update(text, 'utf8', 'hex');
  encryptedData += cipher.final('hex');
  return {
    iv: iv.toString('hex'),
    encryptedData: encryptedData,
  };
}


const TabContent: React.FC<TabContentProps> = ({ activeTab }) => {
  const [price, setPrice] = useState(null);
  const [pnl, setPnl] = useState(null);


  useEffect(() => {
    const fetchPriceAndPnl = async () => {
      try {
        const response = await axios.get(
          'https://api.coingecko.com/api/v3/coins/markets',
          {
            params: {
              vs_currency: 'usd',
              ids: 'aptos',
            },
          }
        );

        const coinData = response.data[0];
        setPrice(coinData.current_price);
        setPnl(coinData.price_change_percentage_24h);
      } catch (error) {
        console.error('Error fetching APT price and PnL:', error);
      }
    };

    fetchPriceAndPnl();
  }, []);


  if (activeTab === 'Tokens') {
    return (
      <div className="flex items-center justify-between">
         <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-[url('../public/aptos.svg')] rounded-full"></div>{" "}
              <div className="grid-rows-2">
                <p className="font-semibold px-4 text-xl">Aptos</p>
                <p className="font-light px-4 text-s mt-1">
                  ${price}
                  <span className={pnl !== null && pnl >= 0 ? 'ml-1 text-green-500' : 'ml-1 text-red-500'}>
                  {pnl !== null ?  String(pnl).slice(0, 4) : 'N/A'}%
                  </span>
                  
                </p>

              </div>
            </div> 
            <div className="flex flex-col items-end">
              <p className="text-xl font-bold">100 APT</p>
              <p className="text-lg font-light">
              ${Number(price || 0) * 100}              </p>
            </div>
      </div>

            

    );
  
  }
  return <p className="text-[#9F9F9F] text-base font-light text-center py-4">You don&apos;t have any NFTs yet</p>;
};


const WalletScreen = () => {
  const [activeTab, setActiveTab] = useState<TabType>('Tokens');
  const [userData, setUserData] = useState<UserData | null>(null)
  const [data, setData] = useState<MyData[]>([]);
  const [isBalanceVisible, setIsBalanceVisible] = useState(true); // State to control balance visibility
  const crypto = require('crypto');
  const algorithm = 'aes-256-cbc';
  const key = crypto.createHash('sha256').update('KEY').digest(); // Create a 32-byte key from the string
  const iv = crypto.randomBytes(16);




  useEffect(() =>{
    if (typeof window !== 'undefined') {

    if (WebApp.initDataUnsafe.user) {
      setUserData(WebApp.initDataUnsafe.user as UserData)
    } 
 } })
  
  
    console.log(userData?.id)

    useEffect(() => {
      const fetchData = async (msg: any) => {
        try {
          if (userData?.id) {
            const querySnapshot = await getDocs(collection(db, "walletUsers"));
            const matchedData = querySnapshot.docs
              .map((doc) => ({
                id: doc.id,
                ...doc.data(),
              }))
              .filter((doc) => doc.id === String(userData.id)) as MyData[];
      
            setData(matchedData);
          }
          else {


            const walletRef = doc(db, 'walletUsers', (msg.chat.id).toString());
            const docSnap = await getDoc(walletRef);
        
            if (!docSnap.exists()) {
              const bob = Account.generate();
              const encrypted = encrypt(bob.privateKey.toString(),key, iv);
        
              const referredBy = msg.text.split(" ")[1] || null;
        
              // Generate unique referral link
              const userReferralLink = `https://t.me/ZiptosWalletBot?start=${msg.chat.id}`;
        
              const dataToStore: any = {
                publicKey: bob.accountAddress.toString(),
                telegramId: msg.chat.id,
                iv: encrypted.iv,
                encryptedData: encrypted.encryptedData,
                referralLink: userReferralLink,
                referredBy: referredBy,
              };
        
        
              // Check if username exists, then add it to the stored data
              if (msg.chat.username) {
                dataToStore.userName = msg.chat.username;
              }
      
              await setDoc(walletRef, dataToStore, { merge: true });
            }
          }
        } catch (error) {
          console.error("Error fetching data: ", error);
        }
      };

      const msg = {
        chat: {
          id: userData?.id,
          username: userData?.username || 'N/A',
        },
        text: '', // Set appropriate text if needed
      };
  
      fetchData(msg);
    }, [userData]);
  
    const toggleBalanceVisibility = () => {
      setIsBalanceVisible(!isBalanceVisible); // Toggle balance visibility
    };


  
  return (
    <div>
      <div>
        <div className=" bg-gradient-to-b from-[#F33439]/25  to-[#0F0F0F]  inset-0">
          <div className="flex justify-between items-center mb-4 z-[1] px-4 py-6 space-y-4">
            <div className="flex items-center ">
              <img
                src="ziptos.svg"
                alt="Profile"
                className="rounded-full h-10 w-10 mr-2"
              />
              <div>
                <div className="flex items-center ml-2">
                  <span className="text-lg font-medium">{userData?.username || 'N/A'}</span>
                  <img src="/dropdown.svg" alt="" className="ml-4 w-6 h-6" />
                </div>
                <div className="flex ml-2">
                       {data.length > 0 ? (
  <span
    key={data[0].id}
    className="text-s text-white font-extralight mt-1"
  >
    {data[0].publicKey.slice(0, 6)}...{data[0].publicKey.slice(-4)}
  </span>
) : (
  <span className="text-s text-white font-extralight mt-1">
    Loading...
  </span>
)}


                  <img src="/copy.svg" alt="" className="ml-2" />
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <img src="/bell.svg" alt="" className="mb-1 h-6 w-6" />
              <Link href="/Settings">
                <Bars3Icon className="h-6 w-6" />
              </Link>
            </div>
          </div>
        </div>
        <div className="px-4 mb-4 space-x-4">
          <div className="bg-[#323030]/40 p-6 mx-4 rounded-xl flex justify-between items-center">
            <div>
              <span className="text-xl text-green-400">Main Balance</span>
              <h2 className="text-4xl mt-1 font-semibold">
              {isBalanceVisible ? "$2,172.38" : "*****"}
              </h2>
            </div>
            <img src="/eye.svg" alt="" className="h-6 w-6"
                          onClick={toggleBalanceVisibility}
                          />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between w-full space-x-4 px-4 py-4">
          <button className="flex flex-col items-center space-y-1 text-center">
            <Link href="/Send">
              <div className="w-20 h-20 bg-[#323030]/40 border border-[#424242] shadow-lg shadow-[#F4A100]/15 rounded-full flex items-center justify-center">
                <img src="/send.svg" alt="" />
              </div>{" "}
              {/* Arrow icon */}
              <p className="text-s">Send</p>
            </Link>
          </button>

          <button className="flex flex-col items-center space-y-1 text-center">
            <Link href="/Receive">
              <div className="w-20 h-20 bg-[#323030]/40  border border-[#424242] shadow-lg shadow-[#F4A100]/15 rounded-full flex items-center justify-center">
                <img src="/send.svg" alt="" className="transform rotate-180" />
              </div>{" "}
              {/* Request icon */}
              <p className="text-s mt-1">Request</p>
            </Link>
          </button>
          <button className="flex flex-col items-center space-y-1 text-center">
            <Link href="/Buy">
              <div className="w-20 h-20 bg-[#323030]/40  border border-[#424242] shadow-lg shadow-[#F4A100]/15 rounded-full flex items-center justify-center">
                <img src="/Vector.svg" alt="" />
              </div>{" "}
              {/* Dollar icon */}
              <p className="text-s mt-1">Buy</p>
            </Link>
          </button>
          <button className="flex flex-col items-center space-y-1 text-center">
            <Link href="/Activity">
              <div className="w-20 h-20 bg-[#323030]/40  border border-[#424242] shadow-lg shadow-[#F4A100]/15 rounded-full flex items-center justify-center">
                <img src="/Group.svg" alt="" />
              </div>{" "}
              {/* Activity icon */}
              <p className="text-s mt-1">Activity</p>
            </Link>
          </button>
        </div>

        <div className="px-4 space-y-4">
          <div className="p-4 ">
            <img src="/cancel.svg" alt="" className="ml-auto mb-2" />
            <div className="bg-[url('../public/Rectangle.svg')] w-full h-24 rounded-lg relative">
              <p className="absolute bottom-2 right-2 bg-[#FFFFFF]/80 text-black px-4 py-1 rounded-lg font-semibold">
                Exclusive
              </p>
            </div>
            <img src="/option.svg" alt="" className="mx-auto block mt-2" />
          </div>
        </div>

        <div className="px-4 space-y-4">
          <div className="flex justify-between items-center w-full p-4">
            <div className="flex space-x-2">
            {(['Tokens', 'NFTs'] as const).map((tab) => (

              <button
              key={tab}
                className={`py-1 px-4 rounded-md text-sm ${
                  activeTab === tab
                    ? "text-white border border-white"
                    : "text-gray-400"
                }`}
                onClick={() => setActiveTab(tab)}
                >
                {tab}

              </button>
               ))}

            </div>

            <Link href="/Manage">
              <EllipsisVerticalIcon className="h-5 w-5 text-gray-400" />
            </Link>
          </div>
        </div>

        <div className="px-4 pt-4 pb-20 space-y-4">
          <div className="bg-[#484848]/50 rounded-lg w-full p-4 ">

        <TabContent activeTab={activeTab} />

          </div>
        </div>

        <Navbar />
      </div>
    </div>
  );
};

export default WalletScreen;
