"use client";
import React, { useRef } from 'react';
import { useRouter } from "next/navigation";
import { ArrowLeft } from "react-feather";
import MyQRCode from '@/components/MyQRCode';
import { usePublicKey } from '@/store';
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { useState } from 'react';
import db from "@/firebaseConfig";
import WebApp from "@twa-dev/sdk";
import { useEffect } from 'react';
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";


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



const AptosReceive = () => {
  const { publicKey } = usePublicKey();
  const router = useRouter();
  const spanRef = useRef<HTMLSpanElement | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null)
  const [data, setData] = useState<MyData[]>([]);


  useEffect(() =>{
    if (typeof window !== 'undefined') {

    if (WebApp.initDataUnsafe.user) {
      setUserData(WebApp.initDataUnsafe.user as UserData)
    } 
 } })
  
 useEffect(() => {
  const fetchData = async (msg: any) => {
    try {
      if (userData?.id) {
        const querySnapshot = await getDocs(collection(db, "testWalletUsers"));
        const matchedData = querySnapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((doc) => doc.id === String(userData.id)) as MyData[];
  
        setData(matchedData);
      }
     else{

     }
    } 
    catch (error) {
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



  

  const handleCopy = () => {
    if (spanRef.current) {
      const textToCopy = spanRef.current.textContent;
      if (textToCopy) {
        navigator.clipboard.writeText(textToCopy)
          .then(() => {
            toast.success('Copied to clipboard!', {
              position: "top-right",
              autoClose: 3000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "dark",
            });
          })
          .catch((err) => {
            console.error('Failed to copy: ', err);
            toast.error('Failed to copy to clipboard', {
              position: "top-right",
              autoClose: 3000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
            });
          });
      }
    }
  };

  return (
    <div className="bg-[#323030] min-h-screen text-white p-4">
      {/* Header */}
      <div className="mb-4 flex items-center">
        <button onClick={() => router.back()} className="text-white">
          <ArrowLeft className="mr-4" />
        </button>
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 flex">
          <p className="text-white font-bold text-lg">Aptos - Receive</p>
        </div>
      </div>

      {/* Warning */}
      <div className="bg-[#F4A100]/25 text-white p-3 rounded-2xl mb-6 mt-10">
        <p className="text-sm">
          <span className="mr-2">ⓘ</span>
          Only send Aptos (APT) assets to this address. Other assets will be lost forever
        </p>
      </div>

      {/* QR Code */}
      <div className="flex justify-center mb-6">
        <div className="w-50 h-50 mt-6 bg-white p-4 rounded-xl">
          <MyQRCode />
        </div>
      </div>

      {/* Wallet Address */}
      <div className="mb-4">
        <p className="text-white text-sm mb-2">Wallet Address &gt;</p>
        <div className="bg-[#434343] p-3 rounded-lg flex justify-between items-center">
          <span ref={spanRef} className="text-sm font-bold truncate mr-2">
          {data[0].publicKey}
          </span>
          <button onClick={handleCopy} className="p-1 rounded">
            <img src="/copy.svg" alt="Copy Icon" />
          </button>
        </div>
      </div>

      {/* Minimum Deposit Amount */}
      <div className="mb-6 flex justify-between items-center">
        <p className="text-[#979797] font-normal text-sm">Minimum Deposit Amount</p>
        <p className="text-white">0.01 APT</p>
      </div>

      {/* Copy Address Button */}
      <div className="flex justify-center mt-6">
        <button onClick={handleCopy} className="w-2/5 bg-red-500 text-white py-3 rounded-lg font-normal">
          Copy this address
        </button>
      </div>

      {/* Toast Notification */}
      <ToastContainer />
    </div>
  );
};

export default AptosReceive;
