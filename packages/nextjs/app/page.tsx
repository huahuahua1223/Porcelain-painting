"use client";

import Image from "next/image";
import type { NextPage } from "next";
import Link from "next/link";
import { motion } from "framer-motion";

const Home: NextPage = () => {
  // 动画变体
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  // 特色卡片数据
  const features = [
    {
      icon: "🎨",
      title: "创作与铸造",
      description: "创建独特的NFT艺术品，设定版税，开启您的创作之旅"
    },
    {
      icon: "💎",
      title: "交易市场",
      description: "安全可靠的交易平台，买卖您喜爱的NFT作品"
    },
    {
      icon: "🎁",
      title: "盲盒惊喜",
      description: "体验开启神秘盲盒的刺激，获得稀有NFT的机会"
    },
    {
      icon: "✨",
      title: "碎片化共享",
      description: "参与NFT碎片化，以更低门槛参与优质资产"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-base-300 to-base-100 relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute w-[500px] h-[500px] -top-48 -left-48 bg-primary/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute w-[500px] h-[500px] -bottom-48 -right-48 bg-secondary/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <motion.div
        className="relative z-10 container mx-auto px-6 py-16"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* 主标题区域 */}
        <motion.div variants={itemVariants} className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6">
            <span className="block mb-4">
              欢迎来到 NFT 艺术市场
              {/* <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {" "}NFT 艺术市场
              </span> */}
            </span>
            <span className="text-2xl text-base-content/70">
              探索、创造、交易独特的数字艺术品
            </span>
          </h1>
        </motion.div>

        {/* 主图区域 */}
        <motion.div
          variants={itemVariants}
          className="relative w-full max-w-4xl mx-auto mb-16 group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-3xl blur-2xl transform group-hover:scale-105 transition-transform duration-500" />
          <motion.div
            className="relative rounded-3xl overflow-hidden border-4 border-base-300/50 shadow-2xl"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <Image
              src="/pinksea.png"
              width={1200}
              height={450}
              alt="NFT市场横幅"
              className="w-full object-cover"
            />
          </motion.div>
        </motion.div>

        {/* 特色功能区域 */}
        <motion.div variants={itemVariants} className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-base-100/50 backdrop-blur-md rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-shadow"
                whileHover={{ y: -5 }}
              >
                <span className="text-4xl mb-4 block">{feature.icon}</span>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-base-content/70">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* 行动按钮区域 */}
        <motion.div variants={itemVariants} className="text-center">
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/market">
              <motion.button
                className="btn btn-primary btn-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                开始探索
              </motion.button>
            </Link>
            <Link href="/create">
              <motion.button
                className="btn btn-secondary btn-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                创建 NFT
              </motion.button>
            </Link>
          </div>
          <motion.p
            variants={itemVariants}
            className="mt-6 text-base-content/70"
          >
            加入我们的社区，开启您的 NFT 之旅
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Home;
