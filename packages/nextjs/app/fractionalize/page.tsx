"use client";

import { useEffect, useState } from "react";
import type { NextPage } from "next";
import Link from "next/link";
import { useAccount } from "wagmi";
import { Address, AddressInput, InputBase } from "~~/components/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";
import { useScaffoldReadContract, useScaffoldWriteContract, useScaffoldContract } from "~~/hooks/scaffold-eth";


const Fractionalize: NextPage = () => {
  const [loading, setLoading] = useState(false);
  const { address: connectedAddress, isConnected, isConnecting } = useAccount();
  const [fractionDetails, setFractionDetails] = useState<{ tokenId: number; amount: number }[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedTokenId, setSelectedTokenId] = useState<number | null>(null);
  const [transferAddress, setTransferAddress] = useState("");
  const [transferAmount, setTransferAmount] = useState("");

  const { writeContractAsync: writeContractAsync } = useScaffoldWriteContract("YourCollectible");
  const { data: yourCollectibleContract } = useScaffoldContract({
    contractName: "YourCollectible",
  });

  // Define the read contract hook to call getFractionsByAddress
  const { data: fractionsData, refetch: fetchFractions } = useScaffoldReadContract({
    contractName: "YourCollectible",
    functionName: "getFractionsByAddress",
    args: [connectedAddress], // Pass the current address as argument
  });

  useEffect(() => {
    if (connectedAddress && fractionsData) {
        if (connectedAddress && fractionsData) {
            const tokenIds = fractionsData[0]; // First array returned
            const amounts = fractionsData[1]; // Second array returned
      
            // Transform into an array of objects for easier rendering
            const parsedData = tokenIds.map((tokenId: any, index: number) => ({
              tokenId: Number(tokenId),
              amount: Number(amounts[index]),
            }));
      
            setFractionDetails(parsedData);
          }
    }
  }, [connectedAddress, fractionsData]);

  // 转移碎片
  const handleTransfer = async () => {
    if (!selectedTokenId || !transferAddress || !transferAmount) {
      alert("Please fill out all fields.");
      return;
    }

    try {
      setLoading(true);
      await writeContractAsync({
        functionName: "transferFraction",
        args: [selectedTokenId, transferAddress, parseInt(transferAmount, 10)],
      });
      alert("Transfer successful!");
      setShowModal(false);
    } catch (error) {
      console.error(error);
      alert("Transfer failed!");
    } finally {
      setLoading(false);
    }
  };

  // 赎回NFT
  const handleRedeem = async (tokenId: number) => {
    if (!tokenId) {
      alert("Invalid Token ID");
      return;
    }
  
    try {
      setLoading(true);
      await writeContractAsync({
        functionName: "redeemNFT",
        args: [tokenId],
      });
      alert("Redeem successful!");
      fetchFractions(); // 更新页面数据
    } catch (error) {
      console.error(error);
      alert("Redeem failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <h1 className="text-center mb-4">
          <span className="block text-4xl font-bold">Fractionalize to NFT</span>
        </h1>

        <div className="mb-4">
            <p>
              <strong>Connected Address:</strong> {connectedAddress || "Not Connected"}
            </p>
            <p>
              <strong>Total NFTs Fractionalized:</strong> {fractionDetails.length}
            </p>
      </div>


      {/* Display token details */}
      <div className="w-full max-w-md">
        {fractionDetails.length > 0 ? (
          <table className="table-auto border-collapse border border-gray-200 w-full text-left">
            <thead>
              <tr>
                <th className="border px-4 py-2">Token ID</th>
                <th className="border px-4 py-2">数量</th>
                <th className="border px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {fractionDetails.map(({ tokenId, amount }) => (
                <tr key={tokenId}>
                <td className="border px-4 py-2">
                  <Link href={`/market/nftDetail/${tokenId}`} className="text-blue-500 hover:underline">
                    {tokenId}
                  </Link>
                </td>
                <td className="border px-4 py-2">{amount}</td>
                <td className="border px-4 py-2">
                  <button
                    className="mr-2 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                    onClick={() => {
                      setSelectedTokenId(tokenId);
                      setShowModal(true);
                    }}
                  >
                    Transfer
                  </button>
                    <button
                      className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                      onClick={() => handleRedeem(tokenId)}
                    >
                      Redeem
                    </button>
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

      {/* Modal for transferring NFT fractions */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full">
            <h2 className="text-xl font-bold mb-4">Transfer NFT Fraction</h2>
            <p>
              <strong>Token ID:</strong> {selectedTokenId}
            </p>
            <AddressInput
                value={transferAddress}
                placeholder="Receiver address"
                onChange={(newValue) => setTransferAddress(newValue)}
            />    
            {/* <input
              type="number"
              placeholder="Amount"
              className="w-full border px-2 py-1 rounded mb-2"
              value={transferAmount}
              onChange={(e) => setTransferAmount(e.target.value)}
            /> */}
            <InputBase
              value={transferAmount}
              onChange={(newValue) => setTransferAmount(newValue)}
              placeholder="Amount"
            />
            <div className="flex justify-end">
              <button
                className="bg-gray-300 text-gray-700 px-3 py-1 rounded mr-2"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                onClick={handleTransfer}
                disabled={loading}
              >
                {loading ? "Transferring..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
};

export default Fractionalize;
