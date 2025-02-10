"use client";
import React, { useState } from "react";
import { toast } from 'react-hot-toast';
import {
    useWriteContract,
    useReadContracts,
    useWatchContractEvent,
    useChainId,
} from "wagmi";
import { config } from "@/config/wagmi";
import { CONTRACTS } from "@/config/contracts.config";
import AdminDashboard from "@/components/AdminDashboard";

const SepoliaChainId = 11155111;
const BnbTestnetChainId = 97;

const AdminPage = () => {
    // ---------------------------
    // Hooks & State
    // ---------------------------
    const { writeContract } = useWriteContract();
    const [feePercent, setFeePercent] = useState(5);
    const [minBetAmount, setMinBetAmount] = useState(0.01);
    const [timeout, setTimeout] = useState(60);
    const [recipient, setRecipient] = useState("");
    const [withdrawAmount, setWithdrawAmount] = useState(0);

    // Get chain ID
    const chainId = useChainId();
    // Choose the contract address based on chainId
    let chainFlipContractAddress;// = chainId === SepoliaChainId ? CONTRACTS.chainFlip.sepolia : CONTRACTS.chainFlip.amoy;

    if (chainId === SepoliaChainId) {
        chainFlipContractAddress = CONTRACTS.chainFlip.sepolia;
    } else if (chainId === BnbTestnetChainId) {
        chainFlipContractAddress = CONTRACTS.chainFlip.bnbtestnet;
    } else {
        chainFlipContractAddress = CONTRACTS.chainFlip.amoy;
    }
    // Get native currency symbol
    const chain = config.chains.find((c) => c.id === chainId);
    const nativeCurrency = chain?.nativeCurrency?.symbol ?? "???"; // Fallback if undefined


    // Reading from multiple contract functions
    const { data, refetch } = useReadContracts({
        contracts: [
            {
                address: chainFlipContractAddress,
                abi: CONTRACTS.chainFlip.abi,
                functionName: "getCollectedFees"
            },
            {
                address: chainFlipContractAddress,
                abi: CONTRACTS.chainFlip.abi,
                functionName: "getCurrentMatchId"
            },
            {
                address: chainFlipContractAddress,
                abi: CONTRACTS.chainFlip.abi,
                functionName: "getFeePercent"
            },
            {
                address: chainFlipContractAddress,
                abi: CONTRACTS.chainFlip.abi,
                functionName: "getMinimumBetAmount"
            }
        ] as const
    });

    // Types to help parse readContracts data
    interface ContractResult {
        result?: bigint;
    }

    const collectedFees = data?.[0] as ContractResult;
    const currentFeePercent = data?.[2] as ContractResult;
    const betAmount = data?.[3] as ContractResult;

    // ---------------------------
    // Watch for each event at top-level
    // ---------------------------

    // Set up event watcher to detect when fees are withdrawn
    useWatchContractEvent({
        address: chainFlipContractAddress,
        abi: CONTRACTS.chainFlip.abi,
        eventName: "FeesWithdrawn",
        onLogs: async () => {
            toast.dismiss();
            toast.success("Fees withdrawn successfully!");
            await refetch();
        },
    });

    useWatchContractEvent({
        address: chainFlipContractAddress,
        abi: CONTRACTS.chainFlip.abi,
        eventName: "MinimumBetAmountUpdated",
        onLogs: async () => {
            console.log("Event: MinimumBetAmountUpdated => refetching...");
            await refetch();
        }
    });

    useWatchContractEvent({
        address: chainFlipContractAddress,
        abi: CONTRACTS.chainFlip.abi,
        eventName: "FeeUpdated",
        onLogs: async () => {
            console.log("Event: FeeUpdated => refetching...");
            await refetch();
        }
    });

    useWatchContractEvent({
        address: chainFlipContractAddress,
        abi: CONTRACTS.chainFlip.abi,
        eventName: "TimeOutUpdated",
        onLogs: async () => {
            console.log("Event: TimeOutUpdated => refetching...");
            await refetch();
        }
    });

    // ---------------------------
    // Contract write functions
    // ---------------------------
    const handleSetFee = async () => {
        await writeContract({
            address: chainFlipContractAddress,
            abi: CONTRACTS.chainFlip.abi,
            functionName: "setFeePercent",
            args: [BigInt(feePercent)]
        });
    };

    const handleSetMinBet = async () => {
        await writeContract({
            address: chainFlipContractAddress,
            abi: CONTRACTS.chainFlip.abi,
            functionName: "setMinimumBetAmount",
            args: [BigInt(minBetAmount * 1e18)]
        });
    };

    const handleSetTimeout = async () => {
        await writeContract({
            address: chainFlipContractAddress,
            abi: CONTRACTS.chainFlip.abi,
            functionName: "setTimeOutForStuckMatches",
            args: [BigInt(timeout)]
        });
    };

    const handleWithdrawFees = async () => {
        if (isWithdrawDisabled) return;

        const toastId = toast.loading("Withdrawing fees...");

        // This call will trigger the MetaMask prompt. It returns void.
        writeContract(
            {
                address: chainFlipContractAddress,
                abi: CONTRACTS.chainFlip.abi,
                functionName: "withdrawFees",
                args: [
                    `0x${recipient.replace(/^0x/, "")}`,
                    BigInt(withdrawAmount * 1e18),
                ],
            },
            {
                onError(error: any) {
                    toast.dismiss(toastId);
                    toast.error(`Error withdrawing fees: ${error?.message || "Unknown error"}`);
                },
                onSettled() {
                    // Do not dismiss the toast here; wait for the FeesWithdrawn event.
                },
            }
        );
    };

    // If no collected fees, disable the withdraw
    const isWithdrawDisabled =
        !collectedFees?.result || collectedFees.result === BigInt(0);

    // ---------------------------
    // Render
    // ---------------------------
    return (
        <AdminDashboard
            currentFeePercent={currentFeePercent}
            betAmount={betAmount}
            collectedFees={collectedFees}
            feePercent={feePercent}
            setFeePercent={setFeePercent}
            handleSetFee={handleSetFee}
            minBetAmount={minBetAmount}
            setMinBetAmount={setMinBetAmount}
            handleSetMinBet={handleSetMinBet}
            timeout={timeout}
            setTimeout={setTimeout}
            handleSetTimeout={handleSetTimeout}
            recipient={recipient}
            setRecipient={setRecipient}
            withdrawAmount={withdrawAmount}
            setWithdrawAmount={setWithdrawAmount}
            handleWithdrawFees={handleWithdrawFees}
            isWithdrawDisabled={isWithdrawDisabled}
        />
    );
};

export default AdminPage;
