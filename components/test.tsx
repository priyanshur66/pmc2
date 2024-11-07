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
  cdnAssetUris: string;
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
        collectionName: ownership.current_token_data.current_collection.collection_name,
        cdnAssetUris: ownership.current_token_data.current_collection.cdn_asset_uris.cdn_image_uri

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
    setSelectedNFT(tokenDataId)
    router.push(`/nft?tokenDataId=${encodeURIComponent(tokenDataId)}`);
  };

  return (
    <div>
    // componet code
    </div>
  );
};

export default WalletScreen;

