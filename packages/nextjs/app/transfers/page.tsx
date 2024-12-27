"use client";

import type { NextPage } from "next";
import { motion, AnimatePresence } from "framer-motion";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldEventHistory } from "~~/hooks/scaffold-eth";
import { format } from "date-fns";
import { formatEther } from "viem";
import { useRouter } from "next/navigation";

const Transfers: NextPage = () => {
  const router = useRouter();

  const { data: buyEvents, isLoading, error } = useScaffoldEventHistory({
    contractName: "YourCollectible",
    eventName: "NftBought",
    fromBlock: 0n,
    blockData: true,
  });

  const { data: leaseEvents, isLoading: isLeaseLoading, error: leaseError } = useScaffoldEventHistory({
    contractName: "YourCollectible",
    eventName: "UpdateUser",
    fromBlock: 0n,
    blockData: true,
  });

  const { data: rewardEvents, isLoading: isRewardLoading, error: rewardError } = useScaffoldEventHistory({
    contractName: "YourCollectible",
    eventName: "LoyaltyRewardClaimed",
    fromBlock: 0n,
    blockData: true,
  });

  const { data: fractionEvents, isLoading: isFractionLoading, error: fractionError } = useScaffoldEventHistory({
    contractName: "YourCollectible",
    eventName: "FractionBought",
    fromBlock: 0n,
    blockData: true,
  });

  const { data: mysteryBoxEvents, isLoading: isMysteryBoxLoading, error: mysteryBoxError } = useScaffoldEventHistory({
    contractName: "YourCollectible",
    eventName: "MysteryBoxPurchased",
    fromBlock: 0n,
    blockData: true,
  });

  const { data: airdropEvents, isLoading: isAirdropLoading, error: airdropError } = useScaffoldEventHistory({
    contractName: "YourCollectible",
    eventName: "AirdropClaimed",
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

  const leaseStatsData = leaseEvents ? [
    { label: "总租赁次数", value: leaseEvents.length.toString(), icon: "🔑" },
    { 
      label: "活跃租赁", 
      value: leaseEvents.filter(event => 
        event.args.expires && Number(event.args.expires) * 1000 > Date.now()
      ).length.toString(), 
      icon: "✅" 
    },
    { 
      label: "已到期", 
      value: leaseEvents.filter(event => 
        !event.args.expires || Number(event.args.expires) * 1000 <= Date.now()
      ).length.toString(), 
      icon: "❌" 
    },
  ] : [];

  const rewardStatsData = rewardEvents ? [
    { label: "总领取次数", value: rewardEvents.length.toString(), icon: "🎁" },
    { 
      label: "总奖励金额", 
      value: `${formatEther(rewardEvents.reduce((acc, event) => acc + (event.args.amount ?? 0n), 0n))} ETH`, 
      icon: "💎" 
    },
  ] : [];

  const fractionStatsData = fractionEvents ? [
    { label: "碎片交易次数", value: fractionEvents.length.toString(), icon: "🧩" },
    { 
      label: "总交易碎片数", 
      value: fractionEvents.reduce((acc, event) => acc + Number(event.args.amount ?? 0n), 0).toString(), 
      icon: "🔢" 
    },
    { 
      label: "总交易金额", 
      value: `${formatEther(fractionEvents.reduce((acc, event) => 
        acc + (event.args.amount ?? 0n) * (event.args.pricePerFraction ?? 0n), 0n))} ETH`, 
      icon: "💰" 
    },
  ] : [];

  const mysteryBoxStatsData = mysteryBoxEvents ? [
    { label: "总购买次数", value: mysteryBoxEvents.length.toString(), icon: "🎁" },
    { label: "今日购买", value: mysteryBoxEvents.filter(event => {
      const timestamp = event.block?.timestamp;
      if (!timestamp) return false;
      const eventDate = new Date(Number(timestamp) * 1000);
      const today = new Date();
      return eventDate.toDateString() === today.toDateString();
    }).length.toString(), icon: "📅" },
  ] : [];

  const airdropStatsData = airdropEvents ? [
    { label: "总领取次数", value: airdropEvents.length.toString(), icon: "🎯" },
    { label: "今日领取", value: airdropEvents.filter(event => {
      const timestamp = event.block?.timestamp;
      if (!timestamp) return false;
      const eventDate = new Date(Number(timestamp) * 1000);
      const today = new Date();
      return eventDate.toDateString() === today.toDateString();
    }).length.toString(), icon: "📅" },
  ] : [];

  // 添加查看详情函数
  const handleViewDetails = (tokenId: string) => {
    router.push(`/market/nftDetail/${tokenId}`);
  };

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
                  <th className="bg-base-200/50">操作</th>
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
                          <td className="text-center">
                            <button
                              onClick={() => handleViewDetails(event.args.tokenId?.toString() ?? "")}
                              className="btn btn-sm btn-primary btn-outline"
                            >
                              查看详情
                            </button>
                          </td>
                        </motion.tr>
                      );
                    })
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* 添加租赁记录标题 */}
        <motion.div 
          variants={itemVariants} 
          className="text-center mt-20 mb-12"
        >
          <h2 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent 
              drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">
              租赁记录
            </span>
          </h2>
          <p className="text-xl text-base-content/70">
            查看所有 NFT 的租赁历史
          </p>
        </motion.div>

        {/* 租赁统计卡片 */}
        {leaseEvents && leaseEvents.length > 0 && (
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            {leaseStatsData.map((stat, index) => (
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
                    <p className="text-2xl font-bold bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
                      {stat.value}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* 租赁记录表格 */}
        <motion.div
          variants={itemVariants}
          className="bg-base-100/70 backdrop-blur-md rounded-3xl shadow-xl overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th className="bg-base-200/50">Token ID</th>
                  <th className="bg-base-200/50">租赁者地址</th>
                  <th className="bg-base-200/50">到期时间</th>
                  <th className="bg-base-200/50">操作时间</th>
                  <th className="bg-base-200/50">操作</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {!leaseEvents || leaseEvents.length === 0 ? (
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <td colSpan={4} className="text-center py-8">
                        <p className="text-base-content/70">暂无租赁记录</p>
                      </td>
                    </motion.tr>
                  ) : (
                    leaseEvents?.map((event, index) => {
                      const tokenId = event.args.tokenId?.toString() ?? "N/A";
                      const user = event.args.user ?? "N/A";
                      const expires = event.args.expires;
                      const expiresDate = expires ? format(new Date(Number(expires) * 1000), "yyyy-MM-dd HH:mm:ss") : "N/A";
                      const blocktimestamp = event.block?.timestamp;
                      const timestamp = blocktimestamp
                        ? format(new Date(Number(blocktimestamp) * 1000), "yyyy-MM-dd HH:mm:ss")
                        : "N/A";

                      // 计算是否已过期
                      const isExpired = expires ? Number(expires) * 1000 < Date.now() : false;

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
                          <td><Address address={user as `0x${string}` | undefined} /></td>
                          <td className="text-center">
                            <span className={`badge ${isExpired ? 'badge-error' : 'badge-success'}`}>
                              {expiresDate}
                            </span>
                          </td>
                          <td className="text-center text-base-content/70">{timestamp}</td>
                          <td className="text-center">
                            <button
                              onClick={() => handleViewDetails(event.args.tokenId?.toString() ?? "")}
                              className="btn btn-sm btn-secondary btn-outline"
                            >
                              查看详情
                            </button>
                          </td>
                        </motion.tr>
                      );
                    })
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* ��加忠诚度奖励记录标题 */}
        <motion.div 
          variants={itemVariants} 
          className="text-center mt-20 mb-12"
        >
          <h2 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent 
              drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">
              忠诚度奖励记录
            </span>
          </h2>
          <p className="text-xl text-base-content/70">
            查看所有 NFT 的忠诚度奖励领取历史
          </p>
        </motion.div>

        {/* 忠诚度奖励统计卡片 */}
        {rewardEvents && rewardEvents.length > 0 && (
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
          >
            {rewardStatsData.map((stat, index) => (
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
                    <p className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      {stat.value}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* 忠诚度奖励记录表格 */}
        <motion.div
          variants={itemVariants}
          className="bg-base-100/70 backdrop-blur-md rounded-3xl shadow-xl overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th className="bg-base-200/50">Token ID</th>
                  <th className="bg-base-200/50">领取者地址</th>
                  <th className="bg-base-200/50">奖励金额 (ETH)</th>
                  <th className="bg-base-200/50">领取时间</th>
                  <th className="bg-base-200/50">操作</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {!rewardEvents || rewardEvents.length === 0 ? (
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <td colSpan={5} className="text-center py-8">
                        <p className="text-base-content/70">暂无奖励领取记录</p>
                      </td>
                    </motion.tr>
                  ) : (
                    rewardEvents?.map((event, index) => {
                      const tokenId = event.args.tokenId?.toString() ?? "N/A";
                      const claimer = event.args.holder ?? "N/A";
                      const rewardAmount = formatEther(event.args.amount ?? 0n);
                      const blocktimestamp = event.block?.timestamp;
                      const timestamp = blocktimestamp
                        ? format(new Date(Number(blocktimestamp) * 1000), "yyyy-MM-dd HH:mm:ss")
                        : "N/A";

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
                          <td><Address address={claimer as `0x${string}` | undefined} /></td>
                          <td className="text-center font-medium text-accent">{rewardAmount}</td>
                          <td className="text-center text-base-content/70">{timestamp}</td>
                          <td className="text-center">
                            <button
                              onClick={() => handleViewDetails(tokenId)}
                              className="btn btn-sm btn-accent btn-outline"
                            >
                              查看详情
                            </button>
                          </td>
                        </motion.tr>
                      );
                    })
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* 添加碎片交易记录标题 */}
        <motion.div 
          variants={itemVariants} 
          className="text-center mt-20 mb-12"
        >
          <h2 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent 
              drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">
              碎片交易记录
            </span>
          </h2>
          <p className="text-xl text-base-content/70">
            查看所有 NFT 碎片的交易历史
          </p>
        </motion.div>

        {/* 碎片交易统计卡片 */}
        {fractionEvents && fractionEvents.length > 0 && (
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            {fractionStatsData.map((stat, index) => (
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
                    <p className="text-2xl font-bold bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
                      {stat.value}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* 碎片交易记录表格 */}
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
                  <th className="bg-base-200/50">购买数量</th>
                  <th className="bg-base-200/50">单价 (ETH)</th>
                  <th className="bg-base-200/50">总价 (ETH)</th>
                  <th className="bg-base-200/50">交易时间</th>
                  <th className="bg-base-200/50">操作</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {!fractionEvents || fractionEvents.length === 0 ? (
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <td colSpan={8} className="text-center py-8">
                        <p className="text-base-content/70">暂无碎片交易记录</p>
                      </td>
                    </motion.tr>
                  ) : (
                    fractionEvents?.map((event, index) => {
                      const tokenId = event.args.tokenId?.toString() ?? "N/A";
                      const seller = event.args.seller ?? "N/A";
                      const buyer = event.args.buyer ?? "N/A";
                      const amount = event.args.amount?.toString() ?? "0";
                      const pricePerFraction = formatEther(event.args.pricePerFraction ?? 0n);
                      const totalPrice = formatEther((event.args.amount ?? 0n) * (event.args.pricePerFraction ?? 0n));
                      const blocktimestamp = event.block?.timestamp;
                      const timestamp = blocktimestamp
                        ? format(new Date(Number(blocktimestamp) * 1000), "yyyy-MM-dd HH:mm:ss")
                        : "N/A";

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
                          <td className="text-center font-medium">{amount}</td>
                          <td className="text-center font-medium text-secondary">{pricePerFraction}</td>
                          <td className="text-center font-medium text-primary">{totalPrice}</td>
                          <td className="text-center text-base-content/70">{timestamp}</td>
                          <td className="text-center">
                            <button
                              onClick={() => handleViewDetails(tokenId)}
                              className="btn btn-sm btn-secondary btn-outline"
                            >
                              查看详情
                            </button>
                          </td>
                        </motion.tr>
                      );
                    })
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* 添加盲盒购买记录标题 */}
        <motion.div 
          variants={itemVariants} 
          className="text-center mt-20 mb-12"
        >
          <h2 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent 
              drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">
              盲盒购买记录
            </span>
          </h2>
          <p className="text-xl text-base-content/70">
            查看所有盲盒的购买历史
          </p>
        </motion.div>

        {/* 盲盒购买统计卡片 */}
        {mysteryBoxEvents && mysteryBoxEvents.length > 0 && (
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
          >
            {mysteryBoxStatsData.map((stat, index) => (
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

        {/* 盲盒购买记录表格 */}
        <motion.div
          variants={itemVariants}
          className="bg-base-100/70 backdrop-blur-md rounded-3xl shadow-xl overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th className="bg-base-200/50">Token ID</th>
                  <th className="bg-base-200/50">购买者</th>
                  <th className="bg-base-200/50">NFT URI</th>
                  <th className="bg-base-200/50">购买时间</th>
                  <th className="bg-base-200/50">操作</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {!mysteryBoxEvents || mysteryBoxEvents.length === 0 ? (
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <td colSpan={5} className="text-center py-8">
                        <p className="text-base-content/70">暂无盲盒购买记录</p>
                      </td>
                    </motion.tr>
                  ) : (
                    mysteryBoxEvents?.map((event, index) => {
                      const tokenId = event.args.tokenId?.toString() ?? "N/A";
                      const buyer = event.args.buyer ?? "N/A";
                      const uri = event.args.uri ?? "N/A";
                      const blocktimestamp = event.block?.timestamp;
                      const timestamp = blocktimestamp
                        ? format(new Date(Number(blocktimestamp) * 1000), "yyyy-MM-dd HH:mm:ss")
                        : "N/A";

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
                          <td><Address address={buyer as `0x${string}` | undefined} /></td>
                          <td className="text-center">
                            <div className="tooltip" data-tip={uri}>
                              {uri.length > 20 ? `${uri.slice(0, 20)}...` : uri}
                            </div>
                          </td>
                          <td className="text-center text-base-content/70">{timestamp}</td>
                          <td className="text-center">
                            <button
                              onClick={() => handleViewDetails(tokenId)}
                              className="btn btn-sm btn-primary btn-outline"
                            >
                              查看详情
                            </button>
                          </td>
                        </motion.tr>
                      );
                    })
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* 添加空投领取记录标题 */}
        <motion.div 
          variants={itemVariants} 
          className="text-center mt-20 mb-12"
        >
          <h2 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent 
              drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">
              空投领取记录
            </span>
          </h2>
          <p className="text-xl text-base-content/70">
            查看所有空投的领取历史
          </p>
        </motion.div>

        {/* 空投领取统计卡片 */}
        {airdropEvents && airdropEvents.length > 0 && (
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
          >
            {airdropStatsData.map((stat, index) => (
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
                    <p className="text-2xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
                      {stat.value}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* 空投领取记录表格 */}
        <motion.div
          variants={itemVariants}
          className="bg-base-100/70 backdrop-blur-md rounded-3xl shadow-xl overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th className="bg-base-200/50">Token ID</th>
                  <th className="bg-base-200/50">领取者</th>
                  <th className="bg-base-200/50">领取时间</th>
                  <th className="bg-base-200/50">操作</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {!airdropEvents || airdropEvents.length === 0 ? (
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <td colSpan={4} className="text-center py-8">
                        <p className="text-base-content/70">暂无空投领取记录</p>
                      </td>
                    </motion.tr>
                  ) : (
                    airdropEvents?.map((event, index) => {
                      const tokenId = event.args.tokenId?.toString() ?? "N/A";
                      const claimer = event.args.claimer ?? "N/A";
                      const blocktimestamp = event.block?.timestamp;
                      const timestamp = blocktimestamp
                        ? format(new Date(Number(blocktimestamp) * 1000), "yyyy-MM-dd HH:mm:ss")
                        : "N/A";

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
                          <td><Address address={claimer as `0x${string}` | undefined} /></td>
                          <td className="text-center text-base-content/70">{timestamp}</td>
                          <td className="text-center">
                            <button
                              onClick={() => handleViewDetails(tokenId)}
                              className="btn btn-sm btn-accent btn-outline"
                            >
                              查看详情
                            </button>
                          </td>
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
