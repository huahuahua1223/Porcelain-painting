"use client";

import { useAccount } from "wagmi";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { MyHoldings } from "./_components";
import { Address } from "~~/components/scaffold-eth";

const ProfilePage = () => {
  const { address, isConnected } = useAccount();

  return (
    <div className="flex flex-col items-center pt-10 px-6 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">个人中心</h1>
      {isConnected ? (
        <div>
          <p className="text-lg">欢迎回来，<Address address={address} format="long" /></p>
          {/* 在这里添加更多个人中心的内容，例如用户的 NFT 收藏、设置等 */}
          <MyHoldings />
        </div>
      ) : (
        <RainbowKitCustomConnectButton />
      )}
    </div>
  );
};

export default ProfilePage; 