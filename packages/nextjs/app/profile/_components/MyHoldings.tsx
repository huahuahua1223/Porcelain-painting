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
  price?: string;  // 新增的属性，用于存储用户输入的价格
  isFractionalized?: boolean; // 新增属性，标识是否碎片化
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

  const handleFractionalized = () => {
    setRefresh(prev => !prev);
  };

  useEffect(() => {
    const updateMyCollectibles = async (): Promise<void> => {
      if (myTotalBalance === undefined || yourCollectibleContract === undefined || connectedAddress === undefined)
        return;

      setAllCollectiblesLoading(true);
      const collectibleUpdate: Collectible[] = [];
      const totalBalance = parseInt(myTotalBalance.toString());
      for (let tokenIndex = 0; tokenIndex < totalBalance; tokenIndex++) {
        try {
          const tokenId = await yourCollectibleContract.read.tokenOfOwnerByIndex([
            connectedAddress,
            BigInt(tokenIndex),
          ]);

          const isFractionalized = await yourCollectibleContract.read.isNFTFractionalized([tokenId]);

          const tokenURI = await yourCollectibleContract.read.tokenURI([tokenId]);
          const nftMetadata: NFTMetaData = await getMetadataFromIPFS(tokenURI as string);

          collectibleUpdate.push({
            id: parseInt(tokenId.toString()),
            uri: tokenURI,
            owner: connectedAddress,
            isFractionalized: isFractionalized,
            ...nftMetadata,
          });
        } catch (e) {
          notification.error("Error fetching all collectibles");
          setAllCollectiblesLoading(false);
          console.log(e);
        }
      }
      collectibleUpdate.sort((a, b) => a.id - b.id);
      setMyAllCollectibles(collectibleUpdate);
      setAllCollectiblesLoading(false);
    };

    updateMyCollectibles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectedAddress, myTotalBalance, refresh]);

  if (allCollectiblesLoading)
    return (
      <div className="flex justify-center items-center mt-10">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );

  return (
    <>
      {/* {myAllCollectibles.length === 0 ? (
        <div className="flex justify-center items-center mt-10">
          <div className="text-2xl text-primary-content">No NFTs found</div>
        </div>
      ) : ( */}
        <>
          <div className="flex flex-wrap gap-4 my-8 px-5 justify-center">
            {myAllCollectibles.map(item => (
              <div key={item.id}>
              {!item.isFractionalized && (
                <NFTCard nft={item} onFractionalized={handleFractionalized} />
              )}
              {/* {item.isFractionalized && (
                <div className="mt-2">
                  <h3 className="text-lg font-semibold">Token ID: {item.id} 的碎片</h3>
                  <FractionOperations tokenId={item.id} onOperationComplete={handleFractionalized} />
                </div>
              )} */}
            </div>
          ))}
          {/* <FractionOperations onOperationComplete={handleFractionalized} /> */}
        </div>
        <FractionOperations onOperationComplete={handleFractionalized} />
      </>
      {/* )} */}
    </>
  );
};
