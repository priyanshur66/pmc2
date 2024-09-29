"use client"
import React from 'react';
import { ArrowRight, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useEffect } from 'react';
import { useToKey } from '@/store';


const TransactionSuccess: React.FC = ({
  
}) => {
    const router = useRouter();
    const {toKey} = useToKey();
    const toAddress = toKey;
    const [currentDate, setCurrentDate] = useState<Date>(new Date());
    const [selectedDate, setSelectedDate] = useState<string>('');

    useEffect(() => {
        const timer = setInterval(() => {
          setCurrentDate(new Date());
        }, 1000);
    
        return () => {
          clearInterval(timer);
        };
      }, []);
    
      const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedDate(event.target.value);
        const selected = new Date(event.target.value);
      };

  return (
    <div className="flex flex-col h-screen bg-[#323030] text-white p-4">
         <div className="mb-6 flex items-center">
        <button onClick={() => router.back()} className="text-white">
          <X className="mr-4" />
        </button>
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 flex ">
          <p className="text-white font-bold text-lg ">Sent</p>
        </div>
      </div>
     
      
      <div className="flex justify-center items-center mb-4">
        <div className="bg-white rounded-full p-2 mr-2">
          {/* <div className="w-8 h-8 flex items-center justify-center"> */}
            <img src="/tx.svg" alt="" className='w-20 h-20'/>
          {/* </div> */}
        </div>
      </div>
      
      <div className="text-center text-3xl font-bold mb-6"> APT</div>
      
      <div className="space-y-3 mb-6 bg-[#1414144F] rounded-2xl m-4 p-4">
        <div className="flex justify-between">
          <span className="text-gray-400">Date</span>
          <span>{currentDate.toLocaleDateString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Status</span>
          <span className="text-green-500">Successful</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">To</span>
          <span>{toAddress}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Network</span>
          <span>Aptos</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Network fee</span>
          <span> APT</span>
        </div>
      </div>
      
      <button className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold">
        Call to Action
      </button>
    </div>
  );
};

export default TransactionSuccess;