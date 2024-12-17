import Image from "next/image";
import type { NextPage } from "next";
import Link from "next/link";

const Home: NextPage = () => {
  return (
    <div className="flex items-center flex-col flex-grow pt-10">
      <div className="px-5 w-[90%] md:w-[75%]">
        <h1 className="text-center mb-6">
          <span className="block text-2xl mb-2">您的NFT市场名称</span>
          <span className="block text-4xl font-bold">欢迎来到您的NFT市场</span>
        </h1>
        <div className="flex flex-col items-center justify-center">
          <Image
            src="/pinksea.png"
            width="800"
            height="300"
            alt="NFT市场横幅"
            className="rounded-xl border-4 border-primary"
          />
          <div className="max-w-3xl">
            <p className="text-center text-lg mt-8">
              🎫 欢迎来到您的NFT市场！在这里，您可以浏览、购买和出售独特的NFT。探索各种艺术品、收藏品和数字资产，与全球的创作者和收藏家互动。🚀
            </p>
            <p className="text-center text-lg">
              🌟 开始您的NFT之旅，点击下方按钮浏览市场上的热门NFT，或者创建您自己的NFT！🌟
            </p>
            <div className="flex justify-center mt-6 space-x-4">
              <Link href="/market">
                <button className="btn btn-primary">浏览市场</button>
              </Link>
              <Link href="/create">
                <button className="btn btn-secondary">创建NFT</button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
