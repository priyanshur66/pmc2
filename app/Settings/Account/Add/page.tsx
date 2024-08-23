"use client";
import { ArrowLeft, Plus, Key } from "react-feather";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AddAccount() {
  const router = useRouter();

  return (
    <div className="bg-[#323030] min-h-screen text-white p-4">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => router.back()} className="text-white">
          {/* Back Arrow Icon */}
        <ArrowLeft className="mr-4"/>
        </button>
        <h1 className="text-xl font-bold text-white">Add new Account</h1>
        <div className="w-6 h-6" /> {/* Placeholder for alignment */}
      </div>

      <main className="space-y-4 mt-10">
        <button className="w-full bg-[#484848] py-3 px-4 rounded-xl flex items-center justify-center">
          <Plus className="mr-2" size={20} />
          <span>Create New Account</span>
        </button>

        <Link href="/Settings/Account/Add/Private"> 
        <button className="w-full mt-4 bg-[#484848] py-3 px-4 rounded-xl flex items-center justify-center">
          <Key className="mr-2" size={20} />
          <span>Import Private Key</span>
        </button>
        </Link>

        <Link href="/Settings/Account/Add/Recovery">
        <button className="w-full mt-4 bg-[#484848] py-3 px-4 rounded-xl flex items-center justify-center">
          <Key className="mr-2" size={20} />
          <span>Import Recovery Phrase</span>
        </button>
        </Link>


        <button className="w-full bg-[#2A2A2A] border border-[#9E9E9E] text-white py-3 px-4 rounded-xl flex items-center justify-center">
          <img src="/google.svg" alt="Google" className="w-5 h-5 mr-2" />
          <span>Continue with Google</span>
        </button>
      </main>

      <footer className="absolute bottom-0 left-0 right-0 pb-4">
        <div className="w-1/3 h-1 bg-gray-600 mx-auto rounded-full"></div>
      </footer>
    </div>
  );
}
