"use client"
import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from "react-feather";
import { useState, useEffect } from 'react';
import { format } from "date-fns";

interface Transaction {
  version: string;
  timestamp: string;
  success: boolean;
  vm_status: string;
  sender: string;
  sequence_number: string;
  gas_used: string;
  payload: {
    function: string;
    type_arguments: string[];
    arguments: string[];
  };
  events: {
    key: string;
    sequence_number: string;
    type: string;
    data: any;
  }[];
}

interface GroupedTransactions {
  [date: string]: Transaction[];
}

const RecentActivity = () => {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const address = "0xbb629c088b696f8c3500d0133692a1ad98a90baef9d957056ec4067523181e9a";

  const fetchTransactions = async (cursor: string | null = null) => {
    try {
      const limit = 8;
      let url = `https://fullnode.testnet.aptoslabs.com/v1/accounts/${address}/transactions?limit=${limit}`;
      if (cursor) {
        url += `&start=${cursor}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }

      const data: Transaction[] = await response.json();
      setTransactions(prev => [...prev, ...data]);

      if (data.length === limit) {
        setNextCursor(data[data.length - 1].version);
      } else {
        setNextCursor(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const getTransactionDetails = (tx: Transaction): { amount: number; isSent: boolean; recipient: string } => {
    let amount = 0;
    let isSent = false;
    let recipient = '';

    // Check for coin transfer events
    const withdrawEvent = tx.events.find(event => event.type === "0x1::coin::WithdrawEvent");
    const depositEvent = tx.events.find(event => event.type === "0x1::coin::DepositEvent");

    if (withdrawEvent && tx.sender === address) {
      // This is a sent transaction
      amount = parseInt(withdrawEvent.data.amount, 10);
      isSent = true;
      recipient = tx.payload.arguments[0]; // Assuming the first argument is the recipient address
    } else if (depositEvent && depositEvent.data.recipient === address) {
      // This is a received transaction
      amount = parseInt(depositEvent.data.amount, 10);
      isSent = false;
      recipient = tx.sender;
    } else if (tx.payload.function.includes("0x1::coin::transfer")) {
      // Fallback to checking payload if no event is found
      amount = parseInt(tx.payload.arguments[1], 10) || 0;
      isSent = tx.sender === address;
      recipient = isSent ? tx.payload.arguments[0] : tx.sender;
    }

    return { amount, isSent, recipient };
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 8 });
  };

  const convertToWholeTokens = (amount: number) => {
    return amount / 100000000;
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      const microseconds = parseInt(timestamp, 10);
      const milliseconds = microseconds / 1000;
      const date = new Date(milliseconds);
      return format(date, 'MMM d, yyyy');
    } catch (error) {
      console.error("Error parsing timestamp:", error);
      return "Unknown date";
    }
  };

  const groupTransactionsByDate = (transactions: Transaction[]): GroupedTransactions => {
    return transactions.reduce((groups, transaction) => {
      const date = formatTimestamp(transaction.timestamp);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(transaction);
      return groups;
    }, {} as GroupedTransactions);
  };

  const groupedTransactions = groupTransactionsByDate(transactions);
  const sortedDates = Object.keys(groupedTransactions).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  if (loading && transactions.length === 0) {
    return <div>Loading transactions...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="bg-[#323030] h-full text-white p-4">
      <div className="mb-4 flex items-center">
        <button onClick={() => router.back()} className="text-white">
          <ArrowLeft className="mr-4" />
        </button>
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 flex">
          <p className="text-white font-bold text-lg">Recent Activities</p>
        </div>
      </div>

      {sortedDates.map((date) => (
        <div key={date} className="mb-6 mt-2">
          <h2 className="text-[#9F9F9F] text-base font-bold mb-3">{date}</h2>
          {groupedTransactions[date].map((tx) => {
            const { amount, isSent, recipient } = getTransactionDetails(tx);
            const formattedAmount = convertToWholeTokens(amount);
            return (
              <div key={tx.version} className="bg-[#1414144F] rounded-2xl p-2 flex items-center justify-between mb-2">
                <div className="flex items-center ">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3 relative">
                    <img src="/aptos.svg" alt="Aptos" className="w-8 h-8" />
                    {isSent ? (
                      <img src="/sent.svg" alt="" className="w-4 h-4 absolute -bottom-1 -right-1"  />
                    ) : (
                      <img src='/recieved.svg' alt="" className="w-4 h-4 text-green-500 absolute -bottom-1 -right-1" />
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-base">{isSent ? "Sent" : "Received"}</p>
                    <p className="text-gray-400 text-sm">
                      {isSent ? "To" : "From"} {recipient.slice(0,6)}...{recipient.slice(-4)}
                    </p>
                  </div>
                </div>
                <p className={`font-semibold ${formattedAmount === 0 ? "" : (isSent ? "text-red-500" : "text-green-500")}`}>
                  {formattedAmount === 0 ? "0 APT" : `${isSent ? "-" : "+"}${formatNumber(formattedAmount)} APT`}
                </p>
              </div>
            );
          })}
        </div>
      ))}


    </div>
  );
};

export default RecentActivity;