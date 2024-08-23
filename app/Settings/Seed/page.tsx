"use client"
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'react-feather';

const SecurityPage = () => {
  const router = useRouter();

  const seedPhrase = Array(12).fill("••••••••"); // Placeholder for seed words

  return (
    <div className="bg-[#323030] min-h-screen p-4">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => router.back()} className="text-white">
          {/* Back Arrow Icon */}
        <ArrowLeft className='mr-4'/>
        </button>
        <h1 className="text-xl font-bold text-white">Security</h1>
        <div className="w-6 h-6" /> {/* Placeholder for alignment */}
      </div>

      <div className="bg-[#323030] p-4 rounded-lg">
        <h2 className="text-white font-semibold mb-2">Seed Phrase</h2>
        <p className="text-gray-400 mb-4">
          Write down your seed phrase so you don’t lose access to your wallet.
        </p>
        <div className="grid grid-cols-2 gap-4">
          {seedPhrase.map((word, index) => (
            <div key={index} className="bg-[#676767] rounded-xl p-3 text-center text-white">
              {word}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mt-8 p-4 rounded-lg cursor-pointer">
        <span className="text-white font-semibold">Private Key</span>
        <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );
};

export default SecurityPage;
