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

  // 浮动图片配置
  const floatingImages = [
    {
      src: "/porcelain-1.jpg",
      alt: "传统瓷板画",
      delay: 0
    },
    {
      src: "/porcelain-2.jpg",
      alt: "现代瓷板画",
      delay: 0.5
    },
    {
      src: "/porcelain-3.jpg",
      alt: "瓷板画工艺",
      delay: 1
    },
    {
      src: "/porcelain-4.jpg",
      alt: "瓷板画展示",
      delay: 1.5
    }
  ];

  // 平台特色数据
  const platformFeatures = [
    {
      icon: "🔒",
      title: "数字确权",
      description: "基于区块链技术，为每件瓷板画作品提供唯一数字身份认证"
    },
    {
      icon: "💎",
      title: "价值保障",
      description: "通过智能合约确保艺术品交易的安全性和透明度"
    },
    {
      icon: "🎨",
      title: "艺术传承",
      description: "连接传统工艺大师与数字艺术收藏家，促进文化传承"
    },
    {
      icon: "🌐",
      title: "全球市场",
      description: "打造全球化的瓷板画数字艺术交易平台"
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 上层：介绍内容 */}
      <div className="relative z-10">
        <motion.div
          className="container mx-auto px-6 py-16"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* 主标题 */}
          <motion.div variants={itemVariants} className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4">
              <span className="block mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                非遗瓷艺数字确权与交易平台
              </span>
              <span className="text-xl text-base-content/70">
                传承千年工艺，链接数字未来
              </span>
            </h1>
          </motion.div>

          {/* 平台介绍 */}
          <motion.div variants={itemVariants} className="mb-12">
            <div className="bg-base-100/20 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/10">
              <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">平台简介</h2>
              <div className="grid grid-cols-1 gap-8">
                <div>
                  <h3 className="text-2xl font-semibold mb-4 text-gray-800">非遗瓷艺数字化</h3>
                  <p className="text-gray-700 leading-relaxed text-lg">
                    我们致力于将传统瓷板画艺术与现代区块链技术相结合，为每件作品提供唯一的数字身份认证。
                    通过数字化确权，确保艺术品的真实性和所有权，让传统艺术在数字时代焕发新生。
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 平台特色 */}
          <motion.div variants={itemVariants} className="mb-12">
            <h2 className="text-2xl font-bold text-center mb-8">平台特色</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {platformFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  className="bg-base-100/30 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-base-content/5
                    hover:shadow-2xl hover:bg-base-100/40 transition-all duration-300"
                  whileHover={{ y: -5 }}
                >
                  <span className="text-4xl mb-4 block">{feature.icon}</span>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-base-content/70">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* 行动按钮 */}
          <motion.div variants={itemVariants} className="text-center">
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/market">
                <motion.button
                  className="btn bg-[#DBA363] hover:bg-[#C89255] text-white border-0 btn-lg shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  浏览艺术品
                </motion.button>
              </Link>
              <Link href="/create">
                <motion.button
                  className="btn bg-[#6B7A8C] hover:bg-[#596A7E] text-white border-0 btn-lg shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  创作与铸造
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* 下层：浮动图片 */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {floatingImages.map((image, index) => (
          <motion.div
            key={index}
            className="absolute w-64 h-[650px]"
            style={{
              left: `${42 + (index - 1.5) * 21}%`,
              top: '20%',
              transform: 'translateY(-50%)'
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.5, 0.3],
              scale: [1, 1.05, 1]
            }}
            transition={{
              duration: 4,
              delay: image.delay,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              className="object-cover rounded-2xl shadow-2xl"
            />
            <motion.div
              className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-2xl"
              animate={{
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Home;
