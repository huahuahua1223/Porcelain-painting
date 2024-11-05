"use client";

import { useScaffoldReadContract, useScaffoldWriteContract, useScaffoldEventHistory } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";
import { Address } from "~~/components/scaffold-eth";
import { format } from "date-fns";
import { formatEther } from "viem";
import { NFTMetaData } from "~~/utils/simpleNFT/nftsMetadata";
import { getMetadataFromIPFS } from "~~/utils/simpleNFT/ipfs-fetch";
import { useEffect, useState } from "react";

const NFTDetailPage = ({ params }: { params: { tokenId: string } }) => {
    const { tokenId } = params;
    const { writeContractAsync } = useScaffoldWriteContract("YourCollectible");
    const [nftMetadata, setNftMetadata] = useState<NFTMetaData | null>(null);

    // 根据tokenId获取NFT合约存储的数据：tokenId, price, owner, isListed, tokenUri
    const { data: nftData, isLoading, error } = useScaffoldReadContract({
        contractName: "YourCollectible",
        functionName: "getNFTItemByTokenId",
        args: [BigInt(tokenId)],
    });

    useEffect(() => {
        if (nftData?.tokenUri) {
            getMetadataFromIPFS(nftData.tokenUri).then((data) => {
                setNftMetadata(data);
            }).catch((err) => {
                console.error("Error fetching NFT metadata:", err);
                setNftMetadata(null);
            });
        }
    }, [nftData]);

    // 购买NFT函数
    const handleBuyNFT = async (tokenId: number, price: number) => {
        const notificationId = notification.loading("Purchasing NFT...");
        const formattedPrice = BigInt(price);

        try {
            await writeContractAsync({
                functionName: "buyItem",
                args: [BigInt(tokenId)],
                value: formattedPrice,
            });

            notification.success("NFT purchased successfully!");
        } catch (error) {
            notification.error("Failed to purchase NFT.");
            console.error(error);
        } finally {
            notification.remove(notificationId);
        }
    };

    // 历史记录事件
    const { data: buyEvents } = useScaffoldEventHistory({
        contractName: "YourCollectible",
        eventName: "NftBought",
        // Specify the starting block number from which to read events, this is a bigint.
        fromBlock: 0n,
        filters: { tokenId: BigInt(tokenId) },
        blockData: true, // 获取区块数据以获取时间戳
    });

    if (isLoading)
        return (
            <div className="flex justify-center items-center mt-10">
                <span className="loading loading-spinner loading-xl">正在加载中.......</span>
            </div>
        );

    if (error)
        return (
            <div className="text-red-500 text-center mt-10">
                出错了......
            </div>
        )

    return (
        <>
            {/* NFT 详情 */}
            <div className="flex justify-center mt-10">
                <div className="w-full max-w-screen-lg flex flex-col lg:flex-row items-center lg:items-start px-4">
                    {/* 图片部分 */}
                    <div className="flex-1 lg:w-1/3 mb-8 lg:mb-0">
                        {nftMetadata ? (
                            <img src={nftMetadata.image} alt={nftMetadata.name} className="w-full h-auto rounded-lg" />
                        ) : (
                            <div>无法加载 NFT 图片</div>
                        )}
                    </div>

                    {/* 信息部分 */}
                    <div className="flex-1 lg:w-2/3 lg:ml-10">
                        {nftMetadata ? (
                            <div className="text-center lg:text-left">
                                <h2 className="text-3xl font-bold">名称：{nftMetadata.name}</h2>
                                <p className="mt-2 text-gray-600">描述：{nftMetadata.description}</p>
                                <div className="mt-4">
                                    <h3 className="text-xl">属性:</h3>
                                    <ul>
                                        {nftMetadata.attributes?.map((attribute, index) => (
                                            <li key={index}>
                                                {attribute.trait_type}: {attribute.value}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ) : (
                            <div>无法加载 NFT 元数据</div>
                        )}

                        {/* 基本信息 */}
                        <div className="mt-10 text-lg">
                            <h2 className="text-2xl">NFT 基本信息</h2>
                            <p>Token ID: {tokenId}</p>
                            <p>价格: {formatEther(nftData?.price ?? 0n)} ETH</p>
                            <p>拥有者: <Address address={nftData?.owner} /></p>
                            <p>是否上架: {nftData?.isListed ? "是" : "否"}</p>

                            {/* 购买按钮 */}
                            <div className="mt-4">
                                {nftData?.isListed ? (
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => handleBuyNFT(Number(tokenId), Number(nftData?.price))}
                                    >
                                        购买 NFT
                                    </button>
                                ) : (
                                    <p className="text-red-500 mt-2">该NFT未上架出售</p>
                                )}
                            </div>

                        </div>
                    </div>
                </div>
            </div>


            {/* 历史记录 */}
            <div className="flex items-center flex-col flex-grow pt-10">
                <div className="px-5">
                    <h1 className="text-center mb-8">
                        <span className="block text-4xl font-bold">买卖记录</span>
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

export default NFTDetailPage;