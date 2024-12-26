"use client";

import { useEffect, useState } from "react";
import type { NextPage } from "next";
import Link from "next/link";
import { useAccount } from "wagmi";
import { motion, AnimatePresence } from "framer-motion";
import { Address } from "~~/components/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";
import { useScaffoldReadContract, useScaffoldWriteContract, useScaffoldContract } from "~~/hooks/scaffold-eth";
import { formatEther } from "viem";
import { useRouter } from "next/navigation";

const Fractionalize: NextPage = () => {
  const [loading, setLoading] = useState(false);
  const { address: connectedAddress, isConnected, isConnecting } = useAccount();
  const [fractionDetails, setFractionDetails] = useState<{ tokenId: number; amount: number }[]>([]);
  const [clientAddress, setClientAddress] = useState<string | null>(null);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [buyAmount, setBuyAmount] = useState("");
  const [selectedTokenIdForBuy, setSelectedTokenIdForBuy] = useState<number | null>(null);
  const [selectedOwnerForBuy, setSelectedOwnerForBuy] = useState<string | null>(null);
  const [selectedPriceForBuy, setSelectedPriceForBuy] = useState<bigint | null>(null);

  const { writeContractAsync: writeContractAsync } = useScaffoldWriteContract("YourCollectible");
  const { data: yourCollectibleContract } = useScaffoldContract({
    contractName: "YourCollectible",
  });

  // Define the read contract hook to call getFractionsByAddress
  const { data: fractionsData, refetch: fetchFractions } = useScaffoldReadContract({
    contractName: "YourCollectible",
    functionName: "getAllFractionsForSale",
  });

  const router = useRouter();

  useEffect(() => {
    if (connectedAddress && fractionsData) {
      const tokenIds = fractionsData[0]; // 第一个返回的数组
      const owners = fractionsData[1]; // 第二个返回的数组
      const fractions = fractionsData[2]; // 第三个返回的数组

      // 将数据转换为对象数组以便于渲染
      const parsedData = tokenIds.map((tokenId: any, index: number) => ({
        tokenId: Number(tokenId),
        owner: owners[index],
        amount: Number(fractions[index].amount),
        isForSale: fractions[index].isForSale,
        price: fractions[index].price,
      }));

      setFractionDetails(parsedData);
    }
  }, [connectedAddress, fractionsData]);

  useEffect(() => {
    // 在客户端渲染���设置地址
    if (isConnected) {
      setClientAddress(connectedAddress);
    }
  }, [connectedAddress, isConnected]);

  // 购买碎片
  const handleBuyFraction = async () => {
    if (!selectedTokenIdForBuy || !selectedOwnerForBuy || !buyAmount || !selectedPriceForBuy) {
      notification.error("Please fill out all fields.");
      return;
    }

    try {
      setLoading(true);

      // 计算总价格
      const totalPriceWei = selectedPriceForBuy * BigInt(parseInt(buyAmount, 10));
      console.log("Total Price (Wei):", totalPriceWei);

      await writeContractAsync({
        functionName: "buyFraction",
        args: [selectedTokenIdForBuy, selectedOwnerForBuy, parseInt(buyAmount, 10)],
        value: totalPriceWei,
      });
      notification.success("Fraction purchase successful!");
      fetchFractions(); // 更新页面数据
      setShowBuyModal(false); // 关闭模态框
    } catch (error) {
      console.error(error);
      notification.error("Fraction purchase failed!");
    } finally {
      setLoading(false);
    }
  };

  // 下架碎片
  const handleCancelSale = async (tokenId: number) => {
    try {
      setLoading(true);
      await writeContractAsync({
        functionName: "cancelFractionSale",
        args: [tokenId],
      });
      notification.success("Fraction sale cancelled!");
      fetchFractions(); // 更新页面数据
    } catch (error) {
      console.error(error);
      notification.error("Failed to cancel sale.");
    } finally {
      setLoading(false);
    }
  };

  // 添加查看详情函数
  const handleViewDetails = (tokenId: number) => {
    router.push(`/market/nftDetail/${tokenId}`);
  };

  // 添加动画变体
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-base-300 to-base-100 relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 -top-48 -left-48 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute w-96 h-96 -bottom-48 -right-48 bg-secondary/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-6 py-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* 标题部分 */}
          <motion.div variants={itemVariants} className="text-center">
            <h1 className="text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent 
              drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">
                NFT碎片化市场
              </span>
            </h1>
            <p className="text-xl text-base-content/70">
              探索、交易独特的 NFT 碎片
            </p>
          </motion.div>

          {/* 用户信息卡片 */}
          <motion.div
            variants={itemVariants}
            className="bg-base-100/70 backdrop-blur-md rounded-3xl p-6 shadow-xl"
          >
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-base-content/70">当前连接地址</p>
                  {clientAddress ? (
                    <Address address={clientAddress} format="long" />
                  ) : (
                    <span className="loading loading-dots">Loading</span>
                  )}
                </div>
              </div>
              <div className="stat bg-base-200/50 rounded-xl px-6">
                <div className="stat-title">在售碎片</div>
                <div className="stat-value text-primary">{fractionDetails.length}</div>
              </div>
            </div>
          </motion.div>

          {/* 碎片列表 */}
          <motion.div
            variants={itemVariants}
            className="bg-base-100/70 backdrop-blur-md rounded-3xl p-8 shadow-xl"
          >
            <div className="overflow-x-auto">
              {fractionDetails.length > 0 ? (
                <table className="table w-full">
                  <thead>
                    <tr>
                      <th className="bg-base-200/50">Token ID</th>
                      <th className="bg-base-200/50">拥有者</th>
                      <th className="bg-base-200/50">数量</th>
                      <th className="bg-base-200/50">单价 (ETH)</th>
                      <th className="bg-base-200/50">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {fractionDetails.map(({ tokenId, owner, amount, price }, index) => (
                        <motion.tr
                          key={tokenId}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="hover:bg-base-200/50"
                        >
                          <td>
                            <Link
                              href={`/market/nftDetail/${tokenId}`}
                              className="text-primary hover:text-primary-focus transition-colors"
                            >
                              #{tokenId}
                            </Link>
                          </td>
                          <td><Address address={owner} format="long" /></td>
                          <td>{amount}</td>
                          <td>{formatEther(price)} ETH</td>
                          <td>
                            <div className="flex gap-2">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="btn btn-neutral btn-sm"
                                onClick={() => handleViewDetails(tokenId)}
                              >
                                查看详情
                              </motion.button>
                              {connectedAddress !== owner && (
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className="btn btn-primary btn-sm"
                                  onClick={() => {
                                    setSelectedTokenIdForBuy(tokenId);
                                    setSelectedOwnerForBuy(owner);
                                    setSelectedPriceForBuy(BigInt(price));
                                    setShowBuyModal(true);
                                  }}
                                >
                                  购买
                                </motion.button>
                              )}
                              {connectedAddress === owner && (
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className="btn btn-error btn-sm"
                                  onClick={() => handleCancelSale(tokenId)}
                                >
                                  下架
                                </motion.button>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-10 text-base-content/70">
                  暂无碎片在售
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* 购买模态框 */}
      <dialog className={`modal ${showBuyModal ? "modal-open" : ""}`}>
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">购买 NFT 碎片</h3>

          <div className="space-y-4">
            <div className="bg-base-200/50 p-4 rounded-xl">
              <p className="text-sm text-base-content/70">Token ID</p>
              <p className="text-lg font-semibold">#{selectedTokenIdForBuy}</p>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">购买数量</span>
              </label>
              <input
                type="number"
                className="input input-bordered w-full"
                value={buyAmount}
                onChange={(e) => setBuyAmount(e.target.value)}
                placeholder="输入购买数量"
              />
            </div>

            <div className="modal-action">
              <button
                className="btn"
                onClick={() => setShowBuyModal(false)}
              >
                取消
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  handleBuyFraction();
                  setShowBuyModal(false);
                }}
                disabled={loading}
              >
                {loading ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  "确认购买"
                )}
              </button>
            </div>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button onClick={() => setShowBuyModal(false)}>关闭</button>
        </form>
      </dialog>
    </div>
  );
};

export default Fractionalize;
