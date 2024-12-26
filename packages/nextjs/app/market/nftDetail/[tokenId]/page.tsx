"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useScaffoldReadContract, useScaffoldWriteContract, useScaffoldEventHistory } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";
import { Address } from "~~/components/scaffold-eth";
import { format } from "date-fns";
import { formatEther, parseEther } from "viem";
import { NFTMetaData } from "~~/utils/simpleNFT/nftsMetadata";
import { getMetadataFromIPFS } from "~~/utils/simpleNFT/ipfs-fetch";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";

const NFTDetailPage = ({ params }: { params: { tokenId: string } }) => {
    const { tokenId } = params;
    const router = useRouter();
    const { writeContractAsync } = useScaffoldWriteContract("YourCollectible");
    const [nftMetadata, setNftMetadata] = useState<NFTMetaData | null>(null);
    const { address: connectedAddress } = useAccount();
    const [isListModalOpen, setIsListModalOpen] = useState(false);
    const [isFractionalizeModalOpen, setIsFractionalizeModalOpen] = useState(false);
    const [listingPrice, setListingPrice] = useState("");
    const [fractionCount, setFractionCount] = useState("");

    // 根据tokenId获取NFT合约存储的数据：tokenId, price, owner, isListed, tokenUri
    const { data: nftData, isLoading, error } = useScaffoldReadContract({
        contractName: "YourCollectible",
        functionName: "getNFTItemByTokenId",
        args: [BigInt(tokenId)],
    });

    // 检查NFT是否被碎片化
    const { data: isFractionalized } = useScaffoldReadContract({
        contractName: "YourCollectible",
        functionName: "isNFTFractionalized",
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
        watch: true, // 轮询
    });

    // 添加动画��体
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
        },
    };

    // 添加上架处理函数
    const handleListNFT = async () => {
        if (!listingPrice) {
            notification.error("请输入上架价格");
            return;
        }

        try {
            const notificationId = notification.loading("正在上架NFT...");
            await writeContractAsync({
                functionName: "listItem",
                args: [BigInt(tokenId), parseEther(listingPrice)],
                value: parseEther("0.025"),
            });
            notification.remove(notificationId);
            notification.success("NFT上架成功！");
            setIsListModalOpen(false);
            setListingPrice("");
        } catch (error) {
            console.error("上架失败:", error);
            notification.error("上架失败");
        }
    };

    // 添加碎片化处理函数
    const handleFractionalize = async () => {
        if (!fractionCount) {
            notification.error("请输入碎片数量");
            return;
        }

        try {
            const notificationId = notification.loading("正在碎片化NFT...");
            await writeContractAsync({
                functionName: "fractionalizeNFT",
                args: [BigInt(tokenId), BigInt(fractionCount)],
            });
            notification.remove(notificationId);
            notification.success("NFT碎片化成功！");
            setIsFractionalizeModalOpen(false);
            setFractionCount("");
        } catch (error) {
            console.error("碎片化失败:", error);
            notification.error("碎片化失败");
        }
    };

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
        <div className="min-h-screen bg-gradient-to-b from-base-300 to-base-100 relative overflow-hidden">
            {/* 背景装饰 */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute w-96 h-96 -top-48 -left-48 bg-primary/20 rounded-full blur-3xl" />
                <div className="absolute w-96 h-96 -bottom-48 -right-48 bg-secondary/20 rounded-full blur-3xl" />
            </div>

            <div className="container mx-auto pt-10 pb-20 px-6 relative z-10">
                <motion.button
                    className="btn btn-primary btn-sm mb-8"
                    onClick={() => router.back()}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    返回
                </motion.button>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-12"
                >
                    {/* NFT 详情卡片 */}
                    <motion.div variants={itemVariants} className="bg-base-100/70 backdrop-blur-md rounded-3xl shadow-xl overflow-hidden">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
                            {/* 图片部分 */}
                            <div className="relative group">
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur-xl"
                                    animate={{
                                        scale: [1, 1.2, 1],
                                        opacity: [0.5, 0.8, 0.5],
                                    }}
                                    transition={{
                                        duration: 3,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                    }}
                                />
                                <motion.div
                                    className="relative rounded-2xl overflow-hidden aspect-square"
                                    whileHover={{ scale: 1.02 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {nftMetadata ? (
                                        <img
                                            src={nftMetadata.image}
                                            alt={nftMetadata.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-base-200 animate-pulse" />
                                    )}
                                </motion.div>
                            </div>

                            {/* 详细信息部分 */}
                            <div className="flex flex-col justify-between">
                                <div className="space-y-6">
                                    <motion.div variants={itemVariants}>
                                        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                            {nftMetadata?.name ?? "Loading..."}
                                        </h1>
                                        <p className="text-base-content/70 mt-2">
                                            {nftMetadata?.description}
                                        </p>
                                    </motion.div>

                                    <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
                                        <div className="stat bg-base-200/50 rounded-xl">
                                            <div className="stat-title">Token ID</div>
                                            <div className="stat-value text-primary">{tokenId}</div>
                                        </div>
                                        <div className="stat bg-base-200/50 rounded-xl">
                                            <div className="stat-title">价格</div>
                                            <div className="stat-value text-secondary">
                                                {formatEther(nftData?.price ?? 0n)} ETH
                                            </div>
                                        </div>
                                    </motion.div>

                                    <motion.div variants={itemVariants}>
                                        <h3 className="text-lg font-semibold mb-3">拥有者</h3>
                                        {isFractionalized ? (
                                            <div className="text-warning">该NFT已被碎片化，无法查看拥有者</div>
                                        ) : (
                                            <Address address={nftData?.owner} />
                                        )}
                                    </motion.div>

                                    {/* 属性展示 */}
                                    <motion.div variants={itemVariants} className="space-y-3">
                                        <h3 className="text-lg font-semibold">属性</h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            {nftMetadata?.attributes?.map((attribute, index) => (
                                                <motion.div
                                                    key={index}
                                                    className="bg-base-200/50 rounded-xl p-4 hover:bg-base-200 transition-colors"
                                                    whileHover={{ scale: 1.02 }}
                                                >
                                                    <div className="text-sm text-base-content/70">{attribute.trait_type}</div>
                                                    <div className="font-semibold">{attribute.value}</div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </motion.div>
                                </div>

                                {/* 操作按钮 */}
                                <motion.div variants={itemVariants} className="flex gap-4 mt-6">
                                    {nftData?.isListed ? (
                                        <>
                                            <motion.button
                                                className="btn btn-primary flex-1"
                                                onClick={() => handleBuyNFT(Number(tokenId), Number(nftData?.price))}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                disabled={nftData?.owner === connectedAddress}
                                            >
                                                {nftData?.owner === connectedAddress ? "这是你的NFT" : "购买 NFT"}
                                            </motion.button>
                                            {nftData?.owner === connectedAddress && (
                                                <motion.button
                                                    className="btn btn-error flex-1"
                                                    onClick={handleDelistItem}
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    下架
                                                </motion.button>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            {nftData?.owner === connectedAddress && !nftData?.isListed && (
                                                <div className="flex gap-4 w-full">
                                                    {!isFractionalized && (
                                                        <motion.button
                                                            className="btn btn-primary flex-1"
                                                            onClick={() => setIsListModalOpen(true)}
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                        >
                                                            上架出售
                                                        </motion.button>
                                                    )}
                                                    <motion.button
                                                        className="btn btn-secondary flex-1"
                                                        onClick={() => setIsFractionalizeModalOpen(true)}
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        disabled={isFractionalized}
                                                    >
                                                        {isFractionalized ? "已碎片化" : "碎片化"}
                                                    </motion.button>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>

                    {/* 交易历史 */}
                    <motion.div
                        variants={itemVariants}
                        className="bg-base-100/70 backdrop-blur-md rounded-3xl shadow-xl p-8"
                    >
                        <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                            交易历史
                        </h2>
                        <div className="overflow-x-auto">
                            <table className="table w-full">
                                <thead>
                                    <tr>
                                        <th>Token ID</th>
                                        <th>卖家</th>
                                        <th>买家</th>
                                        <th>价格 (ETH)</th>
                                        <th>时间</th>
                                        <th>版税收取人</th>
                                        <th>版税 (ETH)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <AnimatePresence>
                                        {buyEvents?.map((event, index) => {
                                            const priceInEth = formatEther(event.args.price ?? 0n);
                                            const timestamp = event.block?.timestamp
                                                ? format(new Date(Number(event.block.timestamp) * 1000), "yyyy-MM-dd HH:mm:ss")
                                                : "N/A";
                                            const royaltyAmountInEth = formatEther(event.args.royaltyAmount ?? 0n);

                                            return (
                                                <motion.tr
                                                    key={index}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0 }}
                                                    transition={{ delay: index * 0.1 }}
                                                    className="hover:bg-base-200/50"
                                                >
                                                    <td>{event.args.tokenId?.toString()}</td>
                                                    <td><Address address={event.args.seller as `0x${string}` | undefined} /></td>
                                                    <td><Address address={event.args.buyer as `0x${string}` | undefined} /></td>
                                                    <td>{priceInEth}</td>
                                                    <td>{timestamp}</td>
                                                    <td><Address address={event.args.royaltyReceiver as `0x${string}` | undefined} /></td>
                                                    <td>{royaltyAmountInEth}</td>
                                                </motion.tr>
                                            );
                                        })}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                </motion.div>
            </div>

            {/* 上架弹窗 */}
            <dialog className={`modal ${isListModalOpen ? "modal-open" : ""}`}>
                <div className="modal-box">
                    <h3 className="font-bold text-lg mb-4">上架NFT</h3>
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">设置价格 (ETH)</span>
                        </label>
                        <input
                            type="number"
                            step="0.001"
                            value={listingPrice}
                            onChange={(e) => setListingPrice(e.target.value)}
                            placeholder="输入价格"
                            className="input input-bordered w-full"
                        />
                    </div>
                    <div className="modal-action">
                        <button className="btn" onClick={() => setIsListModalOpen(false)}>
                            取消
                        </button>
                        <button className="btn btn-primary" onClick={handleListNFT}>
                            确认上架
                        </button>
                    </div>
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button onClick={() => setIsListModalOpen(false)}>关闭</button>
                </form>
            </dialog>

            {/* 碎片化弹窗 */}
            <dialog className={`modal ${isFractionalizeModalOpen ? "modal-open" : ""}`}>
                <div className="modal-box">
                    <h3 className="font-bold text-lg mb-4">碎片化NFT</h3>
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">设置碎片数量</span>
                        </label>
                        <input
                            type="number"
                            min="2"
                            step="1"
                            value={fractionCount}
                            onChange={(e) => setFractionCount(e.target.value)}
                            placeholder="输入碎片数量"
                            className="input input-bordered w-full"
                        />
                    </div>
                    <div className="modal-action">
                        <button className="btn" onClick={() => setIsFractionalizeModalOpen(false)}>
                            取消
                        </button>
                        <button className="btn btn-primary" onClick={handleFractionalize}>
                            确认碎片化
                        </button>
                    </div>
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button onClick={() => setIsFractionalizeModalOpen(false)}>关闭</button>
                </form>
            </dialog>
        </div>
    );
};

export default NFTDetailPage;