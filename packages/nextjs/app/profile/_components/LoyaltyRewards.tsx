import { useEffect, useState } from "react";
import { useScaffoldContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

interface LoyaltyInfo {
  holdingStartTime: number;
  rewardClaimed: boolean;
  lastRewardTime: number;
  nextRewardTime: number;
}

interface LoyaltyRewardsProps {
  tokenId: number;
  onRewardClaimed?: () => void;
}

export const LoyaltyRewards = ({ tokenId, onRewardClaimed }: LoyaltyRewardsProps) => {
  const [loyaltyInfo, setLoyaltyInfo] = useState<LoyaltyInfo | null>(null);
  const [canClaim, setCanClaim] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [waitTime, setWaitTime] = useState<number>(0);

  const { data: yourCollectibleContract } = useScaffoldContract({
    contractName: "YourCollectible",
  });

  const { writeContractAsync } = useScaffoldWriteContract("YourCollectible");

  // 更新等待时间的函数
  const updateWaitTime = () => {
    if (loyaltyInfo && loyaltyInfo.nextRewardTime > Date.now() / 1000) {
      const timeLeft = Math.ceil(loyaltyInfo.nextRewardTime - Date.now() / 1000);
      setWaitTime(timeLeft);
    } else {
      setWaitTime(0);
    }
  };

  useEffect(() => {
    const fetchLoyaltyInfo = async () => {
      if (!yourCollectibleContract) return;

      try {
        // 获取忠诚度信息
        const info = await yourCollectibleContract.read.getLoyaltyInfo([BigInt(tokenId)]);
        setLoyaltyInfo({
          holdingStartTime: Number(info[0]),
          rewardClaimed: info[1],
          lastRewardTime: Number(info[2]),
          nextRewardTime: Number(info[3]),
        });

        // 检查是否可以领取奖励
        const claimable = await yourCollectibleContract.read.checkClaimLoyaltyReward([BigInt(tokenId)]);
        setCanClaim(claimable);
      } catch (error) {
        console.error("Error fetching loyalty info:", error);
      }
    };

    fetchLoyaltyInfo();
    // 每60秒更新一次状态
    const infoInterval = setInterval(fetchLoyaltyInfo, 60000);
    return () => clearInterval(infoInterval);
  }, [yourCollectibleContract, tokenId]);

  // 添加实时更新等待时间的效果
  useEffect(() => {
    updateWaitTime();
    const timer = setInterval(updateWaitTime, 1000); // 每秒更新一次
    return () => clearInterval(timer);
  }, [loyaltyInfo]);

  const handleClaimReward = async () => {
    try {
      setIsLoading(true);
      await writeContractAsync({
        functionName: "claimLoyaltyReward",
        args: [BigInt(tokenId)],
      });
      notification.success("奖励领取成功！");
      onRewardClaimed?.();
    } catch (error) {
      console.error("Error claiming reward:", error);
      notification.error("领取奖励失败");
    } finally {
      setIsLoading(false);
    }
  };

  // 格式化等待时间
  const formatWaitTime = (seconds: number) => {
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    const remainingSeconds = seconds % 60;

    const parts = [];

    if (days > 0) {
      parts.push(`${days} 天`);
    }
    if (hours > 0) {
      parts.push(`${hours} 小时`);
    }
    if (minutes > 0) {
      parts.push(`${minutes} 分`);
    }
    if (remainingSeconds > 0 || parts.length === 0) {
      parts.push(`${remainingSeconds} 秒`);
    }

    // 只显示最大的两个时间单位
    return parts.slice(0, 2).join(' ');
  };

  if (!loyaltyInfo) return null;

  return (
    <div className="bg-base-200 rounded-lg p-4 mt-4">
      <h3 className="text-lg font-bold mb-3">忠诚度奖励信息</h3>
      <div className="space-y-2">
        <p>持有开始时间: {new Date(loyaltyInfo.holdingStartTime * 1000).toLocaleString()}</p>
        <p>上次领取时间: {
          loyaltyInfo.lastRewardTime === 0 
            ? "尚未领取" 
            : new Date(loyaltyInfo.lastRewardTime * 1000).toLocaleString()
        }</p>
        <p>下次可领取时间: {new Date(loyaltyInfo.nextRewardTime * 1000).toLocaleString()}</p>
        
        {canClaim && (
          <button
            className={`btn btn-primary w-full ${isLoading ? "loading" : ""}`}
            onClick={handleClaimReward}
            disabled={isLoading}
          >
            {isLoading ? "领取中..." : "领取忠诚度奖励"}
          </button>
        )}
        
        {!canClaim && waitTime > 0 && (
          <div className="text-sm text-gray-500 mt-2">
            距离下次可领取还需等待: {formatWaitTime(waitTime)}
          </div>
        )}
      </div>
    </div>
  );
}; 