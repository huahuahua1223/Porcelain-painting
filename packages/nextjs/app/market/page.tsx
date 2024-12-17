"use client";

import { useEffect, useState } from "react";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";
import { getMetadataFromIPFS } from "~~/utils/simpleNFT/ipfs-fetch";
import { NFTMetaData } from "~~/utils/simpleNFT/nftsMetadata";
import { formatEther } from "viem"; 
import Link from "next/link";
import { useRouter } from "next/navigation";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";

const ListNFTsPage: NextPage = () => {
  const { address: connectedAddress, isConnected, isConnecting } = useAccount();
  const [listedNFTs, setListedNFTs] = useState<any[]>([]);
  const [nftDetails, setNftDetails] = useState<Record<number, NFTMetaData | null>>({});
  const router = useRouter();
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: Infinity });
  const [filteredNFTs, setFilteredNFTs] = useState<any[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(10); // 初始最大价格
  const [traits, setTraits] = useState<Record<string, Set<string>>>({});
  const [selectedTraits, setSelectedTraits] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 3;

  // 获取所有上架的 NFT
  const { data: onSaleNfts } = useScaffoldReadContract({
    contractName: "YourCollectible",
    functionName: "getAllListedItems",
    watch: true,
  });
  const { writeContractAsync } = useScaffoldWriteContract("YourCollectible");

  // 初始化 NFT 列表和最大价格
  useEffect(() => {
    if (onSaleNfts) {
      setListedNFTs(onSaleNfts);
      onSaleNfts.forEach((nft: any) => {
        fetchNFTDetails(nft.tokenUri, nft.tokenId); // 获取每个 NFT 的详细信息
      });

      // 计算最大价格
      const prices = onSaleNfts.map((nft: any) => Number(formatEther(nft.price)));
      const maxPrice = Math.max(...prices);
      setMaxPrice(maxPrice);
    }
  }, [onSaleNfts]);

  // 根据价格和属性筛选 NFT
  useEffect(() => {
    const filtered = listedNFTs.filter((nft) => {
      const priceETH = Number(formatEther(nft.price));

      // 筛选符合价格范围和选择属性的 NFT
      const matchesTraits = Object.entries(selectedTraits).every(([traitType, value]) => {
        const metadata = nftDetails[nft.tokenId];
        if (!metadata?.attributes) return false;
        return metadata.attributes.some(attr => attr.trait_type === traitType && attr.value === value);
      });

      return priceETH >= priceRange.min && priceETH <= priceRange.max && matchesTraits;
    });
    setFilteredNFTs(filtered);
  }, [listedNFTs, priceRange, selectedTraits, nftDetails]);

  // 获取 NFT 详细信息的函数
  const fetchNFTDetails = async (tokenUri: string, tokenId: number) => {
    try {
      const metadata = await getMetadataFromIPFS(tokenUri); // 通过 IPFS 获取 NFT 元数据
      setNftDetails((prevDetails) => ({
        ...prevDetails,
        [tokenId]: metadata,
      }));

      // 动态提取属性
      metadata?.attributes?.forEach(attr => {
        setTraits(prev => {
          const newTraits = { ...prev };
          if (!newTraits[attr.trait_type]) {
            newTraits[attr.trait_type] = new Set();
          }
          newTraits[attr.trait_type].add(attr.value);
          return newTraits;
        });
      });
    } catch (error) {
      console.error(`Failed to fetch metadata for token ${tokenId}`, error);
      setNftDetails((prevDetails) => ({
        ...prevDetails,
        [tokenId]: null,
      }));
    }
  };

  // 更新选择的属性
  const handleTraitChange = (traitType: string, value: string) => {
    setSelectedTraits(prev => ({
      ...prev,
      [traitType]: value,
    }));
  };

  // 购买 NFT 函数
  const handleBuyNFT = async (tokenId: number, price: number) => {
    const notificationId = notification.loading("Purchasing NFT...");
    const formattedPrice = BigInt(price);

    try {
      await writeContractAsync({
        functionName: "buyItem",
        args: [BigInt(tokenId)],
        value: formattedPrice,
      });

      notification.success("NFT purchased successfully!");
    } catch (error) {
      notification.error("Failed to purchase NFT.");
      console.error(error);
    } finally {
      notification.remove(notificationId);
    }
  };

  // 跳转到详情页
  const handleViewNFTDetails = (tokenId: number) => {
    router.push(`/market/nftDetail/${tokenId}`);
  };

  // 计算当前页的NFT
  const indexOfLastNFT = currentPage * itemsPerPage;
  const indexOfFirstNFT = indexOfLastNFT - itemsPerPage;
  const currentNFTs = filteredNFTs.slice(indexOfFirstNFT, indexOfLastNFT);

  // 处理页码更改
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="flex flex-col items-center pt-10">
      <h1 className="text-4xl font-bold mb-8">Available NFTs</h1>

      {/* 价格筛选滑动条 */}
      <div className="mb-4 w-full max-w-md">
        <label className="block mb-2">Price Range (ETH):</label>
        <Slider
          range
          min={0}
          max={maxPrice} // 使用动态最大价格
          defaultValue={[0, maxPrice]}
          onChange={(value) => setPriceRange({ min: value[0], max: value[1] })}
        />
        <div className="flex justify-between mt-2">
          <span>{priceRange.min} ETH</span>
          <span>{priceRange.max} ETH</span>
        </div>
      </div>

      {/* 动态属性筛选 */}
      <div className="mb-4 w-full max-w-md flex flex-wrap gap-4">
        {Object.keys(traits).map(traitType => (
          <div key={traitType} className="flex-1 min-w-[150px]">
            <label className="block mb-2 font-semibold text-lg">{traitType}:</label>
            <div className="relative">
              <select
                className="select select-bordered w-full pl-10 pr-4 py-2 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                onChange={(e) => handleTraitChange(traitType, e.target.value)}
              >
                <option value="">All</option>
                {Array.from(traits[traitType]).map(value => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 3a1 1 0 011 1v1h2a1 1 0 110 2h-2v1a1 1 0 11-2 0V7H7a1 1 0 110-2h2V4a1 1 0 011-1z" />
                </svg>
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* NFT 列表展示 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentNFTs.length > 0 ? (
          currentNFTs.map((nft, index) => {
            const metadata = nftDetails[nft.tokenId];
            const priceETH = formatEther(nft.price);

            return (
              <div key={index} className="card w-96 bg-base-100 shadow-xl">
                <figure>
                  <img
                    src={metadata?.image || "/placeholder.png"}
                    alt={metadata?.name || "NFT Image"}
                    className="w-full h-60 object-cover"
                    onClick={() => handleViewNFTDetails(nft.tokenId)}
                  />
                </figure>
                <div className="card-body">
                  <h2 className="card-title">{metadata?.name || "Unnamed NFT"}</h2>
                  <p className="text-gray-500">{Number(priceETH)} ETH</p>
                  <div className="card-actions justify-end">
                    {!isConnected || isConnecting ? (
                      <RainbowKitCustomConnectButton />
                    ) : (
                      <>
                        <Link href={`/market/nftDetail/${nft.tokenId}`} passHref>
                          <button className="btn btn-secondary">View Details</button>
                        </Link>
                        <button
                          className="btn btn-primary"
                          onClick={() => handleBuyNFT(nft.tokenId, nft.price)}
                        >
                          Buy NFT
                        </button>
                      </>
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

      {/* 分页控件 */}
      <div className="flex justify-center mt-4">
        {Array.from({ length: Math.ceil(filteredNFTs.length / itemsPerPage) }, (_, i) => (
          <button
            key={i}
            className={`btn ${currentPage === i + 1 ? 'btn-primary' : 'btn-secondary'} mx-1`}
            onClick={() => handlePageChange(i + 1)}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ListNFTsPage;
