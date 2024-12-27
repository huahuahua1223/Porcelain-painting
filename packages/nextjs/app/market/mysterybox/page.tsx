"use client";

import { useState, useEffect } from "react";
import type { NextPage } from "next";
import { useAccount, usePublicClient } from "wagmi";
import { formatEther } from "viem";
import { motion, AnimatePresence } from "framer-motion";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { useScaffoldContract, useScaffoldReadContract , useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";
import { saveGasRecord } from "~~/utils/simpleNFT/ipfs-fetch";
interface MysteryBoxInfo {
  price: bigint;
  isActive: boolean;
  totalOptions: bigint;
}
const MysteryBoxMarket: NextPage = () => {
  const { address: connectedAddress, isConnected, isConnecting } = useAccount();
  const publicClient = usePublicClient();
  const [isLoading, setIsLoading] = useState(false);
  const [mysteryBoxInfo, setMysteryBoxInfo] = useState<MysteryBoxInfo | null>(null);

  const { writeContractAsync } = useScaffoldWriteContract("YourCollectible");

  // 读取盲盒信息
  const { data: boxInfo } = useScaffoldReadContract({
    contractName: "YourCollectible",
    functionName: "getMysteryBoxInfo",
    watch: true,
  });

  // 更新盲盒信息
  useEffect(() => {
    if (boxInfo) {
      setMysteryBoxInfo({
        price: boxInfo[0],
        isActive: boxInfo[1],
        totalOptions: boxInfo[2],
      });
    }
  }, [boxInfo]);

  // 购买盲盒
  const handlePurchase = async () => {
    if (!mysteryBoxInfo?.isActive) {
      notification.error("盲盒未激活");
      return;
    }

    if (!mysteryBoxInfo?.totalOptions) {
      notification.error("盲盒已售罄");
      return;
    }

    setIsLoading(true);
    const notificationId = notification.loading("正在购买盲盒...");

    try {
      const tx = await writeContractAsync({
        functionName: "purchaseMysteryBox",
        value: mysteryBoxInfo.price,
      });

      // 等待交易被确认并获取回执
      const receipt = await publicClient.waitForTransactionReceipt({ 
        hash: tx as `0x${string}` 
      });

      // 保存gas记录
      await saveGasRecord({
        tx_hash: receipt?.transactionHash,
        method_name: 'purchaseMysteryBox',
        gas_used: receipt?.gasUsed,
        gas_price: receipt?.effectiveGasPrice,
        total_cost: BigInt(receipt?.gasUsed * receipt?.effectiveGasPrice),
        user_address: connectedAddress as string,
        block_number: receipt?.blockNumber
      });

      notification.remove(notificationId);
      notification.success("购买成功！");
    } catch (error) {
      console.error("购买失败:", error);
      notification.remove(notificationId);
      notification.error("购买失败");
    } finally {
      setIsLoading(false);
    }
  };

  // 添加装饰性配置
  const floatingIcons = [
    { icon: "🎁", delay: 0 },
    { icon: "🎲", delay: 1 },
    { icon: "✨", delay: 2 },
    { icon: "🎭", delay: 3 },
    { icon: "🌟", delay: 4 },
  ];

  const particles = Array.from({ length: 30 }).map((_, i) => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: 2 + Math.random() * 3,
    delay: Math.random() * 2,
  }));

  // 创建盲盒数据
  const mysteryBox = mysteryBoxInfo ? {
    id: 1,
    price: mysteryBoxInfo.price,
    remaining: Number(mysteryBoxInfo.totalOptions),
    isActive: mysteryBoxInfo.isActive,
  } : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-300 via-base-100 to-base-300 relative overflow-hidden">
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

      {/* 渐变光晕背景 */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute w-[500px] h-[500px] -top-48 -left-48 bg-primary/10 rounded-full blur-[100px]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute w-[500px] h-[500px] -bottom-48 -right-48 bg-secondary/10 rounded-full blur-[100px]"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

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

      <motion.div
        className="relative z-10 container mx-auto px-6 py-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* 标题部分 */}
        <motion.div 
          className="text-center mb-12"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <h1 className="text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              神秘盲盒市场
            </span>
          </h1>
          <p className="text-xl text-base-content/70">
            探索未知，发现惊喜
          </p>
        </motion.div>

        {/* 盲盒展示 */}
        <motion.div
          className="max-w-md mx-auto"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <AnimatePresence>
            {mysteryBox && (
              <motion.div
                key="mysterybox"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-base-100/50 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-base-content/5
                  hover:shadow-2xl hover:bg-base-100/60 transition-all duration-300"
                whileHover={{ scale: 1.02 }}
              >
                <div className="relative aspect-square mb-4 overflow-hidden rounded-2xl group">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 0.8, 0.5],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                  <motion.div
                    className="text-8xl absolute inset-0 flex items-center justify-center"
                    animate={{
                      rotate: [0, 360],
                    }}
                    transition={{
                      duration: 20,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    🎁
                  </motion.div>
                </div>

                <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  神秘盲盒
                </h3>
                <p className="text-base-content/70 mb-4">
                  打开盲盒，获得随机 NFT！每个盲盒都蕴含着独特的惊喜。
                </p>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xl font-semibold text-primary">
                    {formatEther(mysteryBox.price)} ETH
                  </span>
                  <span className="text-sm text-base-content/50">
                    可选NFT数量:  {mysteryBox.remaining}
                  </span>
                </div>

                <div className="space-y-4">
                  {!isConnected || isConnecting ? (
                    <RainbowKitCustomConnectButton />
                  ) : (
                    <motion.button
                      className={`btn btn-primary w-full ${isLoading ? "loading" : ""}`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handlePurchase}
                      disabled={isLoading || !mysteryBox.isActive || mysteryBox.remaining === 0}
                    >
                      {isLoading ? "购买中..." : "购买盲盒"}
                    </motion.button>
                  )}
                  
                  {!mysteryBox.isActive && (
                    <p className="text-error text-sm text-center">盲盒暂未激活</p>
                  )}
                  {mysteryBox.remaining === 0 && (
                    <p className="text-error text-sm text-center">盲盒已售罄</p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* 底部装饰 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-12 text-center text-base-content/50"
        >
          <div className="flex justify-center gap-4 mb-4">
            {["🎁", "🎲", "✨", "🎭", "🌟"].map((emoji, index) => (
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
          <p className="text-sm">每个盲盒都是一份独特的惊喜</p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default MysteryBoxMarket; 