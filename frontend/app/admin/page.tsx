"use client";
import React, { useState } from "react";
import {
    useWriteContract,
    useReadContracts,
    useWatchContractEvent
} from "wagmi";
import { CONTRACTS } from "@/config/contracts.config";
import AdminDashboard from "@/components/AdminDashboard";

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

    // Reading from multiple contract functions
    const { data, refetch } = useReadContracts({
        contracts: [
            {
                address: CONTRACTS.chainFlip.address,
                abi: CONTRACTS.chainFlip.abi,
                functionName: "getCollectedFees"
            },
            {
                address: CONTRACTS.chainFlip.address,
                abi: CONTRACTS.chainFlip.abi,
                functionName: "getCurrentMatchId"
            },
            {
                address: CONTRACTS.chainFlip.address,
                abi: CONTRACTS.chainFlip.abi,
                functionName: "getFeePercent"
            },
            {
                address: CONTRACTS.chainFlip.address,
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
    // 1) Watch for each event at top-level
    // ---------------------------
    useWatchContractEvent({
        address: CONTRACTS.chainFlip.address,
        abi: CONTRACTS.chainFlip.abi,
        eventName: "FeesWithdrawn",
        onLogs: async () => {
            console.log("Event: FeesWithdrawn => refetching...");
            await refetch();
        }
    });

    useWatchContractEvent({
        address: CONTRACTS.chainFlip.address,
        abi: CONTRACTS.chainFlip.abi,
        eventName: "MinimumBetAmountUpdated",
        onLogs: async () => {
            console.log("Event: MinimumBetAmountUpdated => refetching...");
            await refetch();
        }
    });

    useWatchContractEvent({
        address: CONTRACTS.chainFlip.address,
        abi: CONTRACTS.chainFlip.abi,
        eventName: "FeeUpdated",
        onLogs: async () => {
            console.log("Event: FeeUpdated => refetching...");
            await refetch();
        }
    });

    useWatchContractEvent({
        address: CONTRACTS.chainFlip.address,
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
            address: CONTRACTS.chainFlip.address,
            abi: CONTRACTS.chainFlip.abi,
            functionName: "setFeePercent",
            args: [BigInt(feePercent)]
        });
    };

    const handleSetMinBet = async () => {
        await writeContract({
            address: CONTRACTS.chainFlip.address,
            abi: CONTRACTS.chainFlip.abi,
            functionName: "setMinimumBetAmount",
            args: [BigInt(minBetAmount * 1e18)]
        });
    };

    const handleSetTimeout = async () => {
        await writeContract({
            address: CONTRACTS.chainFlip.address,
            abi: CONTRACTS.chainFlip.abi,
            functionName: "setTimeOutForStuckMatches",
            args: [BigInt(timeout)]
        });
    };

    const handleWithdrawFees = async () => {
        if (isWithdrawDisabled) return;
        await writeContract({
            address: CONTRACTS.chainFlip.address,
            abi: CONTRACTS.chainFlip.abi,
            functionName: "withdrawFees",
            args: [
                `0x${recipient.replace(/^0x/, "")}`,
                BigInt(withdrawAmount * 1e18)
            ]
        });
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
