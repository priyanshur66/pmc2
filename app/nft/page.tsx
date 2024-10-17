"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { ArrowLeft } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import { useSelectedNFT } from "@/store";
import "react-toastify/dist/ReactToastify.css";

interface NFTMetadata {
  tokenName: string;
  collectionName: string;
  amount: string;
  tokenDataId: string;
  ownerAddress: string;
  isSoulboundV2: boolean;
  tokenStandard: string;
  description?: string;
  attributes?: { [key: string]: string | number };
  current_token_data?: {
    current_collection?: {
      cdn_asset_uris?: {
        cdn_image_uri?: string;
      };
    };
  };
}

export default function NFTDetailPage() {
  const params = useParams();
  const [nftData, setNftData] = useState<NFTMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { selectedNFT } = useSelectedNFT();

  useEffect(() => {
    let mounted = true;

    const fetchNFTDetails = async () => {
      // if (!params.id) {
      //   setIsLoading(false);
      //   return;
      // }

      try {
        //const tokenDataId = decodeURIComponent(params.id as string);

        console.log("nft ", selectedNFT);
        const query = `
          query GetNFTDetails {
            current_token_ownerships_v2(
              where: {
                token_data_id: {_eq: "${selectedNFT}"}
              }
            ) {
              token_standard
              token_data_id
              property_version_v1
              owner_address
              is_soulbound_v2
              amount
              current_token_data {
                token_name
                token_uri
                token_properties
                description
                current_collection {
                  collection_name
                  description
                  cdn_asset_uris {
                    cdn_image_uri
                  }
                }
              }
            }
          }
        `;

        const response = await axios.post(
          "https://api.testnet.aptoslabs.com/v1/graphql",
          { query }
        );

        const nftDetails = response.data.data.current_token_ownerships_v2[0];
        if (!nftDetails) throw new Error("NFT not found");

        if (mounted) {
          setNftData({
            tokenName: nftDetails.current_token_data.token_name,
            collectionName:
              nftDetails.current_token_data.current_collection.collection_name,
            amount: nftDetails.amount,
            tokenDataId: nftDetails.token_data_id,
            ownerAddress: nftDetails.owner_address,
            isSoulboundV2: nftDetails.is_soulbound_v2,
            tokenStandard: nftDetails.token_standard,
            description: nftDetails.current_token_data.description,
            attributes: nftDetails.current_token_data.token_properties,
            current_token_data: {
              current_collection: {
                cdn_asset_uris:
                  nftDetails.current_token_data.current_collection
                    .cdn_asset_uris,
              },
            },
          });
          setIsLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(
            err instanceof Error ? err.message : "Failed to fetch NFT details"
          );
          setIsLoading(false);
        }
      }
    };

    fetchNFTDetails();

    return () => {
      mounted = false;
    };
  }, [params.id]);

  const handleCopy = (text: string, type: "Address" | "Token ID") => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copied to clipboard!`, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#F33439]/25 to-[#0F0F0F] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-t-2 border-[#F4A100] border-solid rounded-full animate-spin mb-4 mx-auto"></div>
          <p className="text-gray-400">Loading NFT details...</p>
        </div>
      </div>
    );
  }

  if (error || !nftData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#F33439]/25 to-[#0F0F0F] p-4">
        <div className="mb-4">
          <Link href="/wallet" className="flex items-center text-gray-400">
            <ArrowLeft className="h-6 w-6 mr-2" />
            Back to Wallet
          </Link>
        </div>
        <div className="bg-[#323232]/40 rounded-2xl p-6 text-center">
          <p className="text-red-400">{error || "NFT not found"}</p>
          <Link href="/wallet" className="text-[#F4A100] mt-4 block">
            Return to wallet
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F33439]/25 to-[#0F0F0F]">
      <ToastContainer position="top-right" theme="dark" />

      <div className="p-4 flex items-center">
        <Link href="/wallet" className="mr-4">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-xl font-semibold">NFT Details</h1>
      </div>

      <div className="p-4 space-y-4">
        <div className="bg-[#323232]/40 rounded-2xl p-6">
          {nftData.current_token_data?.current_collection?.cdn_asset_uris
            ?.cdn_image_uri ? (
            <div className="h-64 rounded-xl overflow-hidden mb-4">
              <img
                src={
                  nftData.current_token_data.current_collection.cdn_asset_uris
                    .cdn_image_uri
                }
                alt={nftData.tokenName}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="h-64 bg-[#424242] rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">NFT</span>
            </div>
          )}
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold">{nftData.tokenName}</h2>
              <p className="text-gray-400">{nftData.collectionName}</p>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-sm text-gray-400">Quantity</span>
              <span className="text-lg font-semibold">{nftData.amount}</span>
            </div>
          </div>
          {nftData.description && (
            <p className="mt-4 text-gray-300 text-sm leading-relaxed">
              {nftData.description}
            </p>
          )}
        </div>

        {nftData.attributes && Object.keys(nftData.attributes).length > 0 && (
          <div className="bg-[#323232]/40 rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-4">Properties</h3>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(nftData.attributes).map(([key, value], index) => (
                <div key={index} className="bg-[#424242] rounded-lg p-3">
                  <p className="text-gray-400 text-sm">{key}</p>
                  <p className="font-medium">{String(value)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-[#323232]/40 rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4">Details</h3>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Token Standard</span>
              <span>{nftData.tokenStandard}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-400">Token ID</span>
              <div className="flex items-center">
                <span className="text-sm font-mono">
                  {`${nftData.tokenDataId.slice(
                    0,
                    6
                  )}...${nftData.tokenDataId.slice(-4)}`}
                </span>
                <button
                  onClick={() => handleCopy(nftData.tokenDataId, "Token ID")}
                  className="ml-2 p-1 hover:bg-[#424242] rounded-full transition-colors"
                >
                  <img src="/copy.svg" alt="Copy" className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-400">Owner</span>
              <div className="flex items-center">
                <span className="text-sm font-mono">
                  {`${nftData.ownerAddress.slice(
                    0,
                    6
                  )}...${nftData.ownerAddress.slice(-4)}`}
                </span>
                <button
                  onClick={() => handleCopy(nftData.ownerAddress, "Address")}
                  className="ml-2 p-1 hover:bg-[#424242] rounded-full transition-colors"
                >
                  <img src="/copy.svg" alt="Copy" className="w-4 h-4" />
                </button>
              </div>
            </div>

            {nftData.isSoulboundV2 && (
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Type</span>
                <span className="text-[#F4A100] font-medium">Soulbound</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}