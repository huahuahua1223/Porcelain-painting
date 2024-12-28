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

  // 添加装饰性配置
  const floatingIcons = [
    { icon: "🎨", delay: 0 },
    { icon: "💎", delay: 1 },
    { icon: "✨", delay: 2 },
    { icon: "🌟", delay: 3 },
    { icon: "🎁", delay: 4 },
  ];

  const particles = Array.from({ length: 30 }).map((_, i) => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: 2 + Math.random() * 3,
    delay: Math.random() * 2,
  }));

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

      {/* 背景装饰增强 */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute w-[600px] h-[600px] -top-48 -left-48 bg-primary/20 rounded-full blur-[120px]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute w-[600px] h-[600px] -bottom-48 -right-48 bg-secondary/20 rounded-full blur-[120px]"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 15,
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
        {/* 主标题区域增强 */}
        <motion.div variants={itemVariants} className="text-center mb-16">
          <motion.div
            animate={{
              scale: [1, 1.02, 1],
              opacity: [0.8, 1, 0.8],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 blur-3xl"
          />
          <h1 className="text-5xl font-bold mb-6">
            <motion.span 
              className="block mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
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
              欢迎来到 NFT 艺术市场
            </motion.span>
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

        {/* 3D 展示区域 */}
        <motion.div
          variants={itemVariants}
          className="relative w-full max-w-4xl mx-auto mb-16"
        >
          <div className="relative rounded-3xl overflow-hidden border-4 border-base-300/50 shadow-2xl">
            <iframe 
              width="100%" 
              height="480" 
              src="https://www.51jianmo.com/newModel/?code=M000000000010018B6FDK&desc=0&icon=1&type=1&quick=1&opacity=1&full=1&isxcx=0" 
              allowFullScreen
              className="w-full"
            />
          </div>
        </motion.div>

        {/* 特色功能区域增强 */}
        <motion.div variants={itemVariants} className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-base-100/50 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-base-content/5
                  hover:shadow-2xl hover:bg-base-100/60 transition-all duration-300"
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <motion.span 
                  className="text-4xl mb-4 block"
                  animate={{
                    y: [0, -5, 0],
                    rotate: [0, 5, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 0.2,
                  }}
                >
                  {feature.icon}
                </motion.span>
                <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {feature.title}
                </h3>
                <p className="text-base-content/70">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* 行动按钮区域增强 */}
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

        {/* 底部装饰 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-12 text-center text-base-content/50"
        >
          <div className="flex justify-center gap-4 mb-4">
            {["🎨", "💎", "✨", "🌟", "🎁"].map((emoji, index) => (
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
          <p className="text-sm">探索无限可能的 NFT 世界</p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Home;
