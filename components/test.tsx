"use client";
import React, { useState, useEffect, useRef } from "react";
import Navbar from "./Navbar";
import {
  Bars3Icon,
  EllipsisVerticalIcon,
} from "@heroicons/react/16/solid";
import Link from "next/link";
import { getFirestore, collection, getDocs, setDoc, doc } from "firebase/firestore";
import db from "@/firebaseConfig";
import WebApp from "@twa-dev/sdk";
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AptosClient, AptosAccount } from "aptos";
import { usePublicKey, useIvData, useEncryptedValue, useCurrentBalance } from "@/store";
import {
  Aptos,
  AptosConfig,
  Network,
} from "@aptos-labs/ts-sdk";
import { useSelectedNFT } from "@/store";
import { useRouter } from "next/navigation";

const aptosConfig = new AptosConfig({ network: Network.TESTNET });
export const aptos = new Aptos(aptosConfig);

const NODE_URL = "https://fullnode.testnet.aptoslabs.com/v1";
const crypto = require('crypto');
const algorithm = 'aes-256-cbc';
const key = crypto.createHash('sha256').update('KEY_TEST').digest();
const iv = crypto.randomBytes(16);

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

interface NFTBalance {
  tokenStandard: string;
  tokenDataId: string;
  propertyVersionV1: string;
  ownerAddress: string;
  isSoulboundV2: boolean;
  amount: string;
  tokenName: string;
  collectionName: string;
}

type TabType = 'Tokens' | 'NFTs';

const WalletScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('Tokens');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [data, setData] = useState<MyData[]>([]);
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([]);
  const [totalBalance, setTotalBalance] = useState<number>(0);
  const { currentBalance, setCurrentBalance } = useCurrentBalance();
  const [address, setAddress] = useState("");
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const spanRef = useRef<HTMLSpanElement | null>(null);
  const { publicKey, setPublicKey } = usePublicKey();
  const { ivData, setIvData } = useIvData();
  const { encryptedValue, setEncryptedValue } = useEncryptedValue();
  const [isLoading, setIsLoading] = useState(false);
  const [price, setPrice] = useState(null);
  const [pnl, setPnl] = useState(null);
  const [aptPrice, setAptPrice] = useState<number | null>(null);
  const [nftBalances, setNftBalances] = useState<NFTBalance[]>([]);
  const [isLoadingNFTs, setIsLoadingNFTs] = useState(false);
  const {setSelectedNFT} = useSelectedNFT();
  const router = useRouter();





  function encrypt(text: string) {
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return { iv: iv.toString('hex'), encryptedData: encrypted };
  }

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
      let newTotalBalance = 0;

      for (const balance of balances) {
        const tokenDecimals = balance.metadata.decimals;
        const tokenBalance = balance.amount;
        const tokenName = balance.metadata.name;
        const tokenContractAddress = balance.metadata.asset_type;
        const tokenStandard = balance.token_standard;
        const formattedTokenBalance = tokenBalance / (10 ** tokenDecimals);
        const tokenSymbol = balance.metadata.symbol;
  
        if ((tokenStandard === 'v1' && !tokenName.includes('LP')) || tokenStandard === 'v2') {
          tempArray.push({
            name: tokenName,
            balance: formattedTokenBalance,
            contractAddress: tokenContractAddress,
            standard: tokenStandard,
            symbol: tokenSymbol
          });

          if (tokenSymbol === 'APT' && aptPrice !== null) {
            newTotalBalance += formattedTokenBalance * aptPrice;
          }
        }
      }
  
      setTokenBalances(tempArray);
      setTotalBalance(newTotalBalance);
      setCurrentBalance(newTotalBalance);
    }
     catch (error) {
      console.error('Error fetching token balances:', error);
    }
  };

  useEffect(() => {
    const fetchAptPrice = async () => {
      try {
        const response = await axios.get(
          'https://api.coingecko.com/api/v3/simple/price',
          {
            params: {
              ids: 'aptos',
              vs_currencies: 'usd',
            },
          }
        );
        setAptPrice(response.data.aptos.usd);
      } catch (error) {
        console.error('Error fetching APT price:', error);
      }
    };

    fetchAptPrice();
  }, []);

  useEffect(() => {
    if (data.length > 0 && data[0].publicKey) {
      fetchTokenBalances(data[0].publicKey);
    }
  }, [data, aptPrice]);

  const generateAndSaveWallet = async (userId: string, username: string) => {
    try {
      setIsLoading(true);
      const client = new AptosClient(NODE_URL);
      const newAccount = new AptosAccount();
      
      const address = newAccount.address().hex();
      const privateKey = newAccount.toPrivateKeyObject().privateKeyHex;
      const encryptedResult = encrypt(privateKey);

      const walletData = {
        id: userId,
        publicKey: address,
        userName: username,
        iv: encryptedResult.iv,
        referralLink: `https://t.me/ZiptosWalletBot?start=${userId}`,
        referredBy: "",
        encryptedData: encryptedResult.encryptedData,
      };

      await setDoc(doc(db, "testWalletUsers", userId), walletData);

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
          const querySnapshot = await getDocs(collection(db, "testWalletUsers"));
          const matchedData = querySnapshot.docs
            .map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }))
            .filter((doc) => doc.id === String(user.id)) as MyData[];

          if (matchedData.length > 0) {
            fetchTokenBalances(matchedData[0].publicKey);
            setData(matchedData);
            setPublicKey(matchedData[0].publicKey);
            setIvData(matchedData[0].iv);
            setEncryptedValue(matchedData[0].encryptedData);
            const res = usePublicKey.getState().publicKey;
            setAddress(res);
          } else {
            const newWalletData = await generateAndSaveWallet(
              String(user.id),
              user.username || 'Anonymous'
            );
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
    setIsBalanceVisible(!isBalanceVisible);
  };

  const handleTabChange = (tab: TabType) => {
    console.log('Changing tab to:', tab);
    setActiveTab(tab);
  };

  useEffect(() => {
    console.log('Active tab changed:', activeTab);
  }, [activeTab]);


  const fetchNFTBalances = async (publicKey: string): Promise<NFTBalance[]> => {
    const NFTsCollectionUrl = 'https://api.testnet.aptoslabs.com/v1/graphql';
    const query = `
query MyQuery {
  current_token_ownerships_v2(
    where: {owner_address: {_eq: "${publicKey}"}, amount: {_gt: "0"}}
  ) {
    token_standard
    token_data_id
    property_version_v1
    owner_address
    is_soulbound_v2
    amount
    current_token_data {
      collection_id
      token_data_id
      token_name
      current_collection {
        collection_name
        cdn_asset_uris {
          asset_uri
          cdn_image_uri
          raw_image_uri
        }
      }
    }
  }
}
    `;
  
    try {
      const response = await axios.post(NFTsCollectionUrl, { query });
      const nftOwnerships = response.data.data.current_token_ownerships_v2;
  
      const nftBalances: NFTBalance[] = nftOwnerships.map((ownership: any) => ({
        tokenStandard: ownership.token_standard,
        tokenDataId: ownership.token_data_id,
        propertyVersionV1: ownership.property_version_v1,
        ownerAddress: ownership.owner_address,
        isSoulboundV2: ownership.is_soulbound_v2,
        amount: ownership.amount,
        tokenName: ownership.current_token_data.token_name,
        collectionName: ownership.current_token_data.current_collection.collection_name
      }));
  
      return nftBalances;
    } catch (error) {
      console.error('Error fetching NFT balances:', error);
      return [];
    }
  };
  

  useEffect(() => {
    const fetchNFTs = async () => {
      if (activeTab === 'NFTs' && data.length > 0 && data[0].publicKey) {
        setIsLoadingNFTs(true);
        try {
          const nfts = await fetchNFTBalances(data[0].publicKey);
          setNftBalances(nfts);
        } catch (error) {
          console.error('Error fetching NFTs:', error);
        } finally {
          setIsLoadingNFTs(false);
        }
      }
    };

    fetchNFTs();
  }, [activeTab, data]);

  const handleNFTClick = (tokenDataId: string) => {
    // setCurrentSymbol(tokenSymbol)
    // setSelectedToken(contractAddress)
    setSelectedNFT(tokenDataId)
    router.push(`/nft?tokenDataId=${encodeURIComponent(tokenDataId)}`);
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
            <span className="text-xl text-green-400">Main Balances</span>
            <h2 className="text-4xl mt-1 font-semibold"> $
            {/* {isBalanceVisible ? (totalBalance * (price || 0)).toFixed(3) : '*****'} */}
            {isBalanceVisible ? currentBalance.toFixed(3) : '*****'}

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
                onClick={() => handleTabChange(tab)}
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

      {/* Content display based on active tab */}
      <div className="px-4 pt-4 pb-20 space-y-4">
        <div className="bg-[#484848]/50 rounded-lg w-full p-4">
          {activeTab === 'Tokens' ? (
            tokenBalances.length > 0 ? (
              <div className="flex flex-col space-y-4">
                {tokenBalances.map((token, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-10 h-10 bg-[url('../public/aptos.svg')] rounded-full"></div>
                      <div className="grid-rows-2">
                        <p className="font-semibold px-4 text-xl">{token.symbol}</p>
                        {token.symbol === 'APT' && aptPrice !== null && (
                          <p className="font-light px-4 text-s mt-1">
                            ${aptPrice.toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-lg text-white font-medium">
                        {token.balance.toFixed(2)} {token.symbol}
                      </span>
                      {token.symbol === 'APT' && aptPrice !== null ? (
                        <p className="text-xl font-bold">
                          ${(token.balance * aptPrice).toFixed(2)}
                        </p>
                      ) : (
                        <p className="text-xl font-bold">
                          {token.balance.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[#9F9F9F] text-base font-light text-center py-4">
                You don&apos;t have any tokens yet
              </p>
            )
          ) : isLoadingNFTs ? (
            <p className="text-[#9F9F9F] text-base font-light text-center py-4">
              Loading NFTs...
            </p>
          ) : nftBalances.length > 0 ? (
            <div className="flex flex-col space-y-4">
              {nftBalances.map((nft, index) => (
                
                <div key={index} className="flex items-center justify-between"
                onClick={() => handleNFTClick(nft.tokenDataId)}
>
                  <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 bg-[#323232] rounded-full flex items-center justify-center">
                      <span className="text-xs">NFT</span>
                    </div>
                    <div className="grid-rows-2">
                      <p className="font-semibold px-4 text-xl">{nft.tokenName}</p>
                      <p className="font-light px-4 text-s mt-1">
                        {nft.collectionName}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-lg text-white font-medium">
                      Qty: {nft.amount}
                    </span>
                    {nft.isSoulboundV2 && (
                      <p className="text-sm text-[#F4A100]">Soulbound</p>
                    )}
                  </div>
                </div>
                // </Link>
              ))}
            </div>
          ) : (
            <p className="text-[#9F9F9F] text-base font-light text-center py-4">
              You don&apos;t have any NFTs yet
            </p>
          )}
        </div>
      </div>

      <Navbar />
    </div>
    </div>
    </div>
  );
};

export default WalletScreen;

