"use client"
import React from 'react';
import { ArrowRight, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useEffect } from 'react';
import { useToKey, useTransactionHash } from '@/store';
import { formatDistanceToNow } from 'date-fns';


interface TransactionDetails {
  timestamp: number;
  status: string;
  toAddress: string;
  fromAddress: string;
  amount: string;
  gasUsed: string;
  gasPrice: string;
}
const TransactionSuccess: React.FC = ({
  
}) => {
    const router = useRouter();
 

      const [transactionDetails, setTransactionDetails] = useState<TransactionDetails | null>(null);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState<string | null>(null);
      const { transactionHash } = useTransactionHash();
      const txnHash = transactionHash

    
      useEffect(() => {
        const fetchTransactionDetails = async () => {
          try {   
            // Replace this URL with the actual explorer API endpoint
            const response = await fetch(`https://fullnode.testnet.aptoslabs.com/v1/transactions/${txnHash}`);
            if (!response.ok) {
              throw new Error('Failed to fetch transaction details');
            }
            const data = await response.json();
            setTransactionDetails(data);
          } catch (err) {
            if (err instanceof Error) {

            setError(err.message);
            }
          } finally {
            setLoading(false);
          }
        };
    
        fetchTransactionDetails();
      }, [txnHash]);
    
      if (loading) {
        return <div>Loading transaction details...</div>;
      }
    
      if (error) {
        return <div>Error: {error}</div>;
      }
    
      if (!transactionDetails) {
        return <div>No transaction details found.</div>;
      }
    
      const {
        timestamp,
        status,
        toAddress,
        fromAddress,
        amount,
        gasUsed,
        gasPrice,
      } = transactionDetails;
    
      const date = new Date(timestamp * 1000); 
     
      

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
      
      <div className="text-center text-3xl font-bold mb-6"> {amount} APT</div>
      
      <div className="space-y-3 mb-6 bg-[#1414144F] rounded-2xl m-4 p-4">
        <div className="flex justify-between">
          <span className="text-gray-400">Date</span>
          <span>
          {formatDistanceToNow(date, { addSuffix: true })}
        </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Status</span>
          <span className="text-green-500">              {status}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">To</span>
          <span>
          {toAddress.slice(0, 6)}...{toAddress.slice(-4)}

          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Network</span>

          <span>Aptos</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Network fee</span>
          <span> {gasPrice} APT</span>
        </div>
      </div>
      
      <button className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold">
        Done
      </button>
    </div>
  );
};

export default TransactionSuccess;