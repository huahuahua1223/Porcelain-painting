"use client";

import { useState } from "react";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";
import { uploadFileToIPFS, addToIPFS, saveNFTToDB } from "~~/utils/simpleNFT/ipfs-fetch";
// import { MyHoldings } from "./_components";
import { usePublicClient } from "wagmi";

const CreateNFTPage: NextPage = () => {
  const { address: connectedAddress, isConnected, isConnecting } = useAccount();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageCID, setImageCID] = useState<string | null>(null); // 存储图片的 CID
  const [attributes, setAttributes] = useState([{ trait_type: "", value: "" }]);
  const [royaltyFee, setRoyaltyFee] = useState(250); // 用于存储版税费率
  const { writeContractAsync } = useScaffoldWriteContract("YourCollectible");

  const publicClient = usePublicClient();
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // 处理文件上传
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const notificationId = notification.loading("Uploading image to IPFS...");

    try {
      const uploadedFile = await uploadFileToIPFS(selectedFile);
      notification.remove(notificationId);

      if (uploadedFile && uploadedFile.IpfsHash) {
        console.log("IpfsHash==========>", uploadedFile.IpfsHash);
        setImageCID(uploadedFile.IpfsHash); // 将 IPFS CID 设置到状态
        notification.success("Image uploaded to IPFS successfully!");
        setImagePreview(URL.createObjectURL(selectedFile));
      } else {
        notification.error("Failed to upload image to IPFS.");
      }
    } catch (error) {
      notification.remove(notificationId);
      notification.error("Failed to upload image.");
      console.error(error);
    }
  };

  const handleAttributeChange = (index: number, field: string, value: string) => {
    const newAttributes = [...attributes];
    newAttributes[index] = { ...newAttributes[index], [field]: value };
    setAttributes(newAttributes);
  };

  // 添加新属性
  const addNewAttribute = () => {
    setAttributes([...attributes, { trait_type: "", value: "" }]);
  };

  // 删除属性
  const removeAttribute = (index: number) => {
    setAttributes(attributes.filter((_, i) => i !== index));
  };

  // 铸造NFT
  const handleMintItem = async () => {
    if (!imageCID || !name || !description) {
      notification.error("Please provide all required information.");
      return;
    }

    const metadata = {
      name,
      description,
      image: `https://aqua-famous-koala-370.mypinata.cloud/ipfs/${imageCID}`, // 使用 IPFS 的 CID 链接
      attributes,
    };

    const notificationId = notification.loading("Uploading metadata to IPFS...");
    try {
      // 上传到 metadata 到IPFS
      const uploadedItem = await addToIPFS(metadata);
      notification.remove(notificationId);
      notification.success("Metadata uploaded to IPFS");

      // 调用智能合约铸造 NFT
      const mintTx = await writeContractAsync({
        functionName: "mintItem",
        args: [connectedAddress, uploadedItem.IpfsHash, royaltyFee],
      });

      // 从交易回执中获取返回值tokenID
      const receipt = await publicClient?.getTransactionReceipt({ hash: mintTx as `0x${string}`})
      console.log("receipt==========>", receipt);
      const nft_id = receipt?.logs[0].topics[3];
      const numericId = parseInt(nft_id as `0x${string}`, 16)
      console.log("numericId==========>" + numericId);

      const mint_item = new Date();
      // 转换到UTC+8
      mint_item.setHours(mint_item.getHours() + 8);  // 这里将时间调整为东八区（UTC+8）
      const mint_item_str = mint_item.toISOString().slice(0, 19).replace('T', ' ');

      // 保存到数据库
      if(nft_id) {
        const data = {
          nft_id: numericId,
          token_uri: uploadedItem.IpfsHash,
          mint_item: mint_item_str,
          owner: connectedAddress,
          state: 0,
          royaltyFeeNumerator: royaltyFee,
        };
        await saveNFTToDB(data);
      }

      notification.success("NFT Minted successfully!");
    } catch (error) {
      notification.remove(notificationId);
      notification.error("Failed to mint NFT.");
      console.error(error);
    }
  };

  // 更新版税费率的处理函数
const handleRoyaltyFeeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = Number(e.target.value);
  if (value <= 1000) {
    setRoyaltyFee(value); // 只有当值不超过1000时才更新
  } else {
    notification.error("版税不能超过10%~");
  }
};

  return (
    <div className="flex flex-col items-center pt-10 px-6 max-w-6xl mx-auto">
      <h1 className="text-5xl font-bold mb-4">
        <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent 
              drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">
          铸造你的NFT
        </span>
      </h1>
      <div className="flex flex-wrap justify-between w-full gap-6">
        {/* 左侧输入框部分 */}
        <div className="w-full lg:w-7/12 border border-gray-300 p-6 rounded-xl shadow-lg">
          {/* NFT名称输入 */}
          <div className="mb-6">
            <label className="block text-xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              NFT 名称
            </label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input input-bordered w-full bg-base-200 pr-10 transition-all hover:bg-base-300 focus:ring-2 focus:ring-primary"
                placeholder="为你的NFT起个独特的名字"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 2a1 1 0 00-1 1v1.323l3.954 1.582L14.5 4.82a1 1 0 100 2.36l-1.546-1.083L9 7.679V15a1 1 0 102 0V9.322l3.954-1.582L16.5 8.82a1 1 0 100-2.36l-1.546-1.083L11 3.797V3a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </span>
            </div>
          </div>

          {/* NFT描述输入 */}
          <div className="mb-6">
            <label className="block text-xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              NFT 描述
            </label>
            <div className="relative">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="textarea textarea-bordered w-full h-32 bg-base-200 transition-all hover:bg-base-300 focus:ring-2 focus:ring-primary"
                placeholder="描述一下你的NFT特色..."
              />
              <span className="absolute right-3 top-3 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd" />
                </svg>
              </span>
            </div>
          </div>

          {/* 图片上传部分 */}
          <div className="mb-6">
            <label className="block text-xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              上传图片
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center transition-all hover:border-primary">
              <div className="flex flex-col items-center">
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="mb-4">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className="flex text-sm text-gray-600">
                    <p className="pl-1">点击上传图片或拖放文件到这里</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    支持 PNG, JPG, GIF 等格式
                  </p>
                </label>
                <input
                  type="file"
                  id="file-upload"
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*"
                />
              </div>
              {imageCID && (
                <div className="mt-4 text-sm text-green-500 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  图片已上传成功
                </div>
              )}
            </div>
          </div>

          {/* 添加属性设置部分 */}
        <div className="w-full max-w-3xl border border-gray-300 p-6 rounded-xl shadow-lg mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">NFT 属性设置</h2>
            <button
              className="btn btn-primary btn-sm"
              onClick={addNewAttribute}
            >
              添加属性
            </button>
          </div>
          
          <div className="space-y-4">
            {attributes.map((attr, index) => (
              <div key={index} className="flex gap-4 items-start">
                <div className="form-control flex-1">
                  <label className="label">
                    <span className="label-text">属性名称</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    value={attr.trait_type}
                    onChange={(e) => handleAttributeChange(index, 'trait_type', e.target.value)}
                    placeholder="例如: 背景"
                  />
                </div>
                
                <div className="form-control flex-1">
                  <label className="label">
                    <span className="label-text">属性值</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    value={attr.value}
                    onChange={(e) => handleAttributeChange(index, 'value', e.target.value)}
                    placeholder="例如: 蓝色"
                  />
                </div>

                <button
                  className="btn btn-square btn-error btn-sm mt-9"
                  onClick={() => removeAttribute(index)}
                >
                  x
                </button>
              </div>
            ))}
          </div>
        </div>

          <div className="mb-4">
            <label className="block text-lg mb-2">版税比例</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={royaltyFee / 100}
                onChange={e => {
                  const value = Math.round(parseFloat(e.target.value) * 100);
                  if (!isNaN(value) && value >= 0 && value <= 1000) {
                    setRoyaltyFee(value);
                  }
                }}
                className="input input-bordered flex-1"
                placeholder="输入版税比例"
                step="any"
                min="0"
                max="10"
              />
              <span className="text-lg">%</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              版税比例范围: 0% - 10%
            </p>
          </div>
        </div>

        {/* 右侧实时预览部分 */}
        <div className="w-full lg:w-4/12 border border-gray-300 p-6 rounded-xl shadow-lg bg-base-100">
          <h2 className="text-xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            NFT 预览
          </h2>
          <div className="border rounded-xl p-4 shadow-inner bg-base-200">
            {imagePreview ? (
              <img 
                src={imagePreview} 
                alt="NFT Preview" 
                className="w-full h-auto mb-4 rounded-lg shadow-md transition-transform hover:scale-105" 
              />
            ) : (
              <div className="w-full h-48 bg-base-300 rounded-lg flex items-center justify-center text-gray-500 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            <div className="space-y-3">
              <p className="text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {name || "等待输入名称..."}
              </p>
              <p className="text-gray-600 text-sm">
                {description || "等待输入描述..."}
              </p>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                属性列表:
              </h3>
              {attributes.length > 0 && attributes[0].trait_type ? (
                <div className="grid grid-cols-2 gap-2">
                  {attributes.map((attr, idx) => (
                    <div key={idx} className="bg-base-300 rounded-lg p-2 text-sm">
                      <span className="font-semibold">{attr.trait_type}:</span> {attr.value}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">暂无属性</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-6">
        {!isConnected || isConnecting ? (
          <RainbowKitCustomConnectButton />
        ) : (
          <button className="btn btn-primary" onClick={handleMintItem}>
            Mint NFT
          </button>
        )}
      </div>

      {/* <MyHoldings /> */}
    </div>
  );
};

export default CreateNFTPage;
