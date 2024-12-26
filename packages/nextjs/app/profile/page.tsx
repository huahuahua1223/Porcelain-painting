"use client";

import { useAccount } from "wagmi";
import { motion } from "framer-motion";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { MyHoldings } from "./_components";
import { Address } from "~~/components/scaffold-eth";

const ProfilePage = () => {
  const { address, isConnected } = useAccount();

  return (
    <div className="min-h-screen bg-gradient-to-b from-base-300 to-base-100 relative overflow-hidden">
      {/* 背景动态效果 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[500px] h-[500px] -top-48 -left-48 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute w-[500px] h-[500px] -bottom-48 -right-48 bg-secondary/20 rounded-full blur-3xl animate-pulse" />
      </div>

      {/* 主要内容 */}
      <div className="relative z-10 w-full px-4 py-10">
        {/* 标题部分 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent 
              drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">
              个人中心
            </span>
          </h1>
        </motion.div>

        {isConnected ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-[98%] max-w-[2000px] mx-auto space-y-8"
          >
            {/* 用户信息卡片 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-base-100/70 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-base-300/50"
            >
              <div className="flex items-center gap-6">
                <div className="avatar placeholder">
                  <div className="bg-gradient-to-br from-primary to-secondary text-base-100 rounded-full w-20 h-20 flex items-center justify-center transform hover:scale-105 transition-transform duration-200">
                    <span className="text-2xl font-bold">
                      {address?.substring(0, 4).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent 
                    drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">
                    欢迎回来
                  </h2>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
                    <Address address={address} format="long" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* NFT 展示区域 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-base-100/70 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-base-300/50"
            >
              <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent 
                drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">
                我的 NFT 收藏
              </h2>
              <MyHoldings />
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-8"
          >
            <div className="bg-base-100/70 backdrop-blur-md rounded-3xl p-8 shadow-xl text-center max-w-lg mx-auto border border-base-300/50">
              <motion.p 
                className="text-xl text-base-content/70 mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                请连接钱包以查看您的个人信息
              </motion.p>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <RainbowKitCustomConnectButton />
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* 装饰元素 */}
        <div className="absolute top-1/4 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl animate-float-delayed" />
      </div>
    </div>
  );
};

export default ProfilePage; 