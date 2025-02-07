'use client';
import React, { useState, useEffect } from 'react';
import { useAccount, useReadContracts, useWatchContractEvent, useWriteContract } from 'wagmi';
import { formatEther, parseEther } from 'viem';
import { CONTRACTS } from '@/config/contracts.config';
import FlipCoin from '@/components/FlipCoin'; // Import the FlipCoin component
import { PlayIcon, FaceFrownIcon, DocumentTextIcon, ChartBarIcon, XCircleIcon, TrophyIcon, XMarkIcon, ArrowPathIcon } from '@heroicons/react/24/outline';



interface Match {
    id: bigint;
    state: number;
    player1: string;
    player2: string;
    betAmount: bigint;
    winner: string;
    result: boolean;
    startTime: bigint;
    endTime: bigint;
    player1Choice: boolean;
    player2Choice: boolean;
}

export default function MyGames() {
    const { address } = useAccount();
    const { writeContract } = useWriteContract();
    const [matches, setMatches] = useState<Match[]>([]);
    const [activeMatches, setActiveMatches] = useState<Match[]>([]);
    const [endedMatches, setEndedMatches] = useState<Match[]>([]);

    // Fetch all necessary data in one batch
    const { data, refetch } = useReadContracts({
        contracts: [
            {
                address: CONTRACTS.chainFlip.address,
                abi: CONTRACTS.chainFlip.abi,
                functionName: 'getMatchesByPlayer',
                args: address ? [address] : undefined,
            },
            {
                address: CONTRACTS.chainFlip.address,
                abi: CONTRACTS.chainFlip.abi,
                functionName: 'getPlayerStats',
                args: address ? [address] : undefined,
            },
            {
                address: CONTRACTS.chainFlip.address,
                abi: CONTRACTS.chainFlip.abi,
                functionName: 'getRefunds',
                args: address ? [address] : undefined,
            },
        ],
        query: { enabled: !!address },
    });

    // Extract contract results
    const matchIds = data?.[0]?.result || [];
    const playerStats = data?.[1]?.result || [BigInt(0), BigInt(0)];
    const refundAmount = data?.[2]?.result || BigInt(0);

    // Fetch match details
    const matchContracts = matchIds.map((id: bigint) => ({
        address: CONTRACTS.chainFlip.address,
        abi: CONTRACTS.chainFlip.abi,
        functionName: 'getMatch',
        args: [id],
    }));

    const { data: matchesData, refetch: refetchMatches } = useReadContracts({
        contracts: matchContracts,
        query: { enabled: matchIds.length > 0 },
    });

    // Ensure state updates when matchesData changes
    useEffect(() => {
        if (matchesData && Array.isArray(matchesData)) {
            const processed: Match[] = matchesData
                .map((entry) => {
                    if (entry?.result && typeof entry.result === "object" && "id" in entry.result) {
                        return entry.result as Match;
                    }
                    return null;
                })
                .filter((match): match is Match => match !== null); // Type assertion

            setMatches(processed);
        }
    }, [matchesData]);



    // Categorize matches
    useEffect(() => {
        const active = matches.filter(m => m.state === 0 || m.state === 1);
        const ended = matches.filter(m => m.state === 2 || m.state === 3);
        setActiveMatches(active);
        setEndedMatches(ended);
    }, [matches]);

    // Function to handle match cancellation
    const handleCancelMatch = (matchId: bigint) => {
        writeContract({
            address: CONTRACTS.chainFlip.address,
            abi: CONTRACTS.chainFlip.abi,
            functionName: 'cancelMatch',
            args: [matchId],
        });
    };

    // Function to withdraw refunds
    const handleWithdrawRefund = () => {
        writeContract({
            address: CONTRACTS.chainFlip.address,
            abi: CONTRACTS.chainFlip.abi,
            functionName: 'withdrawRefund',
            args: [],
        });
    };

    //**Ensure Events Correctly Trigger Refetch**
    const eventsToWatch = [
        'MatchCreated',
        'MatchJoined',
        'MatchEnded',
        'MatchCanceledByPlayer',
        'RefundIssued'
    ] as const;

    eventsToWatch.forEach((event) => {
        useWatchContractEvent({
            address: CONTRACTS.chainFlip.address,
            abi: CONTRACTS.chainFlip.abi,
            eventName: event,
            onLogs: async () => {
                console.log(`Event ${event} detected, refetching matches...`);
                await refetch();
                await refetchMatches();
            },
        });
    });

    return (
        <div className="min-h-screen pt-40 p-8 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-900">
            {/* Glowing Background Layer */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 left-1/2 w-[600px] h-[600px] bg-purple-500 opacity-20 blur-[160px]"></div>
                <div className="absolute top-40 right-1/3 w-[400px] h-[400px] bg-blue-500 opacity-20 blur-[140px]"></div>
            </div>
            <div className="max-w-7xl mx-auto">
                {!address ? (
                    <div className="text-center p-8 rounded-xl bg-white dark:bg-gray-800 shadow-lg">
                        <p className="text-xl text-gray-600 dark:text-gray-300">
                            Connect your wallet to view your matches
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Player Stats Section */}
                        <section className="mb-12">
                            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6 flex items-center">
                                <ChartBarIcon className="w-6 h-6 text-gray-700 mr-2" /> Player Stats
                            </h2>

                            <div className="w-full bg-gray-900/20 p-6 rounded-lg shadow-md backdrop-blur-md">
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-10 gap-6 text-center">
                                    {/* Total Matches */}
                                    <div>
                                        <p className="text-sm text-gray-400">Total Matches</p>
                                        <p className="text-2xl font-bold text-blue-500">
                                            {playerStats?.[0]?.toString() ?? "0"}
                                        </p>
                                    </div>

                                    {/* Total Wins */}
                                    <div>
                                        <p className="text-sm text-gray-400">Total Wins</p>
                                        <p className="text-2xl font-bold text-green-500">
                                            {playerStats?.[1]?.toString() ?? "0"}
                                        </p>
                                    </div>

                                    {/* Total Losses */}
                                    <div>
                                        <p className="text-sm text-gray-400">Total Losses</p>
                                        <p className="text-2xl font-bold text-red-500">
                                            {playerStats?.[2]?.toString() ?? "0"}
                                        </p>
                                    </div>

                                    {/* Total Canceled */}
                                    <div>
                                        <p className="text-sm text-gray-400">Total Canceled</p>
                                        <p className="text-2xl font-bold text-yellow-500">
                                            {playerStats?.[3]?.toString() ?? "0"}
                                        </p>
                                    </div>

                                    {/* Win Percentage */}
                                    <div>
                                        <p className="text-sm text-gray-400">Win %</p>
                                        <p className="text-2xl font-bold text-yellow-400">
                                            {playerStats?.[0] && playerStats[0] > BigInt(0)
                                                ? ((Number(playerStats[1]) / Number(playerStats[0])) * 100).toFixed(1)
                                                : "0"}%
                                        </p>
                                    </div>

                                    {/* Win/Loss Ratio */}
                                    <div>
                                        <p className="text-sm text-gray-400">Win/Loss Ratio</p>
                                        <p className={`text-2xl font-bold 
                    ${playerStats?.[2] === BigInt(0)
                                                ? 'text-gray-400' // No losses yet
                                                : Number(playerStats?.[1] ?? 0) / (Number(playerStats?.[2] ?? 1)) > 1
                                                    ? 'text-green-500' // More wins than losses (Good)
                                                    : Number(playerStats?.[1] ?? 0) / (Number(playerStats?.[2] ?? 1)) > 0.5
                                                        ? 'text-yellow-400' // Balanced
                                                        : 'text-red-500' // More losses than wins
                                            }`}>
                                            {playerStats?.[2] && playerStats[2] > BigInt(0)
                                                ? (Number(playerStats[1]) / (Number(playerStats[2]) || 1)).toFixed(2)
                                                : "∞"}
                                        </p>
                                    </div>

                                    {/* Total Invested */}
                                    <div>
                                        <p className="text-sm text-gray-400">Total Invested</p>
                                        <p className="text-2xl font-bold text-blue-500">
                                            {formatEther(playerStats?.[5] ?? BigInt(0))}<span className="text-sm"> POL</span>
                                        </p>
                                    </div>

                                    {/* Total Won */}
                                    <div>
                                        <p className="text-sm text-gray-400">Total Won</p>
                                        <p className="text-2xl font-bold text-green-500">
                                            {formatEther(playerStats?.[4] ?? BigInt(0))}<span className="text-sm"> POL</span>
                                        </p>
                                    </div>

                                    {/* Total Gain/Loss */}
                                    <div>
                                        <p className="text-sm text-gray-400">Total Gain/Loss</p>
                                        <p className={`text-2xl font-bold ${(playerStats?.[4] ?? BigInt(0)) > (playerStats?.[5] ?? BigInt(0)) ? 'text-green-500' : 'text-red-500'}`}>
                                            {parseFloat(formatEther((playerStats?.[4] ?? BigInt(0)) - (playerStats?.[5] ?? BigInt(0)))).toFixed(2)}<span className="text-sm"> POL</span>
                                        </p>
                                    </div>


                                    {/* Refund Balance */}
                                    <div className="flex flex-col sm:items-center sm:justify-center md:col-span-6 lg:col-span-1 ">
                                        <p className="text-sm text-gray-400">Refund Balance</p>
                                        <p className="text-2xl font-bold text-white">
                                            {formatEther(refundAmount)}<span className="text-sm"> POL</span>
                                        </p>
                                        {refundAmount > BigInt(0) && (
                                            <button
                                                onClick={handleWithdrawRefund}
                                                className="mt-3 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <ArrowPathIcon className="w-5 h-5" />
                                                Withdraw
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>


                        {/* Active Matches Section */}
                        <section className="mb-12">
                            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6 flex items-center">
                                <PlayIcon className="w-6 h-6 text-gray-700 mr-2" /> Active Matches
                            </h2>

                            {activeMatches.length === 0 ? (
                                //  Show this when there are no active matches
                                <div className="text-center py-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                                    <p className="text-lg text-gray-600 dark:text-gray-300 font-medium">
                                        You Don't Have Active Matches
                                    </p>
                                </div>
                            ) : (
                                // Render active matches if available
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {activeMatches.map((match) => (
                                        <div key={match.id.toString()} className="relative group">
                                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
                                            <div className="relative rounded-xl bg-white dark:bg-gray-800 p-6 shadow-lg hover:shadow-xl transition-shadow">
                                                <div className="flex justify-between items-start mb-4">
                                                    <span className="text-sm font-mono text-blue-600 dark:text-blue-400">
                                                        #{match.id.toString()}
                                                    </span>
                                                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium">
                                                        {match.state === 0 ? 'Waiting' : match.state === 1 ? 'Flipping' : 'Active'}
                                                    </span>
                                                </div>
                                                <div className="space-y-4">
                                                    {match.state === 1 && (
                                                        <div className="w-2 h-2 mx-auto"> {/* Coin FLipping Animation*/}
                                                            <FlipCoin />
                                                        </div>
                                                    )}

                                                    <div>
                                                        <label className="text-sm text-gray-500 dark:text-gray-400">Bet Amount</label>
                                                        <p className="text-xl font-bold text-gray-800 dark:text-gray-200">
                                                            {formatEther(match.betAmount)} ETH
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <label className="text-sm text-gray-500 dark:text-gray-400">
                                                            {match.player1 === address ? 'Opponent' : 'Creator'}
                                                        </label>
                                                        <p className="font-medium text-gray-800 dark:text-gray-200 break-all">
                                                            {match.player1 === address
                                                                ? match.player2 === "0x0000000000000000000000000000000000000000"
                                                                    ? "Waiting for player..."
                                                                    : `${match.player1.slice(0, 6)}...${match.player1.slice(-4)}`
                                                                : match.player1}
                                                        </p>
                                                    </div>
                                                    {match.state === 0 && (
                                                        <button
                                                            onClick={() => handleCancelMatch(match.id)}
                                                            className="w-full flex items-center justify-center gap-2 px-4 py-3 
                                                                   bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 
                                                                   text-white rounded-lg font-medium transition-all transform hover:-translate-y-0.5 
                                                                   backdrop-blur-lg bg-opacity-30"
                                                        >
                                                            <XMarkIcon className="h-5 w-5" />
                                                            Cancel Match
                                                        </button>

                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>


                        {/* Match History Section */}
                        <section className="mb-12">
                            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6 flex items-center">
                                <DocumentTextIcon className="w-6 h-6 text-gray-700 mr-2" /> Match History
                            </h2>

                            {/* Scrollable Match History */}
                            <div className="relative max-h-[390px] overflow-y-auto rounded-lg shadow-lg p-4">

                                {endedMatches.length === 0 ? (
                                    <div className="text-center p-4">
                                        <p className="text-lg text-gray-600 dark:text-gray-300">No match history available</p>
                                    </div>
                                ) : (

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

                                        {endedMatches.map((match) => {
                                            const won = match.winner === address;
                                            const isCanceled = match.state === 2;
                                            const icon = isCanceled ? <XCircleIcon className="w-6 h-6 text-yellow-500" /> :
                                                won ? <TrophyIcon className="w-6 h-6 text-green-500" /> :
                                                    <FaceFrownIcon className="w-6 h-6 text-red-500" />;
                                            const statusText = isCanceled ? 'Canceled' : won ? 'Victory' : 'Defeat';

                                            return (
                                                <div key={match.id.toString()}
                                                    className={`rounded-xl p-6 
                                                            ${won ? 'bg-green-500/20 dark:bg-gray-500/30 backdrop-blur-lg' : isCanceled ? 'bg-yellow-500/20 dark:bg-gray-500/30 backdrop-blur-lg' : 'bg-red-500/20 dark:bg-gray-500/30 backdrop-blur-lg'}
                                                            transition-transform hover:scale-[1.02]`}
                                                >
                                                    <div className="flex justify-between items-start mb-4">

                                                        <span className="text-2xl">{icon}</span>
                                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${isCanceled ? 'bg-yellow-500/30 dark:bg-yellow-500/40 text-yellow-900 dark:text-yellow-200' : won ? 'bg-green-500/30 dark:bg-green-500/40 text-green-900 dark:text-green-200' : 'bg-red-500/30 dark:bg-red-500/40 text-red-900 dark:text-red-200'}`}>
                                                            {statusText}
                                                        </span>
                                                    </div>
                                                    <div className="space-y-3">
                                                        <div>
                                                            <p className="text-sm text-gray-600 dark:text-gray-300">Bet Amount</p>
                                                            <p className="font-semibold text-gray-800 dark:text-gray-200">
                                                                {formatEther(match.betAmount)} ETH
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-gray-600 dark:text-gray-300">Result</p>
                                                            <p className="font-medium text-gray-800 dark:text-gray-200">
                                                                {match.result ? 'Heads' : 'Tails'}
                                                            </p>
                                                        </div>
                                                        <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                                                <span className="block">
                                                                    <strong>Start time:</strong>{' '}
                                                                    {new Date(Number(match.startTime) * 1000).toLocaleString('en-US', {
                                                                        year: 'numeric',
                                                                        month: 'short',
                                                                        day: 'numeric',
                                                                        hour: '2-digit',
                                                                        minute: '2-digit',
                                                                    })}
                                                                </span>
                                                                <span className="block">
                                                                    <strong>End time:</strong>{' '}
                                                                    {new Date(Number(match.endTime) * 1000).toLocaleString('en-US', {
                                                                        year: 'numeric',
                                                                        month: 'short',
                                                                        day: 'numeric',
                                                                        hour: '2-digit',
                                                                        minute: '2-digit',
                                                                    })}
                                                                </span>
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </section>





                        {address && matches.length === 0 && (
                            <div className="text-center p-8 rounded-xl bg-white dark:bg-gray-800 shadow-lg">
                                <p className="text-gray-500 dark:text-gray-400">No matches found</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}