"use client";

import { useAccount } from "wagmi";
import { motion, AnimatePresence } from "framer-motion";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { MyHoldings } from "./_components";
import { Address } from "~~/components/scaffold-eth";

const ProfilePage = () => {
  const { address, isConnected } = useAccount();

  // 添加装饰性配置
  const floatingIcons = [
    { icon: "👤", delay: 0 },
    { icon: "🎨", delay: 1 },
    { icon: "💎", delay: 2 },
    { icon: "✨", delay: 3 },
    { icon: "🌟", delay: 4 },
  ];

  const particles = Array.from({ length: 30 }).map((_, i) => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: 2 + Math.random() * 3,
    delay: Math.random() * 2,
  }));

  return (
    <div className="min-h-screen  relative overflow-hidden">
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
          className="absolute w-[600px] h-[600px] -top-48 -left-48 bg-primary/10 rounded-full blur-[120px]"
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
          className="absolute w-[600px] h-[600px] -bottom-48 -right-48 bg-secondary/10 rounded-full blur-[120px]"
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

      {/* 主要内容 */}
      <div className="relative z-10 w-full px-4 py-10">
        {/* 标题部分 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-4">
            <motion.span 
              className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{ backgroundSize: "200% 200%" }}
            >
              个人中心
            </motion.span>
          </h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-base-content/70"
          >
            管理您的 数藏 资产
          </motion.p>
        </motion.div>

        <AnimatePresence mode="wait">
          {isConnected ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-[98%] max-w-[2000px] mx-auto space-y-8"
            >
              {/* 用户信息卡片增强 */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-base-100/50 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-base-content/5
                  hover:shadow-2xl hover:bg-base-100/60 transition-all duration-300"
                whileHover={{ scale: 1.01 }}
              >
                <div className="flex items-center gap-6">
                  <motion.div 
                    className="avatar placeholder"
                    whileHover={{ scale: 1.1, rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="bg-gradient-to-br from-primary to-secondary text-base-100 rounded-full w-20 h-20 
                      flex items-center justify-center transform hover:scale-105 transition-transform duration-200"
                    >
                      <span className="text-2xl font-bold">
                        {address?.substring(0, 4).toUpperCase()}
                      </span>
                    </div>
                  </motion.div>
                  <div className="space-y-2">
                    <motion.h2
                      className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
                      animate={{
                        backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                      }}
                      transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      style={{ backgroundSize: "200% 200%" }}
                    >
                      欢迎回来
                    </motion.h2>
                    <div className="flex items-center gap-2">
                      <motion.div
                        className="w-2 h-2 bg-green-500 rounded-full"
                        animate={{
                          scale: [1, 1.5, 1],
                          opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                      <Address address={address} format="long" />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* NFT 展示区域增强 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-base-100/50 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-base-content/5
                  hover:shadow-2xl hover:bg-base-100/60 transition-all duration-300"
                whileHover={{ scale: 1.01 }}
              >
                <motion.h2
                  className="text-2xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
                  animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  style={{ backgroundSize: "200% 200%" }}
                >
                  我的 数藏 收藏
                </motion.h2>
                <MyHoldings />
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center gap-8"
            >
              <motion.div
                className="bg-base-100/50 backdrop-blur-md rounded-3xl p-8 shadow-xl text-center max-w-lg mx-auto 
                  border border-base-content/5 hover:shadow-2xl hover:bg-base-100/60 transition-all duration-300"
                whileHover={{ scale: 1.02 }}
              >
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
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 底部装饰 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-12 text-center text-base-content/50"
        >
          <div className="flex justify-center gap-4 mb-4">
            {["👤", "🎨", "💎", "✨", "🌟"].map((emoji, index) => (
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
          <p className="text-sm">探索您的 数藏 资产世界</p>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage; 