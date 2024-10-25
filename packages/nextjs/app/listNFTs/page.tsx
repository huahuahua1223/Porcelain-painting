"use client";

import { useEffect, useState } from "react";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";
import { getMetadataFromIPFS } from "~~/utils/simpleNFT/ipfs-fetch";
import { NFTMetaData } from "~~/utils/simpleNFT/nftsMetadata";

const ListNFTsPage: NextPage = () => {
  const { address: connectedAddress, isConnected, isConnecting } = useAccount();
  const [listedNFTs, setListedNFTs] = useState<any[]>([]);
  const [nftDetails, setNftDetails] = useState<Record<number, NFTMetaData | null>>({});

  // 合约读取和写入的hook
  const { data: nftsData } = useScaffoldReadContract({
    contractName: "YourCollectible",
    functionName: "getAllListedItems",
  });

  const { writeContractAsync } = useScaffoldWriteContract("YourCollectible");

  useEffect(() => {
    if (nftsData) {
      setListedNFTs(nftsData);
      nftsData.forEach((nft: any) => {
        fetchNFTDetails(nft.tokenUri, nft.tokenId); // 获取每个NFT的详细信息
      });
    }
  }, [nftsData]);

  // 获取NFT详细信息的函数
  const fetchNFTDetails = async (tokenUri: string, tokenId: number) => {
    try {
      const metadata = await getMetadataFromIPFS(tokenUri); // 通过IPFS获取NFT元数据
      setNftDetails((prevDetails) => ({
        ...prevDetails,
        [tokenId]: metadata,
      }));
    } catch (error) {
      console.error(`Failed to fetch metadata for token ${tokenId}`, error);
      setNftDetails((prevDetails) => ({
        ...prevDetails,
        [tokenId]: null,
      }));
    }
  };

  // 购买NFT函数
  const handleBuyNFT = async (tokenId: number, price: number) => {
    const notificationId = notification.loading("Purchasing NFT...");
    const formattedPrice = BigInt(price);

    try {
      const tx = await writeContractAsync({
        functionName: "buyItem",
        args: [BigInt(tokenId)],
        value: formattedPrice,
      });

      await tx.wait(); // 等待交易完成
      notification.success("NFT purchased successfully!");
    } catch (error) {
      notification.error("Failed to purchase NFT.");
      console.error(error);
    } finally {
      notification.remove(notificationId);
    }
  };

  return (
    <div className="flex flex-col items-center pt-10">
      <h1 className="text-4xl font-bold mb-8">Available NFTs</h1>

      {/* NFT 列表展示 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {listedNFTs.length > 0 ? (
          listedNFTs.map((nft, index) => {
            const metadata = nftDetails[nft.tokenId];

            return (
              <div key={index} className="card w-96 bg-base-100 shadow-xl">
                <figure>
                  <img
                    src={metadata?.image || "/placeholder.png"} // 使用元数据中的image字段
                    alt={metadata?.name || "NFT Image"}
                    className="w-full h-60 object-cover"
                  />
                </figure>
                <div className="card-body">
                  <h2 className="card-title">{metadata?.name || "Unnamed NFT"}</h2>
                  <p>{metadata?.description || "No description available."}</p>
                  <p className="text-gray-500">Price: {Number(nft.price)} wei</p>
                  
                  {/* 显示NFT属性 */}
                  {metadata?.attributes && (
                    <div className="mb-2">
                      <h3 className="font-semibold">Attributes:</h3>
                      <ul>
                        {metadata.attributes.map((attribute, idx) => (
                          <li key={idx}>
                            {attribute.trait_type}: {attribute.value}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="card-actions justify-end">
                    {!isConnected || isConnecting ? (
                      <RainbowKitCustomConnectButton />
                    ) : (
                      <button
                        className="btn btn-primary"
                        onClick={() => handleBuyNFT(nft.tokenId, nft.price)}
                      >
                        Buy NFT
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <p>No NFTs listed for sale.</p>
        )}
      </div>
    </div>
  );
};

export default ListNFTsPage;
