"use client"
import React from 'react';
import { useRouter } from "next/navigation";
import { ArrowLeft, Link } from "react-feather";
import { Aptos} from '@aptos-labs/ts-sdk';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import db from "@/firebaseConfig";
import WebApp from "@twa-dev/sdk";
import { strict } from 'assert';
import { useCurrentSymbol } from '@/store';
import { useSelectedToken } from '@/store';


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

interface TokenCardProps {
    // // name: string;
    // symbol: string;
    // price: string;
    // change: string;
    // iconSrc: string;
    // changePositive: boolean;
  }

const TokenCard: React.FC<TokenCardProps> = ({
    // name,
    // symbol,
    // price,
    // change,
    // iconSrc,
    // changePositive,
  }) => {
    const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([]);
    const [data, setData] = useState<MyData[]>([]);
    const [userData, setUserData] = useState<UserData | null>(null);
    const router = useRouter();
    const {currentSymbol, setCurrentSymbol} = useCurrentSymbol();
    const {setSelectedToken} = useSelectedToken();




    useEffect(() =>{
      if (typeof window !== 'undefined') {
  
      if (WebApp.initDataUnsafe.user) {
        setUserData(WebApp.initDataUnsafe.user as UserData)
      } 
   } })

   const handleTokenClick = (contractAddress: string,tokenSymbol:string) => {
    setCurrentSymbol(tokenSymbol)
    setSelectedToken(contractAddress)
    router.push(`/Send/Address?contractAddress=${encodeURIComponent(contractAddress)}`);
  };

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
            setCurrentSymbol(tokenSymbol)

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
      <div>

      {tokenBalances.map((token, index) => (

      <div key={index} 
      
      className="bg-[#484848] rounded-2xl p-4 flex justify-between items-center mb-4 shadow-lg"
      onClick={() => handleTokenClick(token.contractAddress,token.symbol)}
      >
          {/* <a href='/Send/Address'> */}
        <div className="flex items-center">
          <img
            src="/aptos.svg"
            alt=""
            className="w-12 h-12 rounded-full mr-4"
          />

          <div >
            <h2 className="text-lg font-bold">
            {token.name}
            </h2>
            <p className="text-sm text-white">
            {token.balance.toFixed(2)}{" "}{token.symbol}

            </p>
          </div>

        </div>
        {/* </a> */}

      </div>
            ))}

</div>

      


    );
  };

const Send = () => {

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
          Select Token
        </p>
      </div>      
      </div>
      
      <div className="flex justify-between items-center mt-10 mb-5 z-[1] space-y-4 ">
            <div className="relative w-full">
              <img
                src="/search.svg"
                alt=""
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
              />
              <input
                type="text"
                placeholder="Search ..."
                className="w-full py-2 pl-10 rounded-2xl bg-[#212020] border border-[#5E5E5E] text-white placeholder-white focus:outline-none"
              />
            </div>
          </div>



    <TokenCard
          // name="APT"
          // symbol="0"
          // price="521.90 APT"
          // change=""
          // iconSrc="aptos.svg"
          // changePositive={true}

        />

  
    </div>
  );
};

export default Send;