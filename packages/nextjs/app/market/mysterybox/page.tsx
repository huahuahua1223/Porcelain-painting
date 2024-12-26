"use client";

import { useState, useEffect } from "react";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { formatEther } from "viem";
import { motion, AnimatePresence } from "framer-motion";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { useScaffoldWriteContract, useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

interface MysteryBoxInfo {
  price: bigint;
  isActive: boolean;
  totalOptions: bigint;
}

const MysteryBoxMarket: NextPage = () => {
  const { address: connectedAddress, isConnected, isConnecting } = useAccount();
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
      await writeContractAsync({
        functionName: "purchaseMysteryBox",
        value: mysteryBoxInfo.price,
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

  // 粒子动画配置
  const particles = Array.from({ length: 20 }).map((_, i) => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: 2 + Math.random() * 2,
    delay: Math.random() * 2,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-base-300 to-base-100 relative overflow-hidden">
      {/* 背景粒子��果 */}
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

      <div className="flex flex-col items-center pt-10 px-6 max-w-6xl mx-auto relative z-10">
        {/* 标题动画 */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-2">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent 
              drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">
              NFT 盲盒市场
            </span>
          </h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-base-content/80"
          >
            解锁独特数字藏品的神秘之门
          </motion.p>
        </motion.div>

        <AnimatePresence>
          {mysteryBoxInfo ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="w-full max-w-4xl"
            >
              {/* 主展示区 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* 左侧盲盒展示 */}
                <div className="relative group">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-3xl blur-xl"
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
                    className="relative bg-base-100 rounded-3xl p-8 shadow-xl"
                    whileHover={{ y: -5 }}
                  >
                    <motion.img
                      src="/mystery-box1.png"
                      alt="Mystery Box"
                      className="w-full h-auto rounded-2xl transform-gpu"
                      whileHover={{
                        scale: 1.05,
                        rotate: [0, -3, 3, -3, 0],
                      }}
                      transition={{
                        rotate: {
                          repeat: Infinity,
                          duration: 2,
                        },
                      }}
                    />
                    {/* 悬浮光效 */}
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl" />
                  </motion.div>
                </div>

                {/* 右侧信息展示 */}
                <div className="flex flex-col justify-center space-y-6">
                  <motion.div
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="space-y-4"
                  >
                    <h2 className="text-3xl font-bold">
                      <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent
                        drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">
                        神秘 NFT 盲盒
                      </span>
                    </h2>
                    <p className="text-lg text-base-content/80">
                      每个盲盒都蕴含着独特的数字艺术珍品，等待被发现
                    </p>
                  </motion.div>

                  {/* 状态展示 */}
                  <motion.div
                    className="stats stats-vertical lg:stats-horizontal shadow bg-base-200/50 backdrop-blur-sm"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="stat">
                      <div className="stat-title">价格</div>
                      <div className="stat-value text-primary drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]
                        font-extrabold">
                        {formatEther(mysteryBoxInfo.price)} ETH
                      </div>
                    </div>
                    <div className="stat">
                      <div className="stat-title">可选 NFT</div>
                      <div className="stat-value">
                        {mysteryBoxInfo.totalOptions.toString()}
                      </div>
                    </div>
                    <div className="stat">
                      <div className="stat-title">状态</div>
                      <div className={`stat-value ${mysteryBoxInfo.isActive ? "text-success" : "text-error"}`}>
                        {mysteryBoxInfo.isActive ? "销售中" : "已停售"}
                      </div>
                    </div>
                  </motion.div>

                  {/* 购买按钮 */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex justify-center"
                  >
                    {!isConnected || isConnecting ? (
                      <RainbowKitCustomConnectButton />
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`btn btn-primary btn-lg w-full max-w-xs ${isLoading ? "loading" : ""} 
                          relative overflow-hidden group`}
                        onClick={handlePurchase}
                        disabled={isLoading || !mysteryBoxInfo.isActive}
                      >
                        <span className="relative z-10">
                          {isLoading ? "购买中..." : "购买盲盒"}
                        </span>
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-primary to-secondary"
                          initial={{ x: "-100%" }}
                          whileHover={{ x: "100%" }}
                          transition={{ duration: 1 }}
                        />
                      </motion.button>
                    )}
                  </motion.div>
                </div>
              </div>

              {/* 盲盒说明 */}
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-12 bg-base-200/50 backdrop-blur-sm rounded-3xl p-8 shadow-xl"
              >
                <h3 className="text-2xl font-bold mb-6 text-center">盲盒特色</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { icon: "🎁", title: "随机惊喜", text: "每个盲盒包含独特NFT" },
                    { icon: "⚡", title: "即时发放", text: "购买后自动发送到钱包" },
                    { icon: "💎", title: "稀有保证", text: "独一无二的数字藏品" },
                    { icon: "🔒", title: "安全可靠", text: "基于智能合约技术" },
                  ].map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      whileHover={{ y: -5 }}
                      className="bg-base-100 rounded-xl p-6 text-center shadow-lg"
                    >
                      <span className="text-4xl mb-4 block">{feature.icon}</span>
                      <h4 className="text-lg font-bold mb-2">{feature.title}</h4>
                      <p className="text-base-content/70">{feature.text}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center p-12"
            >
              <div className="relative">
                <span className="loading loading-spinner loading-lg text-primary"></span>
                <motion.div
                  className="absolute inset-0 rounded-full bg-primary/20"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 0, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                />
              </div>
              <p className="mt-4 text-lg">加载盲盒信息中...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MysteryBoxMarket; 