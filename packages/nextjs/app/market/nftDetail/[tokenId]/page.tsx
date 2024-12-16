"use client";

import { useScaffoldReadContract, useScaffoldWriteContract, useScaffoldEventHistory } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";
import { Address } from "~~/components/scaffold-eth";
import { format } from "date-fns";
import { formatEther } from "viem";
import { NFTMetaData } from "~~/utils/simpleNFT/nftsMetadata";
import { getMetadataFromIPFS } from "~~/utils/simpleNFT/ipfs-fetch";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";

const NFTDetailPage = ({ params }: { params: { tokenId: string } }) => {
    const { tokenId } = params;
    const router = useRouter();
    const { writeContractAsync } = useScaffoldWriteContract("YourCollectible");
    const [nftMetadata, setNftMetadata] = useState<NFTMetaData | null>(null);
    const { address: connectedAddress } = useAccount();

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

    // 下架NFT函数
    const handleDelistItem = async () => {
        try {
            const notificationId = notification.loading("正在下架...");
            await writeContractAsync({
                functionName: "delistItem",
                args: [BigInt(tokenId)],
            });
            notification.remove(notificationId);
            notification.success("下架成功！");
        } catch (error) {
            notification.error("下架失败！");
            console.error(error);
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
        <div className="container mx-auto mt-10 mb-20 px-10 md:px-0">
            <button className="btn btn-sm btn-primary" onClick={() => router.back()}>
                Back
            </button>

            {/* 详情 */}
            <div className="overflow-x-auto mt-10">
                <h2 className="text-3xl font-bold mb-4 text-center text-primary-content">NFT Details</h2>

                <div className="flex flex-col md:flex-row items-center md:items-stretch gap-10">
                    {/* 图片部分 */}
                    <div className="flex-shrink-0 w-full md:w-1/3 h-full">
                        <div className="relative w-full h-full bg-gray-200 rounded-lg overflow-hidden">
                            {nftMetadata ? (
                                <img 
                                    src={nftMetadata.image} 
                                    alt={nftMetadata.name} 
                                    className="object-cover w-full h-full rounded-lg"
                                />
                            ) : (
                                <div className="flex justify-center items-center h-full text-gray-500">Loading...</div>
                            )}
                        </div>
                    </div>

                    {/* 详细信息部分 */}
                    <div className="flex flex-col w-full md:w-2/3 h-full">
                        <div className="bg-base-100 p-6 rounded-lg shadow-lg w-full h-full">
                            <div className="text-xl font-semibold mb-4">
                                <p><strong>名称:</strong> {nftMetadata?.name ?? "No name available."}</p>
                                <p><strong>描述:</strong> {nftMetadata?.description ?? "No description available."}</p>
                            </div>

                            {/* 属性列表 */}
                            <div className="mb-6">
                                <strong>属性:</strong>
                                <div className="grid grid-cols-1 gap-4 mt-4">
                                    {nftMetadata?.attributes?.map((attribute, index) => (
                                        <div key={index} className="p-4 bg-base-200 rounded-lg shadow-sm">
                                            <div className="font-semibold">{attribute.trait_type}</div>
                                            <div>{attribute.value}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-between items-center">
                                <div>
                                    <strong>Token ID:</strong> {tokenId}
                                </div>
                                <div>
                                    <strong>价格:</strong> {formatEther(nftData?.price ?? 0n)} ETH
                                </div>
                                <div>
                                    <strong>拥有者:</strong> <Address address={nftData?.owner} />
                                </div>
                                <div>
                                    <strong>是否上架:</strong> {nftData?.isListed ? "是" : "否"}
                                </div>
                            </div>
                        </div>

                        <div className="mt-6">
                            {nftData?.isListed ? (
                                <button
                                    className="btn btn-primary w-full"
                                    onClick={() => handleBuyNFT(Number(tokenId), Number(nftData?.price))}
                                >
                                    购买 NFT
                                </button>
                            ) : (
                                <p className="text-red-500 mt-2 text-center">该NFT未上架出售</p>
                            )}
                        </div>

                        {/* 下架按钮 */}
                        {nftData?.isListed && nftData?.owner === connectedAddress && (
                            <div className="mt-4">
                                <button
                                    className="btn btn-danger w-full"
                                    onClick={handleDelistItem}
                                >
                                    下架
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 历史记录 */}
            <div className="overflow-x-auto mt-10">
                <h2 className="text-3xl font-bold mb-4 text-center text-primary-content">买卖记录</h2>
                <table className="table table-zebra w-full">
                    <thead>
                        <tr>
                            <th>Token ID</th>
                            <th>卖家</th>
                            <th>买家</th>
                            <th>成交价格 (ETH)</th>
                            <th>购买时间</th>
                            <th>版税收取人</th>
                            <th>版税额 (ETH)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {!buyEvents || buyEvents.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="text-center">
                                    No transaction history available.
                                </td>
                            </tr>
                        ) : (
                            buyEvents?.map((event, index) => {
                                const priceInWei = event.args.price ?? 0n;
                                const priceInEth = formatEther(priceInWei);
                                const blocktimestamp = event.block?.timestamp;
                                const timestamp = blocktimestamp ? format(new Date(Number(blocktimestamp) * 1000), "yyyy-MM-dd HH:mm:ss") : "N/A";
                                const royaltyAmountInWei = event.args.royaltyAmount ?? 0n;
                                const royaltyAmountInEth = formatEther(royaltyAmountInWei);

                                return (
                                    <tr key={index}>
                                        <td>{event.args.tokenId?.toString() ?? "N/A"}</td>
                                        <td><Address address={event.args.seller as `0x${string}` | undefined} /></td>
                                        <td><Address address={event.args.buyer as `0x${string}` | undefined} /></td>
                                        <td>{priceInEth}</td>
                                        <td>{timestamp}</td>
                                        <td><Address address={event.args.royaltyReceiver as `0x${string}` | undefined} /></td>
                                        <td>{royaltyAmountInEth}</td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

};

export default NFTDetailPage;