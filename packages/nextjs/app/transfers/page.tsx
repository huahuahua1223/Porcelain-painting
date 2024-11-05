"use client";

import type { NextPage } from "next";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldEventHistory } from "~~/hooks/scaffold-eth";
import { format } from "date-fns";
import { formatEther } from "viem";

const Transfers: NextPage = () => {
  const { data: buyEvents, isLoading, error } = useScaffoldEventHistory({
    contractName: "YourCollectible",
    eventName: "NftBought",
    // Specify the starting block number from which to read events, this is a bigint.
    fromBlock: 0n,
    // filters: { tokenId: BigInt(5) }
    blockData: true, // 获取区块数据以获取时间戳
  });

  if (isLoading)
    return (
      <div className="flex justify-center items-center mt-10">
        <span className="loading loading-spinner loading-xl">正在加载中.......</span>
      </div>
    );

    if(error)
      return (
        <div className="text-red-500 text-center mt-10">
          出错了......
        </div>
    )

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <h1 className="text-center mb-8">
            <span className="block text-4xl font-bold">所有NFT买卖记录</span>
          </h1>
        </div>
        <div className="overflow-x-auto shadow-lg">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th className="bg-primary">Token ID</th>
                <th className="bg-primary">卖家</th>
                <th className="bg-primary">买家</th>
                <th className="bg-primary">成交价格 (ETH)</th>
                <th className="bg-primary">购买时间</th>
                <th className="bg-primary">版税收取人</th>
                <th className="bg-primary">版税额 (ETH)</th>
              </tr>
            </thead>
            <tbody>
              {!buyEvents || buyEvents.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center">
                    还没有NFT买卖
                  </td>
                </tr>
              ) : (
                buyEvents?.map((event, index) => {
                  const tokenId = event.args.tokenId?.toString() ?? "N/A";
                  const seller = event.args.seller ?? "N/A";
                  const buyer = event.args.buyer ?? "N/A";
                  const priceInWei = event.args.price ?? 0n;
                  const priceInEth = formatEther(priceInWei); // 使用viem的 formatEther 方法从wei转换为ETH
                  const blocktimestamp = event.block?.timestamp;
                  const timestamp = blocktimestamp ? format(new Date(Number(blocktimestamp) * 1000), "yyyy-MM-dd HH:mm:ss") : "N/A";
                  const royaltyReceiver = event.args.royaltyReceiver ?? "N/A";
                  const royaltyAmountInWei = event.args.royaltyAmount ?? 0n;
                  const royaltyAmountInEth = formatEther(royaltyAmountInWei);// 使用viem的 formatEther 方法从wei转换为ETH

                  return (
                    <tr key={index}>
                      <td className="text-center">{tokenId}</td>
                      <td>
                        <Address address={seller as `0x${string}` | undefined} />
                      </td>
                      <td>
                        <Address address={buyer as `0x${string}` | undefined} />
                      </td>
                      <td className="text-center">{priceInEth}</td>
                      <td className="text-center">{timestamp}</td>
                      <td>
                        <Address address={royaltyReceiver as `0x${string}` | undefined} />
                      </td>
                      <td className="text-center">{royaltyAmountInEth}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default Transfers;
