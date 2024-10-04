"use client";
import React from "react";
import Navbar from "./Navbar";
import {
  Bars3Icon,
  EllipsisVerticalIcon,
} from "@heroicons/react/16/solid";
import { useState, useEffect } from "react";
import Link from "next/link";
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { getDoc, setDoc } from "firebase/firestore";
import db from "@/firebaseConfig";
import WebApp from "@twa-dev/sdk";
import axios from 'axios';
import { Clipboard } from 'lucide-react';
import { useRef } from "react";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AptosClient, AptosAccount, FaucetClient } from "aptos";

import { usePublicKey } from "@/store";
import { useIvData } from "@/store";
import { useEncryptedValue } from "@/store";
import { useCurrentBalance } from "@/store";
import {
  
  Aptos,
  AptosConfig,
  Network,
 
} from "@aptos-labs/ts-sdk";

const aptosConfig = new AptosConfig({ network: Network.TESTNET });
export const aptos = new Aptos(aptosConfig);


interface TokenBalance {
  name: string;
  balance: number;
  contractAddress: string;
  standard: string;
  symbol: string;
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
  userName: string;
  iv: string;
  referralLink: string;
  referredBy: string;
  encryptedData: string;
}


type TabType = 'Tokens' | 'NFTs';


interface TabContentProps {
  activeTab: TabType;
}




const TabContent: React.FC<TabContentProps> = ({ activeTab }) => {
  const [price, setPrice] = useState(null);
  const [pnl, setPnl] = useState(null);



  useEffect(() => {
    const fetchPriceAndPnl = async () => {
      try {
        const response = await axios.get(
          'https://api.coingecko.com/api/v3/coins/markets',
          {
            params: {
              vs_currency: 'usd',
              ids: 'aptos',
            },
          }
        );

        const coinData = response.data[0];
        setPrice(coinData.current_price);
        setPnl(coinData.price_change_percentage_24h);
      } catch (error) {
        console.error('Error fetching APT price and PnL:', error);
      }
    };

    fetchPriceAndPnl();
  }, []);


  if (activeTab === 'Tokens') {
    return (
      <div className="flex items-center justify-between">
         <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-[url('../public/aptos.svg')] rounded-full"></div>{" "}
              <div className="grid-rows-2">
                <p className="font-semibold px-4 text-xl">Aptos</p>
                <p className="font-light px-4 text-s mt-1">
                  ${price}
                  <span className={pnl !== null && pnl >= 0 ? 'ml-1 text-green-500' : 'ml-1 text-red-500'}>
                  {pnl !== null ?  String(pnl).slice(0, 4) : 'N/A'}%
                  </span>
                  
                </p>

              </div>
            </div> 
            <div className="flex flex-col items-end">
              <p className="text-xl font-bold">100 APT</p>
              <p className="text-lg font-light">
              ${Number(price || 0) * 100}              </p>
            </div>
      </div>

            

    );
  
  }
  return <p className="text-[#9F9F9F] text-base font-light text-center py-4">You don&apos;t have any NFTs yet</p>;
};
// ... (keep all your existing interfaces and constants)

const NODE_URL = "https://fullnode.testnet.aptoslabs.com/v1";
const crypto = require('crypto');
const algorithm = 'aes-256-cbc'; // Example algorithm
const key = crypto.createHash('sha256').update('KEY_TEST').digest();
const iv = crypto.randomBytes(16);  

const WalletScreen = () => {

  function encrypt(text: string) {
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return { iv: iv.toString('hex'), encryptedData: encrypted };
}


  const [activeTab, setActiveTab] = useState<TabType>('Tokens');
  const [userData, setUserData] = useState<UserData | null>(null)
  const [data, setData] = useState<MyData[]>([]);
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([]);
  const [totalBalance, setTotalBalance] = useState<number>(0);
  const {currentBalance, setCurrentBalance} = useCurrentBalance();

  const [address, setAddress] = useState("")
  const [isBalanceVisible, setIsBalanceVisible] = useState(true); // State to control balance visibility
  const spanRef = useRef<HTMLSpanElement | null>(null);
  const { publicKey, setPublicKey } = usePublicKey();
  const { ivData, setIvData } = useIvData();
  const { encryptedValue, setEncryptedValue } = useEncryptedValue();
  // ... (keep all your existing state variables)
  const [isLoading, setIsLoading] = useState(false);
  const [price, setPrice] = useState(null);
  const [pnl, setPnl] = useState(null);

  useEffect(() => {
    const fetchPriceAndPnl = async () => {
      try {
        const response = await axios.get(
          'https://api.coingecko.com/api/v3/coins/markets',
          {
            params: {
              vs_currency: 'usd',
              ids: 'aptos',
            },
          }
        );

        const coinData = response.data[0];
        setPrice(coinData.current_price);
        setPnl(coinData.price_change_percentage_24h);
      } catch (error) {
        console.error('Error fetching APT price and PnL:', error);
      }
    };

    fetchPriceAndPnl();
  }, []);

  const fetchTokenBalances = async (publicKey: string) => {
    const TokensCollectionurl = 'https://api.testnet.aptoslabs.com/v1/graphql';
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

    try {
      const response = await axios.post(TokensCollectionurl, { query });
      const balances = response.data.data.current_fungible_asset_balances;
  
      const tempArray: TokenBalance[] = [];
      let totalBalance = 0;

  
      for (const balance of balances) {
        const tokenDecimals = balance.metadata.decimals;
        const tokenBalance = balance.amount;
        const tokenName = balance.metadata.name;
        const tokenContractAddress = balance.metadata.asset_type;
        const tokenStandard = balance.token_standard;
        const formattedTokenBalance = tokenBalance / (10 ** tokenDecimals);
        const tokenSymbol = balance.metadata.symbol;
  
        if (tokenStandard === 'v1' && !tokenName.includes('LP')) {
          tempArray.push({
            name: tokenName,
            balance: formattedTokenBalance,
            contractAddress: tokenContractAddress,
            standard: tokenStandard,
            symbol: tokenSymbol

          });
          totalBalance += formattedTokenBalance;

        } else if (tokenStandard === 'v2') {
          tempArray.push({
            name: tokenName,
            balance: formattedTokenBalance,
            contractAddress: tokenContractAddress,
            standard: tokenStandard,
            symbol: tokenSymbol
            

          });
          totalBalance += formattedTokenBalance;

        }
      }
  
      setTokenBalances(tempArray);
      setTotalBalance(totalBalance);
      setCurrentBalance(totalBalance);

    } catch (error) {
      console.error('Error fetching token balances:', error);
    }
  }

  const generateAndSaveWallet = async (userId: string, username: string) => {
    try {
      setIsLoading(true);
      // Initialize the Aptos client
      const client = new AptosClient(NODE_URL);
      // Generate a new account
      const newAccount = new AptosAccount();
      
      // Get the account's address and private key
      const address = newAccount.address().hex();
      const privateKey = newAccount.toPrivateKeyObject().privateKeyHex;
      const encryptedResult = encrypt(privateKey);


      // Prepare the data to save to Firestore
      const walletData = {
        id: userId,
        publicKey: address,
        userName: username,
        iv: encryptedResult.iv, // Store the IV from encryption result
        referralLink: ` https://t.me/ZiptosWalletBot?start=${userId}`,
        referredBy: "",
        encryptedData: encryptedResult.encryptedData, // Store the encrypted private key
      };


      // Save to Firestore
      await setDoc(doc(db, "testWalletUsers", userId), walletData);

      // Update local state
      setData([walletData]);
      setPublicKey(address);
      setIvData(encryptedResult.iv);
      const res = usePublicKey.getState().publicKey;
      setEncryptedValue(encryptedResult.encryptedData);
      setAddress(res);

      return walletData;
    } catch (error) {
      console.error("Error generating wallet:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initializeUser = async () => {
      if (typeof window !== 'undefined' && WebApp.initDataUnsafe.user) {
        const user = WebApp.initDataUnsafe.user as UserData;
        setUserData(user);
        
        try {
          // Check if user exists in database
          const querySnapshot = await getDocs(collection(db, "testWalletUsers"));
          const matchedData = querySnapshot.docs
            .map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }))
            .filter((doc) => doc.id === String(user.id)) as MyData[];

          if (matchedData.length > 0) {
            // Existing user
            fetchTokenBalances(matchedData[0].publicKey);

            setData(matchedData);
            setPublicKey(matchedData[0].publicKey);
            setIvData(matchedData[0].iv);
            setEncryptedValue(matchedData[0].encryptedData);
            const res = usePublicKey.getState().publicKey;
            setAddress(res);
            console.log(address)

          } 
          else {
            // New user - generate wallet
            const newWalletData = await generateAndSaveWallet(
              String(user.id),
              user.username || 'Anonymous'
            );
            // Wallet data is already set in generateAndSaveWallet
          }
        } catch (error) {
          console.error("Error initializing user:", error);
        }
      }
    };

    initializeUser();
  }, []);

 

  const handleCopy = () => {
    if (address) {
      navigator.clipboard.writeText(address)
        .then(() => {
          toast.success('copied to clipboard!', {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
          });
        })
        .catch((err) => {
          toast.error('Failed to copy!', {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
          });
          console.error('Failed to copy: ', err);
        });
    }
  };
  
   
  const toggleBalanceVisibility = () => {
    setIsBalanceVisible(!isBalanceVisible); // Toggle balance visibility
  };

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
                <span className="text-lg font-medium">{userData?.username || 'N/A'}</span>
                <img src="/dropdown.svg" alt="" className="ml-4 w-6 h-6" />
              </div>
              <div className="flex ml-2">
              {isLoading ? (
    <span 
      ref={spanRef}
      className="text-s text-white font-extralight mt-1"
    >
      Generating wallet...
    </span>
  ) : address ? (
    <span
      ref={spanRef}
      className="text-s text-white font-extralight mt-1"
    >
      {address.slice(0, 6)}...{address.slice(-4)}
    </span>
  ) : (
    <span 
      ref={spanRef}
      className="text-s text-white font-extralight mt-1"
    >
      Loading...
    </span>
  )}

                <img onClick={handleCopy} src="/copy.svg" alt="" className="ml-2" />

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
            <h2 className="text-4xl mt-1 font-semibold"> $
            {isBalanceVisible ? (totalBalance * (price || 0)).toFixed(3) : '*****'}
            </h2>
          </div>
          <img src="/eye.svg" alt="" className="h-6 w-6"
                        onClick={toggleBalanceVisibility}
                        />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between w-full space-x-4 px-4 py-4">
        <button className="flex flex-col items-center space-y-1 text-center">
          <Link href="/Send">
            <div className="w-20 h-20 bg-[#323030]/40 border border-[#424242] shadow-lg shadow-[#F4A100]/15 rounded-full flex items-center justify-center">
              <img src="/send.svg" alt="" />
            </div>{" "}
            {/* Arrow icon */}
            <p className="text-s">Send</p>
          </Link>
        </button>

        <button className="flex flex-col items-center space-y-1 text-center">
          <Link href="/Receive">
            <div className="w-20 h-20 bg-[#323030]/40  border border-[#424242] shadow-lg shadow-[#F4A100]/15 rounded-full flex items-center justify-center">
              <img src="/send.svg" alt="" className="transform rotate-180" />
            </div>{" "}
            {/* Request icon */}
            <p className="text-s mt-1">Request</p>
          </Link>
        </button>
        <button className="flex flex-col items-center space-y-1 text-center">
          <Link href="/Buy">
            <div className="w-20 h-20 bg-[#323030]/40  border border-[#424242] shadow-lg shadow-[#F4A100]/15 rounded-full flex items-center justify-center">
              <img src="/Vector.svg" alt="" />
            </div>{" "}
            {/* Dollar icon */}
            <p className="text-s mt-1">Buy</p>
          </Link>
        </button>
        <button className="flex flex-col items-center space-y-1 text-center">
          <Link href="/Activity">
            <div className="w-20 h-20 bg-[#323030]/40  border border-[#424242] shadow-lg shadow-[#F4A100]/15 rounded-full flex items-center justify-center">
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
          {(['Tokens', 'NFTs'] as const).map((tab) => (

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


      {/* {tokenBalances.length > 0 ? (
        <div className="mt-4 space-y-4">
          {tokenBalances.map((token, index) => (
            <div key={index} className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-[#484848]/50 rounded-full flex items-center justify-center">
                  <span className="text-lg text-white font-medium">{token.name.charAt(0)}</span>
                </div>
                <div>
                  <p className="font-medium">{token.name}</p>
                  <p className="text-s text-[#9F9F9F]">{token.balance.toFixed(2)} {token.standard === 'v1' ? 'v1' : 'v2'}</p>
                </div>
              </div>
              
            </div>
          ))}
          </div> */}



{tokenBalances.length > 0 ? (
  <div className="flex flex-col space-y-4">
    {tokenBalances.map((token, index) => (
      <div key={index} className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-[url('../public/aptos.svg')] rounded-full"></div>
          <div className="grid-rows-2">
            <p className="font-semibold px-4 text-xl">{token.symbol}</p>

            <p className="font-light px-4 text-s mt-1">
              ${price}
              <span
                className={
                  pnl !== null && pnl >= 0
                    ? "ml-1 text-green-500"
                    : "ml-1 text-red-500"
                }
              >
                {pnl !== null ? String(pnl).slice(0, 4) : "N/A"}%
              </span>
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-lg text-white font-medium">
            {token.balance.toFixed(2)}
          </span>
          <p className="text-xl font-bold">  {(token.balance * (price || 0)).toFixed(2)}
          </p>
        </div>
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