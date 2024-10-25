"use client";
import React from "react";
import Navbar from "./Navbar";
import { Bars3Icon, EllipsisVerticalIcon } from "@heroicons/react/16/solid";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  DocumentData,
} from "firebase/firestore";
import db from "@/firebaseConfig";
import WebApp from "@twa-dev/sdk";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { usePublicKey } from "@/store";
import { useIvData } from "@/store";
import { useEncryptedValue } from "@/store";

import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";

const aptosConfig = new AptosConfig({ network: Network.TESTNET });
export const aptos = new Aptos(aptosConfig);

interface TokenBalance {
  name: string;
  balance: number;
  contractAddress: string;
  standard: string;
}

interface UserData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code: string;
  is_premium?: boolean;
}

interface MyData {
  id: string;
  publicKey: string;
  userName: number;
  iv: string;
  referralLink: string;
  referredBy: string;
  encryptedData: string;
}

type TabType = "Tokens" | "NFTs";

const WalletScreen = () => {
  const [activeTab, setActiveTab] = useState<TabType>("Tokens");
  const [userData, setUserData] = useState<UserData | null>(null);
  const [data, setData] = useState<MyData[]>([]);
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([]);
  const [address, setAddress] = useState("");
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [price, setPrice] = useState<number | null>(null);
  const spanRef = React.useRef<HTMLSpanElement | null>(null);

  const { publicKey, setPublicKey } = usePublicKey();
  const { ivData, setIvData } = useIvData();
  const { encryptedValue, setEncryptedValue } = useEncryptedValue();
  const toggleBalanceVisibility = () => {
    setIsBalanceVisible(!isBalanceVisible); // Toggle balance visibility
  };

  // Initialize WebApp user data
  useEffect(() => {
    try {
      if (typeof window !== "undefined" && WebApp.initDataUnsafe?.user) {
        setUserData(WebApp.initDataUnsafe.user as UserData);
      }
    } catch (error) {
      console.error("Error initializing WebApp:", error);
      setError("Failed to initialize user data");
    }
  }, []);

  // Fetch user data from Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      if (!userData?.id) return;

      setIsLoading(true);
      setError(null);

      try {
        const usersRef = collection(db, "testWalletUsers");
        const q = query(usersRef, where("userName", "==", userData.id));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          setError("User not found");
          return;
        }

        const userDocs = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as MyData[];

        setData(userDocs);

        // Initialize store values
        if (userDocs.length > 0) {
          setPublicKey(userDocs[0].publicKey);
          setIvData(userDocs[0].iv);
          setEncryptedValue(userDocs[0].encryptedData);
          setAddress(userDocs[0].publicKey);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("Failed to fetch user data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [userData?.id, setPublicKey, setIvData, setEncryptedValue]);

  // Fetch token balances
  const fetchTokenBalances = async (publicKey: string) => {
    if (!publicKey) return;

    try {
      const TokensCollectionurl = "https://api.devnet.aptoslabs.com/v1/graphql";
      const query = `
        query MyQuery {
          current_fungible_asset_balances(
            where: {owner_address: {_eq: "${publicKey}"}, amount: {_gt: "0"}}
          ) {
            owner_address
            amount
            metadata {
              asset_type
              name
              supply_v2
              symbol
              token_standard
              decimals
            }
            token_standard
          }
        }
      `;

      const response = await axios.post(TokensCollectionurl, { query });
      const balances = response.data.data.current_fungible_asset_balances;

      const formattedBalances = balances
        .filter((balance: any) => {
          const { token_standard, metadata } = balance;
          return (
            (token_standard === "v1" && !metadata.name.includes("LP")) ||
            token_standard === "v2"
          );
        })
        .map((balance: any) => ({
          name: balance.metadata.name,
          balance: balance.amount / 10 ** balance.metadata.decimals,
          contractAddress: balance.metadata.asset_type,
          standard: balance.token_standard,
        }));

      setTokenBalances(formattedBalances);
    } catch (error) {
      console.error("Error fetching token balances:", error);
      toast.error("Failed to fetch token balances");
    }
  };

  // Fetch token balances when public key is available
  useEffect(() => {
    if (data[0]?.publicKey) {
      fetchTokenBalances(data[0].publicKey);
    }
  }, [data]);

  // Fetch APT price
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const response = await axios.get(
          "https://api.coingecko.com/api/v3/simple/price",
          {
            params: {
              ids: "aptos",
              vs_currencies: "usd",
            },
          }
        );
        setPrice(response.data.aptos.usd);
      } catch (error) {
        console.error("Error fetching APT price:", error);
      }
    };

    fetchPrice();
  }, []);

  const handleCopy = async () => {
    if (!spanRef.current?.textContent) return;

    try {
      await navigator.clipboard.writeText(spanRef.current.textContent);
      toast.success("Copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy:", error);
      toast.error("Failed to copy to clipboard");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <p className="text-red-500 text-center mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-red-500 text-white px-4 py-2 rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <div>
        <div className=" bg-gradient-to-b from-[#F33439]/25  to-[#0F0F0F]  inset-0">
          <div className="flex justify-between items-center mb-4 z-[1] px-4 py-6 space-y-4">
            <div className="flex items-center ">
              <img
                src="ziptos.svg"
                alt="Profile"
                className="rounded-full h-10 w-10 mr-2"
              />
              <div>
                <div className="flex items-center ml-2">
                  <span className="text-lg font-medium">
                    {userData?.username || "N/A"}
                  </span>
                  <img src="/dropdown.svg" alt="" className="ml-4 w-6 h-6" />
                </div>
                <div className="flex ml-2">
                  {data.length > 0 ? (
                    <span
                      ref={spanRef}
                      key={data[0].id}
                      className="text-s text-white font-extralight mt-1"
                    >
                      {data[0].publicKey.slice(0, 6)}...
                      {data[0].publicKey.slice(-4)}
                    </span>
                  ) : (
                    <span
                      ref={spanRef}
                      className="text-s text-white font-extralight mt-1"
                    >
                      Loading...
                    </span>
                  )}

                  <img
                    onClick={handleCopy}
                    src="/copy.svg"
                    alt=""
                    className="ml-2"
                  />
                </div>
                <ToastContainer />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <img src="/bell.svg" alt="" className="mb-1 h-6 w-6" />
              <Link href="/Settings">
                <Bars3Icon className="h-6 w-6" />
              </Link>
            </div>
          </div>
        </div>
        <div className="px-4 mb-4 space-x-4">
          <div className="bg-[#323030]/40 p-6 mx-4 rounded-xl flex justify-between items-center">
            <div>
              <span className="text-xl text-green-400">Main Balance</span>
              <h2 className="text-4xl mt-1 font-semibold">
                {isBalanceVisible ? "$2,172.38" : "*****"}
              </h2>
            </div>
            <img
              src="/eye.svg"
              alt=""
              className="h-6 w-6"
              onClick={toggleBalanceVisibility}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between w-full space-x-4 px-4 py-4">
          <button className="flex flex-col items-center space-y-1 text-center">
            <Link href="/Send">
              <div className="w-14 h-14 sm:w-20 sm:h-20 bg-[#323030]/40 border border-[#424242] shadow-lg shadow-[#F4A100]/15 rounded-full flex items-center justify-center">
                <img src="/send.svg" alt="" />
              </div>{" "}
              {/* Arrow icon */}
              <p className="text-s">Send</p>
            </Link>
          </button>

          <button className="flex flex-col items-center space-y-1 text-center">
            <Link href="/Receive">
              <div className="w-14 h-14 sm:w-20 sm:h-20 bg-[#323030]/40  border border-[#424242] shadow-lg shadow-[#F4A100]/15 rounded-full flex items-center justify-center">
                <img src="/send.svg" alt="" className="transform rotate-180" />
              </div>{" "}
              {/* Request icon */}
              <p className="text-s mt-1">Request</p>
            </Link>
          </button>
          <button className="flex flex-col items-center space-y-1 text-center">
            <Link href="/Buy">
              <div className="w-14 h-14 sm:w-20 sm:h-20 bg-[#323030]/40  border border-[#424242] shadow-lg shadow-[#F4A100]/15 rounded-full flex items-center justify-center">
                <img src="/Vector.svg" alt="" />
              </div>{" "}
              {/* Dollar icon */}
              <p className="text-s mt-1">Buy</p>
            </Link>
          </button>
          <button className="flex flex-col items-center space-y-1 text-center">
            <Link href="/Activity">
              <div className="w-14 h-14 sm:w-20 sm:h-20 bg-[#323030]/40  border border-[#424242] shadow-lg shadow-[#F4A100]/15 rounded-full flex items-center justify-center">
                <img src="/Group.svg" alt="" />
              </div>{" "}
              {/* Activity icon */}
              <p className="text-s mt-1">Activity</p>
            </Link>
          </button>
        </div>

        <div className="px-4 space-y-4">
          <div className="p-4 ">
            <img src="/cancel.svg" alt="" className="ml-auto mb-2" />
            <div className="bg-[url('../public/Rectangle.svg')] w-full h-24 rounded-lg relative">
              <p className="absolute bottom-2 right-2 bg-[#FFFFFF]/80 text-black px-4 py-1 rounded-lg font-semibold">
                Exclusive
              </p>
            </div>
            <img src="/option.svg" alt="" className="mx-auto block mt-2" />
          </div>
        </div>

        <div className="px-4 space-y-4">
          <div className="flex justify-between items-center w-full p-4">
            <div className="flex space-x-2">
              {(["Tokens", "NFTs"] as const).map((tab) => (
                <button
                  key={tab}
                  className={`py-1 px-4 rounded-md text-sm ${
                    activeTab === tab
                      ? "text-white border border-white"
                      : "text-gray-400"
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>

            <Link href="/Manage">
              <EllipsisVerticalIcon className="h-5 w-5 text-gray-400" />
            </Link>
          </div>
        </div>

        <div className="px-4 pt-4 pb-20 space-y-4">
          <div className="bg-[#484848]/50 rounded-lg w-full p-4 ">
            {/* <TabContent activeTab={activeTab} /> */}

            {tokenBalances.length > 0 ? (
              <div className="mt-4 space-y-4">
                {tokenBalances.map((token, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-10 h-10 bg-[#484848]/50 rounded-full flex items-center justify-center">
                        <span className="text-lg text-white font-medium">
                          {token.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{token.name}</p>
                        <p className="text-s text-[#9F9F9F]">
                          {token.balance.toFixed(2)}{" "}
                          {token.standard === "v1" ? "v1" : "v2"}
                        </p>
                      </div>
                    </div>
                    {/* <p className="text-lg font-light">${(token.balance * (price || 0)).toFixed(2)}</p> */}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[#9F9F9F] text-base font-light text-center py-4">
                You don&apos;t have any tokens yet
              </p>
            )}
          </div>
        </div>

        <Navbar />
      </div>
    </div>
  );
};

export default WalletScreen;
