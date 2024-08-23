"use client";
import { useState } from "react";
import { ArrowLeft } from "react-feather";
import { useRouter } from "next/navigation";

export default function ImportAccount() {
  const [recoveryPhrase, setRecoveryPhrase] = useState<string[]>(
    Array(12).fill("")
  );
  const router = useRouter();

  const handleInputChange = (index: number, value: string) => {
    const newPhrase = [...recoveryPhrase];
    newPhrase[index] = value;
    setRecoveryPhrase(newPhrase);
  };

  return (
    <div className="bg-[#323030] min-h-screen text-white p-6 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => router.back()} className="text-white">
          {/* Back Arrow Icon */}
          <ArrowLeft className="mr-4" />
        </button>
        <h1 className="text-xl font-bold text-white">Import Account</h1>
        <div className="w-6 h-6" /> {/* Placeholder for alignment */}
      </div>

      <main className="flex-grow mt-6">
        <h2 className="text-2xl font-bold mb-6">
          Enter your secret recovery phrase
        </h2>

        <div className="grid grid-cols-2 gap-4">
          {recoveryPhrase.map((word, index) => (
            <div key={index} className="flex items-center">
              <span className="mr-2 text-white">{index + 1}.</span>
              <input
                type="text"
                value={word}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleInputChange(index, e.target.value)
                }
                className="w-full bg-[#494949] rounded-lg py-2 px-3 text-white placeholder-gray-500"
              />
            </div>
          ))}
        </div>
      </main>

      <footer className="mt-6">
        <button className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold">
          Next
        </button>
        <div className="w-1/3 h-1 bg-gray-700 mx-auto mt-6 rounded-full"></div>
      </footer>
    </div>
  );
}
