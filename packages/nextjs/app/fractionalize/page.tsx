"use client";

import { useEffect, useState } from "react";
import type { NextPage } from "next";
import Link from "next/link";
import { useAccount } from "wagmi";
import { Address, AddressInput, InputBase } from "~~/components/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";
import { useScaffoldReadContract, useScaffoldWriteContract, useScaffoldContract } from "~~/hooks/scaffold-eth";
import { parseEther, formatEther } from "viem";

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
    // 在客户端渲染时设置地址
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

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <h1 className="text-center mb-4">
          <span className="block text-4xl font-bold">正在出售的 NFT 碎片</span>
        </h1>

        <div className="mb-4">
          <p>
            <strong>Connected Address:</strong> 
            {clientAddress ? <Address address={clientAddress} format="long" /> : "Loading..."}
          </p>
          <p>
            <strong>当前正在出售的 NFT 碎片</strong> {fractionDetails.length}
          </p>
        </div>

        {/* 将表格容器设置为 flex 并居中对齐 */}
        <div className="w-full max-w-md flex justify-center">
          {fractionDetails.length > 0 ? (
            <table className="table-auto border-collapse border border-gray-200 w-full text-left">
              <thead>
                <tr>
                  <th className="border px-4 py-2">Token ID</th>
                  <th className="border px-4 py-2">Owner</th>
                  <th className="border px-4 py-2">数量</th>
                  <th className="border px-4 py-2">单价（ETH）</th>
                  <th className="border px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {fractionDetails.map(({ tokenId, owner, amount, isForSale, price }) => (
                  <tr key={tokenId}>
                    <td className="border px-4 py-2">
                      <Link href={`/market/nftDetail/${tokenId}`} className="text-blue-500 hover:underline">
                        {tokenId}
                      </Link>
                    </td>
                    <td className="border px-4 py-2">{<Address address={owner} format="long" />}</td>
                    <td className="border px-4 py-2">{amount}</td>
                    <td className="border px-4 py-2">{formatEther(price)}</td>
                    <td className="border px-4 py-2">
                      <button
                        className="mr-2 bg-purple-500 text-white px-3 py-1 rounded hover:bg-purple-600"
                        onClick={() => {
                          setSelectedTokenIdForBuy(tokenId);
                          setSelectedOwnerForBuy(owner);
                          setSelectedPriceForBuy(BigInt(price));
                          setShowBuyModal(true);
                        }}
                      >
                        购买
                      </button>
                      {connectedAddress === owner && (
                        <button
                          className="mr-2 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                          onClick={() => handleCancelSale(tokenId)}
                        >
                          下架
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No fractions owned yet.</p>
          )}
        </div>
      </div>      

      {/* Modal for buying NFT fractions */}
      {showBuyModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75">
          <div className=" p-8 rounded-lg shadow-xl max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6">购买 NFT 碎片</h2>
            <p>
              <strong>Token ID:</strong> {selectedTokenIdForBuy}
            </p>
            <input
              type="number"
              className="w-full p-2 border border-gray-300 rounded mt-4"
              value={buyAmount}
              onChange={(e) => setBuyAmount(e.target.value)}
              placeholder="Enter amount to buy"
            />
            <div className="mt-6 flex justify-end space-x-4">
              <button
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                onClick={() => setShowBuyModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={handleBuyFraction}
                disabled={loading}
              >
                {loading ? "Purchasing..." : "Confirm Purchase"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Fractionalize;
