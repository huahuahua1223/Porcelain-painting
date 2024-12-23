import { useState, useEffect } from "react";
import { useScaffoldReadContract, useScaffoldWriteContract, useScaffoldContract } from "~~/hooks/scaffold-eth";
import { AddressInput, InputBase } from "~~/components/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { parseEther, formatEther } from "viem";

export const FractionOperations = ({ onOperationComplete }: { onOperationComplete: () => void }) => {
    const { address: connectedAddress } = useAccount();
    const [fractionDetails, setFractionDetails] = useState<{ tokenId: number; amount: number }[]>([]);
    const [transferAddress, setTransferAddress] = useState<string>("");
    const [transferAmount, setTransferAmount] = useState<number>(0);
    const [salePrice, setSalePrice] = useState<number>(0);
    const [showTransferModal, setShowTransferModal] = useState<boolean>(false);
    const [showSaleModal, setShowSaleModal] = useState<boolean>(false);
    const [selectedTokenId, setSelectedTokenId] = useState<number | null>(null);
    const router = useRouter();

    const { writeContractAsync: writeContractAsync } = useScaffoldWriteContract("YourCollectible");
    const { data: yourCollectibleContract } = useScaffoldContract({
        contractName: "YourCollectible",
    });

    const { data: fractionsData, refetch: fetchFractions } = useScaffoldReadContract({
        contractName: "YourCollectible",
        functionName: "getFractionsByAddress",
        args: [connectedAddress], // Pass the current address as argument
    });

    useEffect(() => {
        if (connectedAddress && fractionsData) {
            const tokenIds = fractionsData[0];
            const fractions = fractionsData[1];

            const parsedData = tokenIds
                .map((tokenId: any, index: number) => ({
                    tokenId: Number(tokenId),
                    amount: Number(fractions[index].amount),
                    isForSale: fractions[index].isForSale,
                }))
                .filter(fraction => !fraction.isForSale);

            console.log("=================",parsedData);
            setFractionDetails(parsedData);
        }
    }, [connectedAddress, fractionsData]);

    const handleTransfer = async () => {
        if (selectedTokenId === null || !transferAddress || !transferAmount) {
            notification.error("请填写所有字段。");
            return;
        }
        try {
            await writeContractAsync({
                functionName: "transferFraction",
                args: [selectedTokenId, transferAddress, transferAmount],
            });
            notification.success("转赠成功！");
            onOperationComplete();
            setShowTransferModal(false);
        } catch (error) {
            console.error("转赠失败", error);
            notification.error("转赠失败！");
        }
    };

    const handleSetForSale = async () => {
        if (selectedTokenId === null || !salePrice) {
            notification.error("请指定销售单价");
            return;
        }
        try {
            const priceWei = parseEther(salePrice.toString());
            await writeContractAsync({
                functionName: "setFractionForSale",
                args: [selectedTokenId, priceWei],
            });
            notification.success("碎片已上架！");
            onOperationComplete();
            setShowSaleModal(false);
        } catch (error) {
            console.error("上架失败", error);
            notification.error("上架失败！");
        }
    };

    const handleRedeem = async (tokenId: number) => {
        if (!tokenId) {
            notification.error("Invalid Token ID");
            return;
          }
          
        try {
            await writeContractAsync({
                functionName: "redeemNFT",
                args: [tokenId],
            });
            notification.success("赎回成功！");
            onOperationComplete();
        } catch (error) {
            console.error("赎回失败", error);
            notification.error("赎回失败！");
        }
    };

    const handleViewDetails = (tokenId: number) => {
        router.push(`/market/nftDetail/${tokenId}`);
    };

    return (
        <>
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
                <p className="font-bold">注意</p>
                <p>以下是您持有的NFT碎片，您可以进行转赠、上架或赎回操作。</p>
            </div>
            {fractionDetails.length === 0 ? (
                <p className="text-center mt-4 text-gray-500">您没有可用的NFT碎片</p>
            ) : (
                <table className="min-w-full primary shadow-md rounded-lg overflow-hidden">
                    <thead className="primary">
                        <tr>
                            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Token ID</th>
                            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">数量</th>
                            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        {fractionDetails.map((fractionDetail, index) => (
                            <tr key={index} className="border-b last:border-none">
                                <td className="py-3 px-4">{fractionDetail.tokenId}</td>
                                <td className="py-3 px-4">{fractionDetail.amount}</td>
                                <td className="py-3 px-4 space-x-2">
                                    <button className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600" onClick={() => { setSelectedTokenId(fractionDetail.tokenId); setShowTransferModal(true); }}>转赠</button>
                                    <button className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600" onClick={() => { setSelectedTokenId(fractionDetail.tokenId); setShowSaleModal(true); }}>上架</button>
                                    <button className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600" onClick={() => handleRedeem(fractionDetail.tokenId)}>兑换</button>
                                    <button className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600" onClick={() => handleViewDetails(fractionDetail.tokenId)}>查看详情</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {showTransferModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75">
                    <div className="primary p-8 rounded-lg shadow-xl max-w-md w-full">
                        <h2 className="text-2xl font-bold mb-6">Transfer NFT Fraction</h2>
                        <p><strong>Token ID:</strong> {selectedTokenId}</p>
                        <div className="mb-4">
                            <label className="block text-sm font-medium primary">接收地址</label>
                            <AddressInput
                                value={transferAddress}
                                onChange={(newValue) => setTransferAddress(newValue)}
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium primary">转赠数量</label>
                            <InputBase
                                value={transferAmount}
                                onChange={(newValue) => setTransferAmount(Number(newValue))}
                            />
                        </div>
                        <div className="mt-6 flex justify-end space-x-4">
                            <button className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500" onClick={() => setShowTransferModal(false)}>Cancel</button>
                            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onClick={handleTransfer}>Confirm</button>
                        </div>
                    </div>
                </div>
            )}

            {showSaleModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75">
                    <div className="primary p-8 rounded-lg shadow-xl max-w-md w-full">
                        <h2 className="text-2xl font-bold mb-6">Set Sale Price</h2>
                        <p><strong>Token ID:</strong> {selectedTokenId}</p>
                        <div className="mb-4">
                            <label className="block text-sm font-medium primary">设置碎片单价</label>
                            <InputBase
                                value={salePrice}
                                onChange={(newValue) => setSalePrice(Number(newValue))}
                            />
                        </div>
                        <div className="mt-6 flex justify-end space-x-4">
                            <button className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500" onClick={() => setShowSaleModal(false)}>Cancel</button>
                            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onClick={handleSetForSale}>List for Sale</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}; 