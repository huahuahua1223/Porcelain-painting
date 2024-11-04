import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";
import { NFTMetaData } from "~~/utils/simpleNFT/nftsMetadata";
import { getMetadataFromIPFS } from "~~/utils/simpleNFT/ipfs-fetch";
import { useEffect, useState } from "react";

const NFTDetailPage = async ({ params }: { params: { tokenId: string } }) => {
    const { tokenId } = params;
    console.log(tokenId);

    const [image, setImage] = useState("");
    const [nftName, setNftName] = useState("");
    const [nftDescription, setNftDescription] = useState("");

    // 直接从合约中读取 NFT 详情
    const { data: nftData, isLoading, error } = useScaffoldReadContract({
        contractName: "YourCollectible",
        functionName: "getAllListedItems",
    });

    const { writeContractAsync } = useScaffoldWriteContract("YourCollectible");
};