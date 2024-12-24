"use client";

import { useEffect, useState } from "react";
import { NFTCard } from "./NFTCard";
import { useAccount } from "wagmi";
import { useScaffoldContract, useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";
import { getMetadataFromIPFS } from "~~/utils/simpleNFT/ipfs-fetch";
import { NFTMetaData } from "~~/utils/simpleNFT/nftsMetadata";
import { FractionOperations } from "./FractionOperations";

export interface Collectible extends Partial<NFTMetaData> {
  id: number;
  uri: string;
  owner: string;
  price?: string;
  isFractionalized?: boolean;
  isRented?: boolean;
  rentedTo?: string;
  rentExpiry?: number;
  isRentedByMe?: boolean;
}

export const MyHoldings = () => {
  const { address: connectedAddress } = useAccount();
  const [myAllCollectibles, setMyAllCollectibles] = useState<Collectible[]>([]);
  const [allCollectiblesLoading, setAllCollectiblesLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);

  const { data: yourCollectibleContract } = useScaffoldContract({
    contractName: "YourCollectible",
  });

  const { data: myTotalBalance } = useScaffoldReadContract({
    contractName: "YourCollectible",
    functionName: "balanceOf",
    args: [connectedAddress],
    watch: true,
  });

  const handleNFTUpdate = () => {
    setRefresh(prev => !prev);
  };

  useEffect(() => {
    const updateMyCollectibles = async (): Promise<void> => {
      if (myTotalBalance === undefined || yourCollectibleContract === undefined || connectedAddress === undefined)
        return;

      setAllCollectiblesLoading(true);
      const collectibleUpdate: Collectible[] = [];
      
      try {
        // 1. 获取用户拥有的 NFT
        const totalBalance = parseInt(myTotalBalance.toString());
        
        for (let tokenIndex = 0; tokenIndex < totalBalance; tokenIndex++) {
          const tokenId = await yourCollectibleContract.read.tokenOfOwnerByIndex([
            connectedAddress,
            BigInt(tokenIndex),
          ]);

          const isFractionalized = await yourCollectibleContract.read.isNFTFractionalized([tokenId]);
          const tokenURI = await yourCollectibleContract.read.tokenURI([tokenId]);
          const nftMetadata: NFTMetaData = await getMetadataFromIPFS(tokenURI as string);

          const userInfo = await yourCollectibleContract.read.userOf([tokenId]);
          console.log("userinfo============", userInfo)
          const rentedTo = userInfo === "0x0000000000000000000000000000000000000000" ? undefined : userInfo;
          console.log("rentedTo============", rentedTo)

          let rentExpiry;
          if (rentedTo) {
            const expiryTimestamp = await yourCollectibleContract.read.userExpires([tokenId]);
            rentExpiry = Number(expiryTimestamp);
            console.log("rentExpiry============", rentExpiry);
          }

          collectibleUpdate.push({
            id: parseInt(tokenId.toString()),
            uri: tokenURI,
            owner: connectedAddress,
            isFractionalized: isFractionalized,
            isRented: !!rentedTo,
            rentedTo: rentedTo,
            rentExpiry: rentExpiry,
            ...nftMetadata,
          });
        }

        // 2. 获取用户租赁的 NFT
        const totalSupply = await yourCollectibleContract.read.totalSupply();
        console.log("totalSupply=============", totalSupply);
        
        // 遍历所有 NFT
        for (let i = 1; i <= Number(totalSupply); i++) {
          try {
            const tokenId = BigInt(i);
            const userInfo = await yourCollectibleContract.read.userOf([tokenId]);
            
            // 如果当前用户是租赁者
            if (userInfo.toLowerCase() === connectedAddress.toLowerCase()) {
              // 检查这个 NFT 是否已经在列表中（避免重复）
              const isAlreadyIncluded = collectibleUpdate.some(nft => nft.id === i);
              
              if (!isAlreadyIncluded) {
                const owner = await yourCollectibleContract.read.ownerOf([tokenId]);
                const tokenURI = await yourCollectibleContract.read.tokenURI([tokenId]);
                const nftMetadata: NFTMetaData = await getMetadataFromIPFS(tokenURI as string);
                const expiryTimestamp = await yourCollectibleContract.read.userExpires([tokenId]);
                const isFractionalized = await yourCollectibleContract.read.isNFTFractionalized([tokenId]);

                // 检查是否已经过期
                const currentTime = Math.floor(Date.now() / 1000);
                if (Number(expiryTimestamp) > currentTime) {
                  console.log("Found rented NFT:", i);
                  collectibleUpdate.push({
                    id: Number(i),
                    uri: tokenURI,
                    owner: owner,
                    isFractionalized: isFractionalized,
                    isRented: true,
                    rentedTo: connectedAddress,
                    rentExpiry: Number(expiryTimestamp),
                    isRentedByMe: true, // 标记这是租赁来的 NFT
                    ...nftMetadata,
                  });
                }
              }
            }
          } catch (error) {
            console.error(`Error processing token ${i}:`, error);
            continue; // 继续处理下一个 token
          }
        }

        console.log("Final collectibleUpdate:", collectibleUpdate);
        
        collectibleUpdate.sort((a, b) => a.id - b.id);
        setMyAllCollectibles(collectibleUpdate);
        setAllCollectiblesLoading(false);
      } catch (e) {
        notification.error("Error fetching collectibles");
        console.error(e);
        setAllCollectiblesLoading(false);
      }
    };

    updateMyCollectibles();
  }, [connectedAddress, myTotalBalance, refresh]);

  if (allCollectiblesLoading)
    return (
      <div className="flex justify-center items-center mt-10">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );

  return (
    <>
      <div className="flex flex-wrap gap-4 my-8 px-5 justify-center">
        {myAllCollectibles.map(item => (
          <div key={item.id}>
            {!item.isFractionalized && (
              <NFTCard 
                nft={item} 
                onNFTUpdate={handleNFTUpdate}
              />
            )}
          </div>
        ))}
      </div>
      <FractionOperations onOperationComplete={handleNFTUpdate} />
    </>
  );
};
