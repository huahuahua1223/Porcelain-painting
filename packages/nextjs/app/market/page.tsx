"use client";

import { useEffect, useState } from "react";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { formatEther } from "viem";
import { motion, AnimatePresence } from "framer-motion";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";
import { getMetadataFromIPFS } from "~~/utils/simpleNFT/ipfs-fetch";
import { NFTMetaData } from "~~/utils/simpleNFT/nftsMetadata";
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

  // 添加粒子动画配置
  const particles = Array.from({ length: 15 }).map((_, i) => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: 2 + Math.random() * 2,
    delay: Math.random() * 2,
  }));

  // 卡片动画配置
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
      },
    }),
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-base-300 to-base-100 relative overflow-hidden">
      {/* 背景粒子效果 */}
      {particles.map((particle, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-primary rounded-full"
          animate={{
            x: ["0%", `${particle.x}%`, "0%"],
            y: ["0%", `${particle.y}%`, "0%"],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      <div className="flex flex-col items-center pt-10 px-6 relative z-10">
        {/* 标题动画 */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent 
              drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">
              NFT 市场
            </span>
          </h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-base-content/80"
          >
            发现、收藏独特的数字艺术品
          </motion.p>
        </motion.div>

        {/* 筛选器区域 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="w-full max-w-4xl mb-8 p-6 bg-base-200/50 backdrop-blur-sm rounded-3xl shadow-xl"
        >
          {/* 价格筛选 */}
          <div className="mb-6">
            <h3 className="text-lg font-bold mb-4">价格范围 (ETH)</h3>
            <Slider
              range
              min={0}
              max={maxPrice}
              defaultValue={[0, maxPrice]}
              onChange={(value) => setPriceRange({ min: value[0], max: value[1] })}
              className="mb-2"
            />
            <div className="flex justify-between mt-2 text-sm">
              <span>{priceRange.min} ETH</span>
              <span>{priceRange.max} ETH</span>
            </div>
          </div>

          {/* 属性筛选 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.keys(traits).map(traitType => (
              <motion.div
                key={traitType}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="relative"
              >
                <label className="block mb-2 font-semibold">{traitType}</label>
                <select
                  className="select select-bordered w-full bg-base-100/50 backdrop-blur-sm"
                  onChange={(e) => handleTraitChange(traitType, e.target.value)}
                >
                  <option value="">全部</option>
                  {Array.from(traits[traitType]).map(value => (
                    <option key={value} value={value}>{value}</option>
                  ))}
                </select>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* NFT 列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-7xl">
          <AnimatePresence>
            {currentNFTs.map((nft, index) => {
              const metadata = nftDetails[nft.tokenId];
              const priceETH = formatEther(nft.price);

              return (
                <motion.div
                  key={nft.tokenId}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  custom={index}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="card bg-base-100 shadow-xl overflow-hidden group"
                >
                  <figure className="relative aspect-square overflow-hidden">
                    <motion.img
                      src={metadata?.image || "/placeholder.png"}
                      alt={metadata?.name || "NFT Image"}
                      className="w-full h-full object-cover transform-gpu"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.3 }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </figure>

                  <div className="card-body relative z-10">
                    <h2 className="card-title text-xl font-bold">
                      {metadata?.name || "Unnamed NFT"}
                    </h2>
                    <p className="text-2xl font-semibold text-primary">
                      {Number(priceETH)} ETH
                    </p>

                    {/* 属性标签 */}
                    <div className="flex flex-wrap gap-2 my-2">
                      {metadata?.attributes?.slice(0, 3).map((attr, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-primary/10 rounded-full text-xs font-medium"
                        >
                          {attr.trait_type}: {attr.value}
                        </span>
                      ))}
                    </div>

                    <div className="card-actions justify-end mt-4">
                      {!isConnected || isConnecting ? (
                        <RainbowKitCustomConnectButton />
                      ) : (
                        <div className="space-x-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="btn btn-secondary"
                            onClick={() => handleViewNFTDetails(nft.tokenId)}
                          >
                            查看详情
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="btn btn-primary"
                            onClick={() => handleBuyNFT(nft.tokenId, nft.price)}
                          >
                            购买
                          </motion.button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* 分页控件 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center mt-8 space-x-2"
        >
          {Array.from({ length: Math.ceil(filteredNFTs.length / itemsPerPage) }, (_, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={`btn ${currentPage === i + 1 ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => handlePageChange(i + 1)}
            >
              {i + 1}
            </motion.button>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default ListNFTsPage;
