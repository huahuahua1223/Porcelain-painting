"use client";

import type { NextPage } from "next";
import { motion, AnimatePresence } from "framer-motion";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldEventHistory } from "~~/hooks/scaffold-eth";
import { format } from "date-fns";
import { formatEther } from "viem";

const Transfers: NextPage = () => {
  const { data: buyEvents, isLoading, error } = useScaffoldEventHistory({
    contractName: "YourCollectible",
    eventName: "NftBought",
    fromBlock: 0n,
    blockData: true,
  });

  // 动画配置
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  // 装饰性配置
  const floatingIcons = [
    { icon: "💫", delay: 0 },
    { icon: "📊", delay: 1 },
    { icon: "🔄", delay: 2 },
    { icon: "📈", delay: 3 },
    { icon: "✨", delay: 4 },
  ];

  const particles = Array.from({ length: 30 }).map((_, i) => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: 2 + Math.random() * 3,
    delay: Math.random() * 2,
  }));

  const statsData = buyEvents ? [
    { label: "总交易次数", value: buyEvents.length.toString(), icon: "🔄" },
    { label: "总交易额", value: `${formatEther(buyEvents.reduce((acc, event) => acc + (event.args.price ?? 0n), 0n))} ETH`, icon: "💰" },
    { label: "总版税", value: `${formatEther(buyEvents.reduce((acc, event) => acc + (event.args.royaltyAmount ?? 0n), 0n))} ETH`, icon: "💎" },
  ] : [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base-300 via-base-100 to-base-300 flex justify-center items-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
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
          <p className="mt-4 text-lg">加载交易记录中...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base-300 via-base-100 to-base-300 flex justify-center items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-error/20 text-error p-8 rounded-3xl text-center"
        >
          <h2 className="text-2xl font-bold mb-2">出错了</h2>
          <p>加载交易记录时发生错误</p>
        </motion.div>
      </div>
    );
  }

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
          className="absolute w-96 h-96 -top-48 -left-48 bg-primary/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute w-96 h-96 -bottom-48 -right-48 bg-secondary/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* 添加浮动图标 */}
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
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* 标题部分 */}
        <motion.div variants={itemVariants} className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent 
              drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">
              交易记录
            </span>
          </h1>
          <p className="text-xl text-base-content/70">
            查看所有 NFT 的交易历史
          </p>
        </motion.div>

        {/* 统计卡片 */}
        {buyEvents && buyEvents.length > 0 && (
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            {statsData.map((stat, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className="bg-base-100/50 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-base-content/5
                  hover:shadow-2xl hover:bg-base-100/60 transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className="text-3xl">{stat.icon}</div>
                  <div>
                    <p className="text-sm text-base-content/70">{stat.label}</p>
                    <p className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      {stat.value}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* 表格区域 */}
        <motion.div
          variants={itemVariants}
          className="bg-base-100/70 backdrop-blur-md rounded-3xl shadow-xl overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th className="bg-base-200/50">Token ID</th>
                  <th className="bg-base-200/50">卖家</th>
                  <th className="bg-base-200/50">买家</th>
                  <th className="bg-base-200/50">成交价格 (ETH)</th>
                  <th className="bg-base-200/50">购买时间</th>
                  <th className="bg-base-200/50">版税收取人</th>
                  <th className="bg-base-200/50">版税额 (ETH)</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {!buyEvents || buyEvents.length === 0 ? (
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <td colSpan={7} className="text-center py-8">
                        <p className="text-base-content/70">暂无交易记录</p>
                      </td>
                    </motion.tr>
                  ) : (
                    buyEvents?.map((event, index) => {
                      const tokenId = event.args.tokenId?.toString() ?? "N/A";
                      const seller = event.args.seller ?? "N/A";
                      const buyer = event.args.buyer ?? "N/A";
                      const priceInEth = formatEther(event.args.price ?? 0n);
                      const blocktimestamp = event.block?.timestamp;
                      const timestamp = blocktimestamp
                        ? format(new Date(Number(blocktimestamp) * 1000), "yyyy-MM-dd HH:mm:ss")
                        : "N/A";
                      const royaltyReceiver = event.args.royaltyReceiver ?? "N/A";
                      const royaltyAmountInEth = formatEther(event.args.royaltyAmount ?? 0n);

                      return (
                        <motion.tr
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="hover:bg-base-200/50"
                        >
                          <td className="text-center font-medium">{tokenId}</td>
                          <td><Address address={seller as `0x${string}` | undefined} /></td>
                          <td><Address address={buyer as `0x${string}` | undefined} /></td>
                          <td className="text-center font-medium text-primary">{priceInEth}</td>
                          <td className="text-center text-base-content/70">{timestamp}</td>
                          <td><Address address={royaltyReceiver as `0x${string}` | undefined} /></td>
                          <td className="text-center font-medium text-secondary">{royaltyAmountInEth}</td>
                        </motion.tr>
                      );
                    })
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* 底部装饰 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-12 text-center text-base-content/50"
        >
          <div className="flex justify-center gap-4 mb-4">
            {["📊", "📈", "💹", "📉", "📋"].map((emoji, index) => (
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
          <p className="text-sm">实时追踪 NFT 交易动态</p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Transfers;
