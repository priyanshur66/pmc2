"use client"
import { useState } from 'react';
import { ArrowLeft, Eye } from 'react-feather';
import { useRouter } from 'next/navigation';

export default function ImportAccount() {
  const [privateKey, setPrivateKey] = useState('');
  const router = useRouter();


  return (
    <div className="bg-[#323030] min-h-screen text-white p-6 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => router.back()} className="text-white">
          {/* Back Arrow Icon */}
        <ArrowLeft className="mr-4"/>
        </button>
        <h1 className="text-xl font-bold text-white">Import Account</h1>
        <div className="w-6 h-6" /> {/* Placeholder for alignment */}
      </div>


      <main className="flex-grow mt-10">
        <h2 className="text-2xl font-bold mb-2">Enter Private Key</h2>
        <p className="text-gray-400 mb-6">Add an existing wallet with your private key</p>

        <div className="relative mb-8">
          <input
            type="password"
            placeholder="Enter private key"
            value={privateKey}
            onChange={(e) => setPrivateKey(e.target.value)}
            className="w-full bg-[#494949] rounded-lg py-3 px-4 pr-10 text-white placeholder-white"
          />
          <Eye className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white" />
        </div>
      </main>

      <footer>
        <button className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold">
          Next
        </button>
        <div className="w-1/3 h-1 bg-gray-700 mx-auto mt-6 rounded-full"></div>
      </footer>
    </div>
  );
}