"use client";

import { useState } from "react";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";
import { addToIPFS } from "~~/utils/simpleNFT/ipfs-fetch";
import { MyHoldings } from "./_components";

const CreateNFTPage: NextPage = () => {
  const { address: connectedAddress, isConnected, isConnecting } = useAccount();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const { writeContractAsync } = useScaffoldWriteContract("YourCollectible");

  // 处理文件上传
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
  };

  // 处理铸造 NFT
  const handleMintItem = async () => {
    if (!file || !name || !description) {
      notification.error("Please provide all required information.");
      return;
    }

    const metadata = {
      name,
      description,
      image: URL.createObjectURL(file), // 本地预览使用
    };

    const notificationId = notification.loading("Uploading metadata to IPFS...");
    try {
      // 上传到 IPFS
      const uploadedItem = await addToIPFS(metadata);
      notification.remove(notificationId);
      notification.success("Metadata uploaded to IPFS");

      // 调用智能合约铸造 NFT
      await writeContractAsync({
        functionName: "mintItem",
        args: [connectedAddress, uploadedItem.IpfsHash],
      });

      notification.success("NFT Minted successfully!");
    } catch (error) {
      notification.remove(notificationId);
      notification.error("Failed to mint NFT.");
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col items-center pt-10">
      <h1 className="text-4xl font-bold mb-8">Create & Mint Your NFT</h1>
      
      <div className="mb-4">
        <label className="block text-lg mb-2">NFT Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input input-bordered"
          placeholder="Enter NFT Name"
        />
      </div>

      <div className="mb-4">
        <label className="block text-lg mb-2">NFT Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="textarea textarea-bordered"
          placeholder="Enter NFT Description"
        />
      </div>

      <div className="mb-4">
        <label className="block text-lg mb-2">Upload NFT Image</label>
        <input type="file" onChange={handleFileChange} />
      </div>

      <div className="flex justify-center">
        {!isConnected || isConnecting ? (
          <RainbowKitCustomConnectButton />
        ) : (
          <button className="btn btn-primary" onClick={handleMintItem}>
            Mint NFT
          </button>
        )}
      </div>

      {/* 展示用户当前拥有的 NFT */}
      <MyHoldings />
    </div>
  );
};

export default CreateNFTPage;
