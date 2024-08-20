
function TransactionPage() {
  return (
    <div className="h-screen flex flex-col justify-center items-center bg-[#323030] text-center px-4">
      {/* Back button */}
      <div className="absolute top-4 left-4">
        <button className="text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>
      </div>
      
      {/* Main content */}
      <div>
        <p className="text-white font-semibold text-lg">Your transactions</p>
        <p className="text-white font-semibold ">will appear here</p>
        <p className="text-gray-500 mt-4">You don't have any transactions yet</p>
      </div>
    </div>
  );
}

export default TransactionPage;
