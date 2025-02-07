'use client';
import React, { useState } from 'react';
import { useWriteContract, useReadContracts, useWatchContractEvent } from 'wagmi';
import { CONTRACTS } from '@/config/contracts.config';
import AdminDashboard from '@/components/AdminDashboard';

const AdminPage = () => {
    const { writeContract } = useWriteContract();
    const [feePercent, setFeePercent] = useState(5);
    const [minBetAmount, setMinBetAmount] = useState(0.01);
    const [timeout, setTimeout] = useState(60);
    const [recipient, setRecipient] = useState('');
    const [withdrawAmount, setWithdrawAmount] = useState(0);



    const {
        data,
        refetch, //Refetch function to update values when events trigger
    } = useReadContracts({
        contracts: [
            { address: CONTRACTS.chainFlip.address, abi: CONTRACTS.chainFlip.abi, functionName: 'getCollectedFees' },
            { address: CONTRACTS.chainFlip.address, abi: CONTRACTS.chainFlip.abi, functionName: 'getCurrentMatchId' },
            { address: CONTRACTS.chainFlip.address, abi: CONTRACTS.chainFlip.abi, functionName: 'getFeePercent' },
            { address: CONTRACTS.chainFlip.address, abi: CONTRACTS.chainFlip.abi, functionName: 'getMinimumBetAmount' },
        ] as const,
    });

    interface ContractResult { result?: bigint; }
    const collectedFees = data?.[0] as ContractResult;
    const currentFeePercent = data?.[2] as ContractResult;
    const betAmount = data?.[3] as ContractResult;

    // Automatically refetch when contract events trigger
    const watchedEvents = [
        'FeesWithdrawn',
        'MinimumBetAmountUpdated',
        'FeeUpdated',
        'TimeOutUpdated'
    ] as const;

    watchedEvents.forEach((event) => {
        useWatchContractEvent({
            address: CONTRACTS.chainFlip.address,
            abi: CONTRACTS.chainFlip.abi,
            eventName: event,
            onLogs: async () => {
                console.log(`Event ${event} detected, updating data...`);
                await refetch();
            },
        });
    });


    const handleSetFee = async () => {
        await writeContract({
            address: CONTRACTS.chainFlip.address,
            abi: CONTRACTS.chainFlip.abi,
            functionName: 'setFeePercent',
            args: [BigInt(feePercent)],
        });
    };

    const handleSetMinBet = async () => {
        await writeContract({
            address: CONTRACTS.chainFlip.address,
            abi: CONTRACTS.chainFlip.abi,
            functionName: 'setMinimumBetAmount',
            args: [BigInt(minBetAmount * 1e18)],
        });
    };

    const handleSetTimeout = async () => {
        await writeContract({
            address: CONTRACTS.chainFlip.address,
            abi: CONTRACTS.chainFlip.abi,
            functionName: 'setTimeOutForStuckMatches',
            args: [BigInt(timeout)],
        });
    };

    const handleWithdrawFees = async () => {
        if (isWithdrawDisabled) return;
        await writeContract({
            address: CONTRACTS.chainFlip.address,
            abi: CONTRACTS.chainFlip.abi,
            functionName: 'withdrawFees',
            args: [`0x${recipient.replace(/^0x/, '')}`, BigInt(withdrawAmount * 1e18)],
        });
    };

    const isWithdrawDisabled = !collectedFees?.result || collectedFees.result === BigInt(0);


    return (
        console.log('collected fees', collectedFees),
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
