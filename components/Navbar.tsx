"use client"
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Navbar = () => {
  const [selected, setSelected] = useState("home");
  const usePath = usePathname();
  console.log(usePath)

  

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#323030] text-white flex justify-around items-center shadow-lg">

      <div className="flex flex-col items-center">
      {usePath === "/" && (
        <div className="w-12 h-1 bg-red-500 rounded-full"></div>
      )}

      <Link href="/">
        <button
          className={`flex flex-col items-center`}
          onClick={() => setSelected("missions")}
        >
          <img src="/Home.svg" className="h-12 w-12 mb-2 mt-2" />
        </button>
      </Link>

      </div>
      
      <Link
        href="/Dapps"
        className="flex flex-col items-center text-white absolute left-1/2 transform -translate-x-1/2 -translate-y-5 "
      >
        <div className="bg-gradient-to-b from-[#F33439] to-[#8D1E21] rounded-full p-3 ">
          <img src="/Dapps.svg" alt="" className="w-16 h-16" />

        </div>
      </Link>

     


      <div>

      {usePath === "/Mission" && (
        <div className="w-12 h-1 bg-red-500 rounded-full"></div>
      )}
      <Link href="/Mission">
        <button
          className={`flex flex-col items-center`}
          onClick={() => setSelected("missions")}
        >
          <img src="/Mission-icon.svg" className="h-12 w-12 mb-2 mt-2" />
        </button>
      </Link>

            </div>

    </div>
  );
};

export default Navbar;