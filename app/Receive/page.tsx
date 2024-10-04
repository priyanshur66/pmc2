"use client"
import React from 'react';
import { useRouter } from "next/navigation";
import { ArrowLeft, Link } from "react-feather";
import WebApp from "@twa-dev/sdk";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import db from "@/firebaseConfig";



interface TokenCardProps {
    name: string;
    symbol: string;
    price: string;
    change: string;
    iconSrc: string;
    changePositive: boolean;
  }

  interface UserData {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code: string;
    is_premium?: boolean;
  }
  
  interface TokenBalance {
    name: string;
    balance: number;
    contractAddress: string;
    standard: string;
    symbol: string;
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
  

const TokenCard: React.FC<TokenCardProps> = ({
    name,
    symbol,
    price,
    change,
    iconSrc,
    changePositive,
  }) => {

    const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([]);
    const [data, setData] = useState<MyData[]>([]);
    const [userData, setUserData] = useState<UserData | null>(null)

    useEffect(() =>{
      if (typeof window !== 'undefined') {
  
      if (WebApp.initDataUnsafe.user) {
        setUserData(WebApp.initDataUnsafe.user as UserData)
      } 
   } })



    useEffect(() => {
      const fetchData = async (msg: any) => {
        try {
          if (userData?.id) {
            const querySnapshot = await getDocs(collection(db, "testWalletUsers"));
            const matchedData = querySnapshot.docs
              .map((doc) => ({
                id: doc.id,
                ...doc.data(),
              }))
              .filter((doc) => doc.id === String(userData.id)) as MyData[];
      
            setData(matchedData);
          }
         
        } 
        catch (error) {
          console.error("Error fetching data: ", error);
        }
      };

      const msg = {
        chat: {
          id: userData?.id,
          username: userData?.username || 'N/A',
        },
        text: '', // Set appropriate text if needed
      };
  
      fetchData(msg);
    }, [userData]);



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
              symbol : tokenSymbol

            });
          } else if (tokenStandard === 'v2') {
            tempArray.push({
              name: tokenName,
              balance: formattedTokenBalance,
              contractAddress: tokenContractAddress,
              standard: tokenStandard,
              symbol : tokenSymbol

            });
          }
        }
    
        setTokenBalances(tempArray);
      } catch (error) {
        console.error('Error fetching token balances:', error);
      }
    };
  
  
    useEffect(() => {
      if (data.length > 0) {
        fetchTokenBalances(data[0].publicKey);
      }
    }, [data, fetchTokenBalances]);

    return (
            
      <div className="bg-[#484848] rounded-lg p-4 flex justify-between items-center mb-4 shadow-lg">
          <a href='/Receive/QR'>
        <div className="flex items-center">
          <img
            src={iconSrc}
            alt=""
            className="w-12 h-12 rounded-full mr-4"
          />

  {tokenBalances.map((token, index) => (

          <div key={index}>
            <h2 className="text-lg font-bold">
            {token.name}
            </h2>
            <p className="text-sm text-white">
            {token.balance.toFixed(2)}{" "}{token.symbol}

            </p>
          </div>
                      ))}
        </div>
        </a>

        {/* <div className='flex flex-col'>
        <span className="text-white font-bold text-end">{symbol}</span>
        <span className='text-white'>$0.00</span>
        </div> */}

      </div>
      


    );
  };

const Receive = () => {

    const router = useRouter();

  return (
    <div className="bg-[#323030] min-h-screen text-white p-4">
      <div className="mb-4 flex items-center">
      <button onClick={() => router.back()} className="text-white">
          {/* Back Arrow Icon */}
          <ArrowLeft className="mr-4" />

        </button>
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 flex ">
      <p className="text-white font-bold text-lg ">
          Select Network
        </p>
      </div>      
      </div>
      
      <div className="flex justify-between items-center mt-10 mb-3 z-[1] space-y-4">
            <div className="relative w-full">
              <img
                src="/search.svg"
                alt=""
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
              />
              <input
                type="text"
                placeholder="Search ..."
                className="w-full py-2 pl-10 rounded-2xl bg-[#494949] text-white placeholder-white focus:outline-none"
              />
            </div>
          </div>
      <div className="mb-4 mt-6">
        <button className="flex items-center bg-[#434343] rounded-2xl px-4 py-2">
            <img src="/i.svg" alt=""/>
          <span className="flex-grow text-left ml-2">All Networks</span>
          <img src='/dropdown.svg' alt='' className='ml-4'/>
        </button>
      </div>


   

        <TokenCard
          name="APT"
          symbol="0"
          price="Aptos"
          change=""
          iconSrc="aptos.svg"
          changePositive={true}
        />
    </div>
  );
};

export default Receive;