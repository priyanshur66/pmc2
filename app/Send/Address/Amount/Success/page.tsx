"use client"
import React from "react";
import { ArrowRight, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useTransactionHash } from "@/store";
import { formatDistanceToNow } from "date-fns";

interface TransactionDetails {
  timestamp: string;
  success: boolean;
  sender: string;
  toAddress: string;
  gas_used: string;
  gas_unit_price: string;
  payload: {
    arguments: string[];
  };
}

const TransactionSuccess: React.FC = () => {
  const router = useRouter();
  const [transactionDetails, setTransactionDetails] = useState<TransactionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { transactionHash } = useTransactionHash();
  const txnHash = transactionHash;

  useEffect(() => {
    const fetchTransactionDetails = async () => {
      try {
        const response = await fetch(
         `https://fullnode.testnet.aptoslabs.com/v1/transactions/by_hash/${txnHash}` 
        );
        if (!response.ok) {
          throw new Error("Failed to fetch transaction details");
        }
        const data = await response.json();
        
        // Find the toAddress from the changes array
        const toAddress = data.changes.find(
          (change: any) => 
            change.type === "write_resource" && 
            change.data.type.includes("CoinStore")
        )?.address || "";

        setTransactionDetails({
          timestamp: data.timestamp,
          success: data.success,
          sender: data.sender,
          toAddress: toAddress,
          gas_used: data.gas_used,
          gas_unit_price: data.gas_unit_price,
          payload: data.payload,
        });
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
    success,
    sender,
    toAddress,
    gas_used,
    gas_unit_price,
    payload,
  } = transactionDetails;

  const date = new Date(Math.floor(parseInt(timestamp) / 1000));
  const amount = payload.arguments[1];

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
          <img src="/tx.svg" alt="" className="w-20 h-20" />
        </div>
      </div>

      <div className="text-center text-3xl font-bold mb-6">{parseInt(amount) / 100000000} APT</div>

      <div className="space-y-3 mb-6 bg-[#1414144F] rounded-2xl m-4 p-4">
        <div className="flex justify-between">
          <span className="text-gray-400">Date</span>
          <span>{formatDistanceToNow(date, { addSuffix: true })}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Status</span>
          <span className={success ? "text-green-500" : "text-red-500"}>
            {success ? "Success" : "Failed"}
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
          <span>{parseInt(gas_used) * parseInt(gas_unit_price) / 100000000} APT</span>
        </div>
      </div>

      <button className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold">
        Done
      </button>
    </div>
  );
};

export default TransactionSuccess;