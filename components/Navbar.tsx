import React, { useState } from "react";
import Link from "next/link";

const Navbar = () => {
  const [selected, setSelected] = useState("home");

  

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#323030] text-white flex justify-around items-center py-2 shadow-lg">
      <div className="flex flex-col items-center">
        <Link href="/"
          className={`flex flex-col items-center ${selected === 'home' ? 'text-white' : 'text-gray-400'} pb-1`}
          onClick={() => setSelected('home')}
        >
          {/* <button
            className={`flex flex-col items-center ${
              selected === "home" ? "bg-red-500" : "bg-gray-400"
            } pb-1`}
            onClick={() => setSelected("home")}
          > */}
            
            <img src="/Home.svg" alt="" className="h-10 w-10 mb-1" />

          {/* </button> */}
        </Link>
      </div>
      {selected === "home" && (
        <div className="w-10 h-1 bg-red-500 mt-1 rounded-full"></div>
      )}

      <Link
        href="/Dapps"
        className="flex flex-col items-center text-white absolute left-1/2 transform -translate-x-1/2 -translate-y-5 "
      >
        <div className="bg-gradient-to-b from-[#F33439] to-[#8D1E21] rounded-full p-3 ">
          <img src="/Dapps.svg" alt="" className="w-16 h-16" />
        </div>
      </Link>

      <Link href="/Mission">
        <button
          className={`flex flex-col items-center ${
            selected === "missions" ? "text-red-500" : "text-gray-400"
          }`}
          onClick={() => setSelected("missions")}
        >
          <img src="/Mission-icon.svg" className="h-10 w-10 mb-1" />
        </button>
      </Link>
    </div>
  );
};

export default Navbar;
