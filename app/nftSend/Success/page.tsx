"use client";
import React from "react";
import { ArrowRight, X, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useTransactionHash } from "@/store";
import { formatDistanceToNow } from "date-fns";
import { useCurrentSymbol } from "@/store";

interface TransactionDetails {
  timestamp: string;
  success: boolean;
  sender: string;
  toAddress: string;
  gas_used: string;
  gas_unit_price: string;
  payload: {
    arguments: string[];
    function: string;
    type: string;
    type_arguments: string[];
  };
  events: Array<{
    type: string;
    data: any;
  }>;
  version: string;
  hash: string;
  changes: Array<{
    data: {
      data: {
        name?: {
          value: string;
        };
      };
    };
  }>;
}

const TransactionSuccess: React.FC = () => {
  const router = useRouter();
  const [transactionDetails, setTransactionDetails] =
    useState<TransactionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { transactionHash } = useTransactionHash();
  const { currentSymbol } = useCurrentSymbol();
  const [transferedAssetName, setTransferedAssetName] = useState<string | null>(
    null
  );

  useEffect(() => {
    const fetchTransactionDetails = async () => {
      try {
        const response = await fetch(
          `https://fullnode.testnet.aptoslabs.com/v1/transactions/by_hash/${transactionHash}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch transaction details");
        }
        const data = await response.json();
        setTransferedAssetName(data[4].data.data.name.value);

        // Find the transfer event
        const transferEvent = data.events.find(
          (event: any) => event.type === "0x1::object::TransferEvent"
        );

        setTransactionDetails({
          timestamp: data.timestamp,
          success: data.success,
          sender: data.sender,
          toAddress: transferEvent?.data.to || "",
          gas_used: data.gas_used,
          gas_unit_price: data.gas_unit_price,
          payload: data.payload,
          events: data.events,
          version: data.version,
          hash: data.hash,
          changes: data.changes,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactionDetails();
  }, [transactionHash]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#323030] text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#323030] text-white">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  if (!transactionDetails) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#323030] text-white">
        <div>No transaction details found.</div>
      </div>
    );
  }

  const {
    timestamp,
    success,
    sender,
    toAddress,
    gas_used,
    gas_unit_price,
    payload,
    hash,
    version,
    changes,
  } = transactionDetails;

  const date = new Date(Math.floor(parseInt(timestamp) / 1000));
  const txnFee = (parseInt(gas_used) * parseInt(gas_unit_price)) / 100000000;

  // Get asset name from changes array
  const assetName = changes[4].data.data.name.value || "Asset Transfer";

  const shortenAddress = (address: string) =>
    `${address.slice(0, 6)}...${address.slice(-4)}`;

  return (
    <div className="flex flex-col h-screen bg-[#323030] text-white p-4">
      <div className="mb-6 flex items-center justify-between">
        <button onClick={() => router.back()} className="text-white">
          <X className="w-6 h-6" />
        </button>
        <h1 className="text-white font-bold text-lg">Transaction Details</h1>
        <div className="w-6"></div>
      </div>

      <div className="flex justify-center items-center mb-6">
        <div className="bg-white rounded-full p-4">
          {success ? (
            <img src="/tx-success.svg" alt="Success" className="w-16 h-16" />
          ) : (
            <img src="/tx-failed.svg" alt="Failed" className="w-16 h-16" />
          )}
        </div>
      </div>

      <div className="text-center mb-6">
        <div className="text-2xl font-bold mb-2">{transferedAssetName}</div>
        <div
          className={`text-lg ${success ? "text-green-500" : "text-red-500"}`}
        >
          {success ? "Transaction Successful" : "Transaction Failed"}
        </div>
      </div>

      <div className="space-y-4 bg-[#1414144F] rounded-2xl m-4 p-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Date</span>
          <span>{formatDistanceToNow(date, { addSuffix: true })}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-400">From</span>
          <span className="font-mono">{shortenAddress(sender)}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-400">To</span>
          <span className="font-mono">{shortenAddress(toAddress)}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-400">Network</span>
          <span>Aptos Testnet</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-400">Gas Fee</span>
          <span>{txnFee.toFixed(8)} APT</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-400">Version</span>
          <span>{version}</span>
        </div>

        <div className="pt-2 border-t border-gray-700">
          <a
            href={`https://explorer.aptoslabs.com/txn/${hash}?network=testnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center text-blue-400 hover:text-blue-300"
          >
            <span className="mr-2">View on Explorer</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      <button
        onClick={() => router.push("/wallet")}
        className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-semibold transition-colors"
      >
        Done
      </button>
    </div>
  );
};

export default TransactionSuccess;
