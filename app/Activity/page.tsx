"use client"
import { useRouter } from "next/navigation";
import { ArrowLeft } from "react-feather";
function TransactionPage() {

  const router = useRouter();

  return (
    <div className="h-screen flex flex-col justify-center items-center bg-[#323030] text-center px-4">
      {/* Back button */}
      <div className="absolute top-4 left-4">
        <button className="text-white"
        onClick={()=> router.back()}>
          <ArrowLeft className="mr-4" />

        </button>
      </div>

      {/* Main content */}
      <div>
        <p className="text-white font-semibold text-lg">Your transactions</p>
        <p className="text-white font-semibold ">will appear here</p>
        <p className="text-gray-500 mt-4">
          You don&apos;t have any transactions yet
        </p>
      </div>
    </div>
  );
}

export default TransactionPage;
