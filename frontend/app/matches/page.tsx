'use client';
import React, { useEffect, useState } from 'react';
import { useAccount, useWriteContract, useReadContracts, useReadContract, useWatchContractEvent } from 'wagmi';
import { parseEther } from 'viem';
import MatchCard, { Match } from '@/components/MatchCard';
import { CONTRACTS } from '../../config/contracts.config';
import { ArrowPathIcon, PlusIcon, FaceFrownIcon } from '@heroicons/react/24/outline';

const Matches = () => {
    const { address } = useAccount();
    const { writeContract } = useWriteContract();
    const [activeMatches, setActiveMatches] = useState<Match[]>([]);
    const [endedMatches, setEndedMatches] = useState<Match[]>([]);
    const [joiningMatchId, setJoiningMatchId] = useState<bigint | null>(null);
    const [pendingJoins, setPendingJoins] = useState<bigint[]>([]);
    const [creatingMatch, setCreatingMatch] = useState(false);
    const [choice, setChoice] = useState<boolean>(true);
    const [betAmount, setBetAmount] = useState<number>(0.1);

    // Fetch all matches (active + ended)
    const { data: allMatchesData, refetch: refetchMatches } = useReadContract({
        address: CONTRACTS.chainFlip.address,
        abi: CONTRACTS.chainFlip.abi,
        functionName: 'getMatchesPaginated',
        args: [BigInt(0), BigInt(50)],  // Fetch the first 50 matches
    });


    const {
        data,
    } = useReadContracts({
        contracts: [
            {
                address: CONTRACTS.chainFlip.address,
                abi: CONTRACTS.chainFlip.abi,
                functionName: 'getCollectedFees',
            },
            {
                address: CONTRACTS.chainFlip.address,
                abi: CONTRACTS.chainFlip.abi,
                functionName: 'getCurrentMatchId',
            },
            {
                address: CONTRACTS.chainFlip.address,
                abi: CONTRACTS.chainFlip.abi,
                functionName: 'getFeePercent',
            },
        ],
    });

    const feePercent = data?.[2]?.result;

    useEffect(() => {
        if (allMatchesData) {
            const matches = allMatchesData as unknown as Match[];

            // Separate Active and Ended Matches
            const active = matches.filter(match => Number(match.state) === 0 || Number(match.state) === 1);  // WAITING_FOR_PLAYER or FLIPPING_COIN
            const ended = matches.filter(match => Number(match.state) === 3 || Number(match.state) === 2);   // ENDED or CANCELED

            setActiveMatches(active);
            setEndedMatches(ended);
        }
    }, [allMatchesData]);


    const handleCreateMatch = () => {
        setCreatingMatch(true);
        writeContract(
            {
                address: CONTRACTS.chainFlip.address,
                abi: CONTRACTS.chainFlip.abi,
                functionName: 'createMatch',
                args: [choice],
                value: parseEther(betAmount.toString()),
            },
            {
                onSettled: () => {
                    setCreatingMatch(false); // Reset after transaction completes
                },
            }
        );
    };


    const handleJoinMatch = (matchId: bigint) => {
        setJoiningMatchId(matchId);
        setPendingJoins((prev) => [...prev, matchId]); // Add to pending list
        writeContract(
            {
                address: CONTRACTS.chainFlip.address,
                abi: CONTRACTS.chainFlip.abi,
                functionName: 'joinMatch',
                args: [matchId],
                value: activeMatches.find((m) => m.id === matchId)?.betAmount || BigInt(0),
            },
            {
                onSettled: () => {
                    setJoiningMatchId(null); // Reset after transaction completes
                },
                onError: () => {
                    setPendingJoins((prev) => prev.filter((id) => id !== matchId)); // Remove from pending if rejected
                },
            }
        );
    };



    useWatchContractEvent({
        address: CONTRACTS.chainFlip.address,
        abi: CONTRACTS.chainFlip.abi,
        eventName: 'MatchCreated',
        onLogs: async () => {
            console.log('MatchCreated event detected, refetching matches...');
            await refetchMatches();
        },
    });

    useWatchContractEvent({
        address: CONTRACTS.chainFlip.address,
        abi: CONTRACTS.chainFlip.abi,
        eventName: 'MatchJoined',
        onLogs: async (logs) => {
            console.log('MatchJoined event detected, refetching matches...');
            logs.forEach((log) => {
                const joinedMatchId = log.args?.matchId; // Extract matchId from event
                if (joinedMatchId) {
                    setPendingJoins((prev) => prev.filter((id) => id !== joinedMatchId)); // Remove from pending list
                }
            });
            await refetchMatches();
        },
    });

    useWatchContractEvent({
        address: CONTRACTS.chainFlip.address,
        abi: CONTRACTS.chainFlip.abi,
        eventName: 'MatchEnded',
        onLogs: async () => {
            console.log('MatchEnded event detected, refetching matches...');
            await refetchMatches();
        },
    });

    useWatchContractEvent({
        address: CONTRACTS.chainFlip.address,
        abi: CONTRACTS.chainFlip.abi,
        eventName: 'MatchCanceledByPlayer',
        onLogs: async () => {
            console.log('MatchCanceledByPlayer event detected, refetching matches...');
            await refetchMatches();
        },
    });

    return (
        <div className="relative min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-900 overflow-hidden">
            {/* Glowing Background Layer */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 left-1/2 w-[600px] h-[600px] bg-purple-500 opacity-20 blur-[160px]"></div>
                <div className="absolute top-40 right-1/3 w-[400px] h-[400px] bg-blue-500 opacity-20 blur-[140px]"></div>
            </div>

            {/* Content Container with Frosted Glass Effect */}
            <div className="pt-40 w-full bg-gray-900/20 p-6 rounded-lg shadow-md backdrop-blur-md">

                {/* Match Creation Section */}
                <div className="w-full flex flex-col items-center bg-gray-900/20 p-3 rounded-lg shadow-md backdrop-blur-md mb-8">

                    <div className="flex flex-wrap lg:flex-nowrap justify-center gap-4 w-full max-w-2xl">
                        {/* Bet Amount Input */}
                        <input
                            type="number"
                            min="0.1"
                            step="0.01"
                            value={betAmount}
                            onChange={(e) => setBetAmount(parseFloat(e.target.value))}
                            className="flex-1 px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none w-full lg:w-auto"
                            placeholder="Bet Amount (POL)"
                        />

                        {/* Choice Selector */}
                        <select
                            value={choice ? 'heads' : 'tails'}
                            onChange={(e) => setChoice(e.target.value === 'heads')}
                            className="flex-1 px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-600 focus:ring-2 focus:ring-purple-500 focus:outline-none w-full lg:w-auto"
                        >
                            <option value="heads">Heads</option>
                            <option value="tails">Tails</option>
                        </select>

                        {/* Create Match Button */}
                        <button
                            onClick={handleCreateMatch}
                            disabled={creatingMatch}
                            className="w-full lg:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {creatingMatch ? (
                                <ArrowPathIcon className="w-5 h-5 animate-spin" />
                            ) : (
                                <PlusIcon className="w-5 h-5" />
                            )}
                            {creatingMatch ? 'Creating Match...' : `New Match (${betAmount} POL)`}
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-white">
                        Active Matches
                        <span className="ml-2 text-blue-500">{activeMatches.length}</span>
                    </h2>

                </div>
                {/* Active Matches */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {activeMatches.length > 0 ? activeMatches.map((match, index) => (
                        <MatchCard
                            key={index}
                            match={match}
                            onJoin={handleJoinMatch}
                            isJoining={joiningMatchId === match.id}
                            disableJoin={match.player1 === address}
                            feePercent={feePercent}
                            pendingJoins={pendingJoins}
                        />
                    )) : (
                        <div className="text-center col-span-full">
                            <FaceFrownIcon className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500" />
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-2">
                                No active matches found
                            </h3>
                        </div>
                    )}
                </div>

                {/* Ended Matches (Scrollable) */}
                <div className="mt-16">
                    <h2 className="text-2xl font-bold text-white">Ended matches
                        <span className="ml-2 text-blue-500">{endedMatches.length}</span>
                    </h2>
                    <div className="max-h-[400px] overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-6 p-4 rounded-xl">
                        {endedMatches.map((match, index) => (
                            <MatchCard key={index} match={match} onJoin={() => { }} isJoining={false} disableJoin={true} feePercent={feePercent} />
                        ))}
                    </div>
                </div>
            </div>
        </div >
    );

};

export default Matches;
