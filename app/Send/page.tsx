"use client"
import React from 'react';
import { useRouter } from "next/navigation";
import { ArrowLeft } from "react-feather";
import { Aptos, Ed25519PrivateKey, Account } from "@aptos-labs/ts-sdk";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { getFirestore, collection, getDocs } from "firebase/firestore";
import db from "@/firebaseConfig";
import WebApp from "@twa-dev/sdk";
import { aptos } from '@/components/WalletScreen';

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
  iconSrc: string;
}

const TokenCard: React.FC<TokenCardProps> = ({ iconSrc }) => {
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([]);
  const [data, setData] = useState<MyData[]>([]);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [account, setAccount] = useState<Account | null>(null);
  const [transferFunction, setTransferFunction] = useState<((contractAddress: string, toAddress: string, amount: string) => Promise<string>) | null>(null);

  const crypto = require('crypto');
  const algorithm = 'aes-256-cbc';
  const key = crypto.createHash('sha256').update('TEST_KEY').digest();

  function decrypt(text: any) {
    let iv = Buffer.from(text.iv, 'hex');
    let encryptedText = Buffer.from(text.encryptedData, 'hex');
    let decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  }

  useEffect(() => {
    if (typeof window !== 'undefined' && WebApp.initDataUnsafe.user) {
      setUserData(WebApp.initDataUnsafe.user as UserData);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (userData?.id) {
          const querySnapshot = await getDocs(collection(db, "testWalletUsers"));
          const matchedData = querySnapshot.docs
            .map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }))
            .filter((doc) => doc.id === String(userData.id)) as MyData[];

          if (matchedData.length > 0) {
            const accountData = matchedData[0];
            const decryptedPrivateKey = decrypt({
              iv: accountData.iv,
              encryptedData: accountData.encryptedData,
            });

            const accountPrivateKey = new Ed25519PrivateKey(decryptedPrivateKey);
            const accountArgs = {
              privateKey: accountPrivateKey,
              address: accountData.publicKey,
            };
            const userAccount = Account.fromPrivateKey(accountArgs);
            setAccount(userAccount);

            setTransferFunction(() => async (contractAddress: string, toAddress: string, amount: string) => {
              if (!userAccount) throw new Error("User account not set");
              return transferLegacyCoin(userAccount, contractAddress, toAddress, amount);
            });

            setData(matchedData);
          }
        }
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    if (userData?.id) {
      fetchData();
    }
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
  
        if ((tokenStandard === 'v1' && !tokenName.includes('LP')) || tokenStandard === 'v2') {
          tempArray.push({
            name: tokenName,
            balance: formattedTokenBalance,
            contractAddress: tokenContractAddress,
            standard: tokenStandard
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
  }, [data]);

    async function transferLegacyCoin(sender: Account, contractAddress: string, toAddresses: string, amount: any): Promise<string> {
    const transaction = await aptos.transaction.build.simple({
      sender: sender.accountAddress,
      data: {
        function: "0x1::aptos_account::transfer_coins",
        typeArguments: [
          contractAddress
        ],
        functionArguments: [
          toAddresses,
          amount
        ],
      },
    });
  
    const senderAuthenticator = aptos.transaction.sign({ signer: sender, transaction });
    const pendingTxn = await aptos.transaction.submit.simple({ transaction, senderAuthenticator });
  
    return pendingTxn.hash;
  }

  

    return (
            
      <div className="bg-[#484848] rounded-2xl p-4 flex justify-between items-center mb-4 shadow-lg">
          <a href='/Send/Address'>
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
            {token.balance.toFixed(2)}{" "}{token.name.charAt(0)}
              {/* <span
                className={changePositive ? "text-green-500" : "text-red-500"}
              >
                {change}
              </span> */}
            </p>
          </div>
                      ))}

        </div>
        </a>

       
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
          iconSrc="aptos.svg"
          // changePositive={true}

        />

        {/* <TokenCard
          name="APT"
          symbol="0"
          price="521.90 APT"
          change=""
          iconSrc="aptos.svg"
          changePositive={true}
        />

        <TokenCard
          name="APT"
          symbol="0"
          price="521.90 APT"
          change=""
          iconSrc="aptos.svg"
          changePositive={true}
        /> */}
    </div>
  );
};

export default Send;