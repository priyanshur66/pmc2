"use client";
import { useEffect, useState } from "react";
import WebApp from "@twa-dev/sdk";
import WalletScreen from "@/components/WalletScreen";

interface UserData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code: string;
  is_premium?: boolean;
}

export default function Home() {
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    if (WebApp.initDataUnsafe.user) {
      setUserData(WebApp.initDataUnsafe.user as UserData);
    }
  });

  return (
    <main className="bg-[#0F0F0F] text-white min-h-screen items-center w-full ">
          <WalletScreen/>
    </main>
  );
}
