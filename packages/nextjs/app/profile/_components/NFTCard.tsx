import { useState, useEffect, useCallback } from "react";
import { Collectible } from "./MyHoldings";
import { Address, AddressInput } from "~~/components/scaffold-eth";
import { useScaffoldWriteContract, useScaffoldReadContract, useScaffoldContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";
import { parseEther, formatEther } from "viem";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei"; // 用于加载和展示 .glb 文件

export const NFTCard = ({ nft, onNFTUpdate }: { nft: Collectible, onNFTUpdate: () => void }) => {
  const { address: connectedAddress } = useAccount();
  const [transferToAddress, setTransferToAddress] = useState("");
  const [isListed, setIsListed] = useState(false);
  const [price, setPrice] = useState<string>(""); // 用于存储用户输入的价格
  const [loading, setLoading] = useState(false); // 控制上架按钮的加载状态
  const [isSecondHand, setIsSecondHand] = useState(false); // 检查是否二手交易
  const [royaltyAmount, setRoyaltyAmount] = useState<string>("0"); // 版税费用
  const [fractionCount, setFractionCount] = useState<string>(""); // 碎片化数量
  const [fileType, setFileType] = useState<string | null>(null); // 文件类型
  const [rentalPrice, setRentalPrice] = useState<string>(""); // 租赁价格
  const [expiryDate, setExpiryDate] = useState<string>(""); // 到期时间
  const [isRentalModalOpen, setIsRentalModalOpen] = useState(false);
  const [rentalAddress, setRentalAddress] = useState("");

  const router = useRouter();

  const { writeContractAsync } = useScaffoldWriteContract("YourCollectible");
  const { data: yourCollectibleContract } = useScaffoldContract({
    contractName: "YourCollectible",
  });

  const { data: nftItem } = useScaffoldReadContract({
    contractName: "YourCollectible",
    functionName: "getNFTItemByTokenId",
    args: [BigInt(nft.id.toString())],
    watch: true,
  });

  const { data: mintedBy } = useScaffoldReadContract({
    contractName: "YourCollectible",
    functionName: "getMintedBy",
    args: [BigInt(nft.id.toString())],
  });

  useEffect(() => {
    if (nftItem) {
      console.log("nftItem==============", nftItem);
      console.log("nft==============", nft)
      setIsListed(nftItem.isListed as boolean);
      setPrice(BigInt(nftItem.price).toString());
    } else {
      setIsListed(false);
      setPrice("");
    }

    // 检查是否是二手交易
    if (mintedBy && mintedBy !== nft.owner) {
      setIsSecondHand(true); // 如果铸造者与当前拥有者不同，则视为二手交易
    } else {
      setIsSecondHand(false);
    }
  }, [nftItem, mintedBy]);

  useEffect(() => {
    // 获取文件类型
    const fetchFileType = async () => {
      try {
        const response = await fetch(nft.image, { method: "HEAD" });
        const contentType = response.headers.get("Content-Type");
        console.log("contentType==============", contentType)
        setFileType(contentType);
      } catch (error) {
        console.error("无法获取文件类型", error);
      }
    };
    fetchFileType();
  }, [nft.image]);

  // 计算版税金额
  const calculateRoyalty = async (price: string) => {
    if (isSecondHand) {
      const priceWei = parseEther(price);
      console.log("tokenId:", nft.id)
      console.log("价格 wei:", priceWei)
      try {
        // 调用 yourCollectibleContract 合约的 royaltyInfo 方法来获取版税信息
        const royaltyInfoResult = await yourCollectibleContract?.read.royaltyInfo([BigInt(nft.id), priceWei]);

        if (royaltyInfoResult) {
          // 将 readonly 数组转换为普通数组，然后解构
          const [royaltyReceiver, royaltyAmount] = Array.from(royaltyInfoResult);
  
          console.log("royaltyReceiver:", royaltyReceiver);
          console.log("royaltyAmount:", royaltyAmount);
  
          setRoyaltyAmount(royaltyAmount.toString());
        }
      } catch (error) {
        console.error("获取版税信息失败:", error);
      }
    } else {
      setRoyaltyAmount("0");
    }
  };

  // 上架
  const handleListNFT = async () => {
    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      notification.error("Please enter a valid price");
      return;
    }

    console.log("价格:", price);
    const priceWei = parseEther(price); // 将 ETH 转换为 wei
    console.log("价格 (wei):", priceWei);

    // 0.025 ETH 手续费，使用 parseEther 转换为 wei
    const listingFee = parseEther("0.025"); // 转换 0.025 ETH 为 wei

    try {
      setLoading(true);

      await writeContractAsync({
        functionName: "listItem",
        args: [BigInt(nft.id), priceWei],
        value: listingFee, // 发送手续费
      });

      notification.success("NFT listed successfully!");
    } catch (error) {
      console.error(error);
      notification.error("Listing failed");
    } finally {
      setLoading(false);
    }
  };

  // 下架
  const handleUnlistNFT = async () => {
    console.log("下架 NFT:", nft.id);
    try {
      await writeContractAsync({
        functionName: "delistItem",
        args: [BigInt(nft.id.toString())],
      });
    } catch (err) {
      console.error("调用 delistItem 方法时出错");
    }
  };

  // 碎片化
  const handleFractionalizeNFT = async () => {
    if (!fractionCount || isNaN(Number(fractionCount)) || Number(fractionCount) <= 0) {
      notification.error("请输入有效的碎片数量");
      return;
    }

    try {
      setLoading(true);

      await writeContractAsync({
        functionName: "fractionalizeNFT",
        args: [BigInt(nft.id), BigInt(fractionCount)],
      });

      notification.success("NFT 碎片化成功!");
      onNFTUpdate(); // 调用回调函数通知父组件更新
    } catch (error) {
      console.error(error);
      notification.error("碎片化失败");
    } finally {
      setLoading(false);
    }
  };

  // 跳转到详情页
  const handleViewNFTDetails = (tokenId: number) => {
    router.push(`/market/nftDetail/${tokenId}`);
  };

  // 设置租赁
  const handleSetRental = async () => {
    try {
      // 将选择的日期时间转换为时间戳（秒）
      const expiryTimestamp = Math.floor(new Date(expiryDate).getTime() / 1000);
      
      await writeContractAsync({
        functionName: "setUser",
        args: [BigInt(nft.id), rentalAddress, BigInt(expiryTimestamp)],
      });
      
      notification.success("NFT租赁设置成功!");
      
      // 调用回调函数刷新数据
      onNFTUpdate();      
    } catch (error) {
      console.error("设置租赁失败:", error);
      notification.error("设置租赁失败");
    }
  };

  // 使用 useCallback 包装检查过期的逻辑
  const checkExpiry = useCallback(() => {
    const currentTime = Math.floor(Date.now() / 1000);
    if (nft.rentExpiry && currentTime > nft.rentExpiry) {
      return true;
    }
    return false;
  }, [nft.rentExpiry]);

  // 修改 useEffect 中的租赁到期检查逻辑
  useEffect(() => {
    if (!nft.isRented || !nft.rentExpiry) {
      return;
    }

    const isExpired = checkExpiry();
    if (isExpired) {
      onNFTUpdate();
      return;
    }

    const timeUntilExpiry = (nft.rentExpiry * 1000) - Date.now();
    const timer = setTimeout(onNFTUpdate, timeUntilExpiry);

    return () => clearTimeout(timer);
  }, [nft.isRented, nft.rentExpiry, checkExpiry]); // 移除 onNFTUpdate 从依赖项

  return (
    <div className="card card-compact bg-base-100 shadow-lg w-[300px] shadow-secondary">
      {/* 租赁状态标签 */}
      {nft.isRented && nft.rentExpiry && (
        <div className="absolute top-2 right-2 z-10">
          {Math.floor(Date.now() / 1000) > nft.rentExpiry ? (
            null
          ) : (
            <div className="flex flex-col items-end gap-1">
              <div className="badge badge-secondary">
                租赁中 (到期时间: {new Date(nft.rentExpiry * 1000).toLocaleString()})
              </div>
              {nft.isRentedByMe ? (
                <div className="badge badge-secondary">
                  租赁自: <Address address={nft.owner as `0x${string}`} format="short" />
                </div>
              ) : (
                <div className="badge badge-secondary">
                  租赁者: <Address address={nft.rentedTo as `0x${string}`} format="short" />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* NFT 图片/模型显示 */}
      <div className="relative">
        <div className={`nft-image-container ${fileType && fileType.includes("model/gltf-binary") ? "canvas" : ""}`}>
          {fileType && fileType.includes("model/gltf-binary") ? (
            // 渲染 3D 模型
            <Canvas style={{ width: "100%", height: "100%" }}>
              <ambientLight intensity={1.5} />
              <spotLight position={[10, 10, 10]} angle={0.15} intensity={1.5} />
              <spotLight position={[-10, 10, 10]} angle={0.15} intensity={1.5} />
              <GLBModel modelUrl={nft.image} />
              <OrbitControls />
            </Canvas>
          ) : nft.image ? (
            // 普通图片
            <img
              src={nft.image}
              alt={`NFT-${nft.id}`}
              className="h-60 min-w-full"
              onClick={() => handleViewNFTDetails(nft.id)}
            />
          ) : (
            <p>图片加载失败</p>
          )}
        </div>
        <figcaption className="glass absolute bottom-4 left-4 p-4 w-25 rounded-xl">
          <span className="text-white "># {nft.id}</span>
        </figcaption>
      </div>

      {/* 卡片内容 */}
      <div className="card-body space-y-3">
        {/* NFT 基本信息 */}
        <div className="flex items-center justify-center">
          <p className="text-xl p-0 m-0 font-semibold">{nft.name}</p>
          <div className="flex flex-wrap space-x-2 mt-1">
            {nft.attributes?.map((attr, index) => (
              <span key={index} className="badge badge-primary py-3">
                {attr.value}
              </span>
            ))}
          </div>
        </div>
        <div className="flex flex-col justify-center mt-1">
          <p className="my-0 text-lg">{nft.description}</p>
        </div>
        <div className="flex space-x-3 mt-1 items-center">
          <span className="text-lg font-semibold">Owner : </span>
          <Address address={nft.owner as `0x${string}`} />
        </div>

        {/* 如果不是租赁来的 NFT，显示所有操作按钮 */}
        {!nft.isRentedByMe && (
          <div className="">
            {/* 转移功能 */}
            <div className="flex flex-col my-2 space-y-1">
              <span className="text-lg font-semibold mb-1">Transfer To: </span>
              <AddressInput
                value={transferToAddress}
                placeholder="receiver address"
                onChange={newValue => setTransferToAddress(newValue)}
              />
            </div>
            <div className="card-actions justify-end">
              <button
                className="btn btn-secondary btn-md px-8 tracking-wide"
                onClick={() => {
                  try {
                    writeContractAsync({
                      functionName: "transferFrom",
                      args: [nft.owner as `0x${string}`, transferToAddress as `0x${string}`, BigInt(nft.id.toString())],
                    });
                  } catch (err) {
                    console.error("Error calling transferFrom function");
                  }
                }}
              >
                Send
              </button>
            </div>

            {/* 上架/下架功能 */}
            {!isListed && (
              <div className="flex items-center my-2 space-x-3">
                <span className="text-lg font-semibold">Price(ETH)</span>
                <input
                  type="text"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="input input-xs rounded-lg shadow-sm w-20 px-1 py-0.5"
                  placeholder="Enter price"
                />
                <button
                  className="btn btn-primary btn-sm px-4 py-1"
                  onClick={() => {
                    calculateRoyalty(price); // 计算版税
                    handleListNFT();
                  }}
                >
                  上架
                </button>
              </div>
            )}

            {/* 二手交易提醒 */}
            {isSecondHand && royaltyAmount !== "0" && (
              <div className="alert alert-warning my-2">
                <span>注意: 这是二手交易，一笔版税费为 {formatEther(royaltyAmount)} ETH 将被扣除</span>
              </div>
            )}

            {/* {isListed && (
              <div className="flex items-center my-2 space-x-3">
                <span className="text-lg font-semibold">Price(ETH):{price}</span>
                <button
                  className="btn btn-primary btn-sm px-4 py-1"
                  onClick={handleUnlistNFT}
                >
                  下架
                </button>
              </div>
            )} */}

            {/* 碎片化功能 */}
            <div className="flex items-center my-2 space-x-3">
              <span className="text-lg font-semibold">碎片数量</span>
              <input
                type="text"
                value={fractionCount}
                onChange={(e) => setFractionCount(e.target.value)}
                className="input input-xs rounded-lg shadow-sm w-20 px-1 py-0.5"
                placeholder="输入数量"
              />
              <button
                className="btn btn-primary btn-sm px-4 py-1"
                onClick={handleFractionalizeNFT}
              >
                碎片化
              </button>
            </div>

            {/* 只有在 NFT 所有者查看时才显示租赁设置按钮 */}
            {nft.owner.toLowerCase() === connectedAddress?.toLowerCase() && 
              (!nft.isRented || (nft.rentExpiry && Math.floor(Date.now() / 1000) > nft.rentExpiry)) && (
              <div className="flex items-center my-2 space-x-3">
                <button
                  className="btn btn-primary btn-sm px-4 py-1"
                  onClick={() => setIsRentalModalOpen(true)}
                >
                  设置租赁
                </button>
              </div>
            )}

            {/* 租赁设置弹窗 */}
            {isRentalModalOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className=" p-6 rounded-lg w-96">
                  <h3 className="text-lg font-bold mb-4">设置 NFT 租赁</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="label">租赁地址</label>
                      <AddressInput
                        value={rentalAddress}
                        placeholder="租赁者地址"
                        onChange={newValue => setRentalAddress(newValue)}
                      />
                    </div>

                    <div>
                      <label className="label">到期时间</label>
                      <input
                        type="datetime-local"
                        className="input input-bordered w-full"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                        min={new Date().toISOString().slice(0, 16)}
                      />
                    </div>

                    <div className="flex justify-end space-x-2 mt-4">
                      <button
                        className="btn btn-ghost"
                        onClick={() => setIsRentalModalOpen(false)}
                      >
                        取消
                      </button>
                      <button
                        className="btn btn-primary"
                        onClick={() => {
                          handleSetRental();
                          setIsRentalModalOpen(false);
                        }}
                      >
                        确认
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>

    
  );
};

const GLBModel = ({ modelUrl }: { modelUrl: string }) => {
  const gltf = useGLTF(modelUrl);
  return <primitive object={gltf.scene} />;
};
