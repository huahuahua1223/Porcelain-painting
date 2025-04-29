"use client";

import { useEffect, useState, Suspense } from "react";
import type { NextPage } from "next";
import { useAccount, usePublicClient } from "wagmi";
import { formatEther } from "viem";
import { motion, AnimatePresence } from "framer-motion";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";
import { getMetadataFromIPFS, saveGasRecord } from "~~/utils/simpleNFT/ipfs-fetch";
import { NFTMetaData } from "~~/utils/simpleNFT/nftsMetadata";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Float, ContactShadows, useGLTF } from "@react-three/drei";

// GLB模型组件
function GLBModel({ modelUrl }: { modelUrl: string }) {
  const { scene } = useGLTF(modelUrl);
  return (
    <group>
      <primitive 
        object={scene} 
        scale={1.5} 
        position={[0, 0, 0]} 
        rotation={[0, 0, 0]}
      />
    </group>
  );
}

// 3D模型查看器组件
function ModelViewer({ modelUrl }: { modelUrl: string }) {
  const [hovering, setHovering] = useState(false);
  
  if (!modelUrl) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-base-200">
        <p className="text-base-content/70">无效的3D模型</p>
      </div>
    );
  }

  return (
    <div 
      className="w-full h-full relative" 
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {hovering && (
        <div className="absolute top-2 right-2 bg-black/70 text-white text-xs p-2 rounded-md z-10 backdrop-blur-sm pointer-events-none">
          <p>👆 拖动: 旋转模型</p>
          <p>🖱️ 滚轮: 放大/缩小</p>
          <p>👉 右键拖动: 平移视图</p>
        </div>
      )}
      <Canvas
        camera={{ 
          position: [0, 0, 3],
          fov: 50,
          near: 0.1,
          far: 1000
        }}
        style={{ width: "100%", height: "100%" }}
      >
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={1}
          maxDistance={10}
          autoRotate={!hovering}
          autoRotateSpeed={1.5}
          rotateSpeed={1.2}
          zoomSpeed={1.2}
          panSpeed={1.2}
          makeDefault
        />
        <Float
          rotationIntensity={0.2}
          floatIntensity={0.2}
          speed={1}
        >
          <Suspense fallback={
            <mesh>
              <sphereGeometry args={[1, 16, 16]} />
              <meshStandardMaterial color="gray" wireframe />
            </mesh>
          }>
            <GLBModel modelUrl={modelUrl} />
          </Suspense>
        </Float>

        <ContactShadows
          opacity={0.4}
          scale={10}
          blur={2}
          far={4}
          resolution={256}
          color="#000000"
          position={[0, -2, 0]}
        />

        {/* 环境光照 */}
        <ambientLight intensity={1.5} />
        
        {/* 主光源 */}
        <directionalLight position={[5, 5, 5]} intensity={0.8} castShadow />
        <directionalLight position={[-5, 5, -5]} intensity={0.8} castShadow />
        <directionalLight position={[0, 5, 0]} intensity={1} castShadow />
        
        {/* 补光 */}
        <pointLight position={[5, 0, 5]} intensity={0.4} color="#ffd93d" />
        <pointLight position={[-5, 0, -5]} intensity={0.4} color="#ffd93d" />
        <pointLight position={[0, 0, 5]} intensity={0.4} color="#ff6b6b" />
        <pointLight position={[0, 0, -5]} intensity={0.4} color="#ff6b6b" />

        {/* 环境氛围光 */}
        <hemisphereLight
          intensity={0.5}
          color="#ffffff"
          groundColor="#666666"
        />
      </Canvas>
    </div>
  );
}

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
  const publicClient = usePublicClient();
  const [fileTypes, setFileTypes] = useState<Record<number, string | null>>({});

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
      // 使用扩展运算符复制数组，避免readonly错误
      setListedNFTs([...onSaleNfts]);
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

      // 检查文件类型
      if (metadata?.image) {
        try {
          const response = await fetch(metadata.image, { method: "HEAD" });
          const contentType = response.headers.get("Content-Type");
          setFileTypes(prev => ({ ...prev, [tokenId]: contentType }));
        } catch (error) {
          console.error(`无法获取文件类型: ${metadata.image}`, error);
          // 如果HEAD请求失败，尝试通过文件扩展名判断
          if (metadata.image.endsWith('.glb')) {
            setFileTypes(prev => ({ ...prev, [tokenId]: "model/gltf-binary" }));
          }
        }
      }

      // 动态提取属性
      metadata?.attributes?.forEach((attr: { trait_type: string; value: string | number }) => {
        setTraits(prev => {
          const newTraits = { ...prev };
          if (!newTraits[attr.trait_type]) {
            newTraits[attr.trait_type] = new Set();
          }
          newTraits[attr.trait_type].add(String(attr.value));
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
      const tx = await writeContractAsync({
        functionName: "buyItem",
        args: [BigInt(tokenId)],
        value: formattedPrice,
      });

      // 等待交易被确认并获取回执
      if (publicClient) {
        const receipt = await publicClient.waitForTransactionReceipt({ 
          hash: tx as `0x${string}` 
        });

        // 保存gas记录
        await saveGasRecord({
          tx_hash: receipt?.transactionHash,
          method_name: 'buyItem',
          gas_used: receipt?.gasUsed,
          gas_price: receipt?.effectiveGasPrice,
          total_cost: BigInt(receipt?.gasUsed * receipt?.effectiveGasPrice),
          user_address: connectedAddress as string,
          block_number: receipt?.blockNumber
        });
      }

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

  // 增强粒子动画配置
  const particles = Array.from({ length: 30 }).map((_, i) => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: 2 + Math.random() * 3,
    delay: Math.random() * 2,
  }));

  // 添加浮动图标配置
  const floatingIcons = [
    { icon: "🛍️", delay: 0 },
    { icon: "💎", delay: 1 },
    { icon: "🎨", delay: 2 },
    { icon: "✨", delay: 3 },
    { icon: "🌟", delay: 4 },
  ];

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
    <div className="min-h-screen  relative overflow-hidden">
      {/* 渐变光晕背景 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-[500px] h-[500px] -top-48 -left-48 bg-primary/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute w-[500px] h-[500px] -bottom-48 -right-48 bg-secondary/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute w-[300px] h-[300px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-accent/10 rounded-full blur-[100px] animate-pulse" />
      </div>

      {/* 动态粒子背景 */}
      {particles.map((particle, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-primary/30 rounded-full"
          animate={{
            x: ["0%", `${particle.x}%`, "0%"],
            y: ["0%", `${particle.y}%`, "0%"],
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* 浮动图标 */}
      {floatingIcons.map((item, index) => (
        <motion.div
          key={index}
          className="absolute text-4xl"
          initial={{ opacity: 0, y: 100 }}
          animate={{
            opacity: [0, 1, 0],
            y: [-20, -100, -20],
            x: [Math.random() * 100, Math.random() * -100, Math.random() * 100],
          }}
          transition={{
            duration: 5,
            delay: item.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
        >
          {item.icon}
        </motion.div>
      ))}

      <div className="flex flex-col items-center pt-10 px-6 relative z-10">
        {/* 标题部分增强 */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-12 relative"
        >
          <motion.div
            animate={{
              scale: [1, 1.02, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 blur-3xl"
          />
          <h1 className="text-5xl font-bold mb-4 relative">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent 
              drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">
              数藏 市场
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

        {/* 筛选器区域增强 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="w-full max-w-4xl mb-8 p-6 bg-base-200/50 backdrop-blur-sm rounded-3xl shadow-xl 
            border border-base-content/5 hover:shadow-2xl transition-all duration-300"
          whileHover={{ scale: 1.01 }}
        >
          {/* 价格筛选 */}
          <div className="mb-6">
            <h3 className="text-lg font-bold mb-4">价格范围 (ETH)</h3>
            <Slider
              range
              min={0}
              max={maxPrice}
              defaultValue={[0, maxPrice]}
              onChange={(value: any) => {
                // 明确指定value类型为数组，避免类型错误
                if (Array.isArray(value)) {
                  setPriceRange({ min: value[0], max: value[1] });
                }
              }}
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

        {/* NFT 卡片列表增强 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-7xl">
          <AnimatePresence>
            {currentNFTs.map((nft, index) => {
              const metadata = nftDetails[nft.tokenId];
              const priceETH = formatEther(nft.price);
              
              // 检查是否为GLB模型
              const isGLBModel = fileTypes[nft.tokenId] === "model/gltf-binary" || 
                (metadata?.image && metadata.image.endsWith('.glb'));

              return (
                <motion.div
                  key={nft.tokenId}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  custom={index}
                  whileHover={{ scale: 1.02 }}
                  className="card bg-base-100/50 backdrop-blur-md shadow-xl border border-base-content/5
                    hover:shadow-2xl hover:bg-base-100/60 transition-all duration-300"
                >
                  <figure className="relative aspect-square overflow-hidden">
                    {isGLBModel ? (
                      // 3D模型展示
                      <div className="w-full h-full">
                        <ModelViewer modelUrl={metadata?.image || ""} />
                      </div>
                    ) : (
                      // 普通图片展示
                      <motion.img
                        src={metadata?.image || "/placeholder.png"}
                        alt={metadata?.name || "NFT Image"}
                        className="w-full h-full object-cover transform-gpu"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.3 }}
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </figure>

                  <div className="card-body relative z-10">
                    <h2 className="card-title text-xl font-bold">
                      {metadata?.name || "未命名数藏"}
                      {isGLBModel && <span className="badge badge-primary ml-2">3D 模型</span>}
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

        {/* 分页控件增强 */}
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

        {/* 底部装饰 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-12 text-center text-base-content/50"
        >
          <div className="flex justify-center gap-4 mb-4">
            {["🛍️", "💎", "🎨", "✨", "🌟"].map((emoji, index) => (
              <motion.span
                key={index}
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 2,
                  delay: index * 0.2,
                  repeat: Infinity,
                }}
                className="text-2xl"
              >
                {emoji}
              </motion.span>
            ))}
          </div>
          <p className="text-sm">探索无限可能的 数藏 世界</p>
        </motion.div>
      </div>
    </div>
  );
};

export default ListNFTsPage;
