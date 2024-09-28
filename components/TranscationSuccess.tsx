import React from 'react';
import { ArrowRight, X } from 'lucide-react';

interface TransactionDetailsProps {
  amount: string;
  date: string;
  status: string;
  recipient: string;
  network: string;
  networkFee: string;
}

const TransactionSuccess: React.FC<TransactionDetailsProps> = ({
  amount,
  date,
  status,
  recipient,
  network,
  networkFee,
}) => {
  return (
    <div className="bg-gray-900 text-white p-4 rounded-lg max-w-sm mx-auto">
      <div className="flex justify-between items-center mb-4">
        <X className="w-6 h-6" />
        <span className="text-lg font-semibold">Sent</span>
        <div className="w-6 h-6"></div>
      </div>
      
      <div className="flex justify-center items-center mb-4">
        <div className="bg-white rounded-full p-2 mr-2">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <ArrowRight className="w-5 h-5 text-blue-500" />
          </div>
        </div>
      </div>
      
      <div className="text-center text-3xl font-bold mb-6">{amount} APT</div>
      
      <div className="space-y-3 mb-6">
        <div className="flex justify-between">
          <span className="text-gray-400">Date</span>
          <span>{date}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Status</span>
          <span className="text-green-500">{status}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">To</span>
          <span>{recipient}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Network</span>
          <span>{network}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Network fee</span>
          <span>{networkFee} APT</span>
        </div>
      </div>
      
      <button className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold">
        Call to Action
      </button>
    </div>
  );
};

export default TransactionSuccess;