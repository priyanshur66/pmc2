import React from 'react';

function ComingSoonPage() {
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

      {/* Header */}
      <div className="absolute top-4 inset-x-0 flex justify-center">
        <p className="text-white font-semibold text-lg">Choose payment method</p>
      </div>

      {/* Search Box */}
      <div className="absolute top-20 inset-x-0 flex justify-center">
        <div className="w-3/4">

          <input
            type="text"
            placeholder="Search ..."
            className="w-full px-4 py-2 rounded-full bg-[#0F0F0F] text-white placeholder-gray-500"
            
          />
        </div>
      </div>

      {/* Main content */}
      <div className="mt-32">
        <div className="flex justify-center mb-6">
        <img src="/clock.svg" alt="" />



          {/* <div className="bg-red-500 p-4 rounded-full">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4l3 3m-9-5a9 9 0 1118 0 9 9 0 01-18 0z"
              />
            </svg>
          </div> */}
        </div>
        <p className="text-white font-semibold text-lg">Coming Soon</p>
        <p className="text-gray-400 mt-2">
          Please be patient while we curate these features shortly
        </p>
      </div>
    </div>
  );
}

export default ComingSoonPage;
