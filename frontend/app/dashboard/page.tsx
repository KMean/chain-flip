"use client";

import { useState, useEffect } from "react";
import {
    useAccount,
    useReadContracts,
    useWatchContractEvent,
    useWriteContract,
    useChainId,
} from "wagmi";
import { config } from "../../config/wagmi"; // Import your config
import { formatEther } from "viem";
import { CONTRACTS } from "../../config/contracts.config";
import FlipCoin from "@/components/FlipCoin";
import {
    PlayIcon,
    FaceFrownIcon,
    DocumentTextIcon,
    ChartBarIcon,
    XCircleIcon,
    TrophyIcon,
    XMarkIcon,
    ArrowPathIcon,
} from "@heroicons/react/24/outline";

import { toast } from 'react-hot-toast';

// ---- Data Model ----
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

interface PlayerStats {
    totalMatches: bigint;
    totalWins: bigint;
    totalLosses: bigint;
    totalCanceled: bigint;
    totalAmountWonByPlayer: bigint;
    totalAmountInvestedByPlayer: bigint;
}

interface MatchResult {
    result?: Partial<Match>;
}

const SepoliaChainId = 11155111;
const BnbTestnetChainId = 97;

export default function DashBoard() {
    const { address } = useAccount();
    const { writeContract } = useWriteContract();

    const [matches, setMatches] = useState<Match[]>([]);
    const [activeMatches, setActiveMatches] = useState<Match[]>([]);
    const [endedMatches, setEndedMatches] = useState<Match[]>([]);
    const [cancelingMatchId, setCancelingMatchId] = useState<bigint | null>(null);
    const [withdrawingRefund, setWithdrawingRefund] = useState(false);
    // Get chain ID
    const chainId = useChainId();

    // Choose the contract address based on chainId
    let chainFlipContractAddress;

    if (chainId === SepoliaChainId) {
        chainFlipContractAddress = CONTRACTS.chainFlip.sepolia;
    } else if (chainId === BnbTestnetChainId) {
        chainFlipContractAddress = CONTRACTS.chainFlip.bnbtestnet;
    } else {
        chainFlipContractAddress = CONTRACTS.chainFlip.amoy;
    }
    // Get native currency symbol
    const chain = config.chains.find((c) => c.id === chainId);
    const nativeCurrency = chain?.nativeCurrency?.symbol ?? "???";

    // ---------------------------
    // Read contract calls
    // ---------------------------
    const { data, refetch } = useReadContracts<[MatchResult, MatchResult, MatchResult]>({
        contracts: [
            {
                address: chainFlipContractAddress,
                abi: CONTRACTS.chainFlip.abi,
                functionName: "getMatchesByPlayer",
                args: address ? [address] : undefined,
            },
            {
                address: chainFlipContractAddress,
                abi: CONTRACTS.chainFlip.abi,
                functionName: "getPlayerStats",
                args: address ? [address] : undefined,
            },
            {
                address: chainFlipContractAddress,
                abi: CONTRACTS.chainFlip.abi,
                functionName: "getRefunds",
                args: address ? [address] : undefined,
            },
        ],
        query: { enabled: !!address },
    });

    // getMatchesByPlayer -> array of match IDs
    const matchIds = (data?.[0]?.result as bigint[] | undefined) || [];
    // Instead of directly casting as an array, we check the raw result for getPlayerStats.
    const rawStats = data?.[1]?.result;
    let stats: PlayerStats;
    if (rawStats) {
        if (Array.isArray(rawStats)) {
            // If the result is an array, use the expected order:
            stats = {
                totalMatches: rawStats[0] as bigint,
                totalWins: rawStats[1] as bigint,
                totalLosses: rawStats[2] as bigint,
                totalCanceled: rawStats[3] as bigint,
                totalAmountWonByPlayer: rawStats[4] as bigint,
                totalAmountInvestedByPlayer: rawStats[5] as bigint,
            };
        } else {
            // Otherwise, assume it is an object with named properties.
            stats = rawStats as PlayerStats;
        }
    } else {
        // Fallback if no stats are returned yet.
        stats = {
            totalMatches: BigInt(0),
            totalWins: BigInt(0),
            totalLosses: BigInt(0),
            totalCanceled: BigInt(0),
            totalAmountWonByPlayer: BigInt(0),
            totalAmountInvestedByPlayer: BigInt(0),
        };
    }

    // getRefunds -> single BigInt
    const refundAmount = (data?.[2]?.result as bigint | undefined) || BigInt(0);

    // ---------------------------
    // For each match ID, call getMatch
    // ---------------------------
    const matchContracts = matchIds.map((id) => ({
        address: chainFlipContractAddress,
        abi: CONTRACTS.chainFlip.abi,
        functionName: "getMatch",
        args: [id],
    }));

    const { data: matchesData, refetch: refetchMatches } = useReadContracts<MatchResult[]>({
        contracts: matchContracts,
        query: { enabled: matchIds.length > 0 },
    });

    // Convert each match result => `Match`
    useEffect(() => {
        if (!matchesData) return;
        if (!Array.isArray(matchesData)) return;

        const processed: Match[] = matchesData
            .map((entry) => {
                const partial = entry.result as Partial<Match>;
                if (partial && typeof partial.id === "bigint") {
                    return partial as Match;
                }
                return null;
            })
            .filter((m): m is Match => m !== null);

        setMatches(processed);
    }, [matchesData]);

    // ---------------------------
    // Separate active/ended
    // ---------------------------
    useEffect(() => {
        const active = matches.filter((m) => m.state === 0 || m.state === 1);
        const ended = matches.filter((m) => m.state === 2 || m.state === 3);
        setActiveMatches(active);
        setEndedMatches(ended);
    }, [matches]);

    // ---------------------------
    // Write functions
    // ---------------------------
    const handleCancelMatch = (matchId: bigint) => {
        toast.loading('Canceling match...');
        setCancelingMatchId(matchId);
        writeContract(
            {
                address: chainFlipContractAddress,
                abi: CONTRACTS.chainFlip.abi,
                functionName: "cancelMatch",
                args: [matchId],
            },
            {
                onError: () => {
                    toast.dismiss();
                    toast.error("Error canceling match.");
                },
                onSettled: () => {

                },
            }
        );
    };


    const handleWithdrawRefund = () => {
        toast.loading('Withdrawing refund...');
        setWithdrawingRefund(true);
        writeContract(
            {
                address: chainFlipContractAddress,
                abi: CONTRACTS.chainFlip.abi,
                functionName: "withdrawRefund",
                args: [],
            },
            {
                onError: () => {
                    toast.dismiss();
                    toast.error("Error withdrawing refund.");
                },
                onSettled: () => {

                },
            }
        );
    };

    // ----------------------------------------------------------------
    // Watch events
    // ----------------------------------------------------------------
    useWatchContractEvent({
        address: chainFlipContractAddress,
        abi: CONTRACTS.chainFlip.abi,
        eventName: "MatchCreated",
        onLogs: async () => {
            await refetch();
            await refetchMatches();
        },
    });

    useWatchContractEvent({
        address: chainFlipContractAddress,
        abi: CONTRACTS.chainFlip.abi,
        eventName: "MatchJoined",
        onLogs: async () => {
            await refetch();
            await refetchMatches();
        },
    });

    useWatchContractEvent({
        address: chainFlipContractAddress,
        abi: CONTRACTS.chainFlip.abi,
        eventName: "MatchEnded",
        onLogs: async () => {
            await refetch();
            await refetchMatches();
        },
    });

    useWatchContractEvent({
        address: chainFlipContractAddress,
        abi: CONTRACTS.chainFlip.abi,
        eventName: "MatchCanceledByPlayer",
        onLogs: async () => {
            toast.dismiss();
            toast.success("Match canceled successfully!");
            setCancelingMatchId(null);
            await refetch();
            await refetchMatches();
        },
    });

    useWatchContractEvent({
        address: chainFlipContractAddress,
        abi: CONTRACTS.chainFlip.abi,
        eventName: "RefundIssued",
        onLogs: async () => {
            toast.dismiss();
            toast.success("Refund withdrawn successfully!");
            setWithdrawingRefund(false);
            await refetch();
            await refetchMatches();
        },
    });

    // ----------------------------------------------------------------
    // Parse and label player stats
    // ----------------------------------------------------------------
    const totalMatches = Number(stats.totalMatches);
    const totalWins = Number(stats.totalWins);
    const totalLosses = Number(stats.totalLosses);
    const totalCanceled = Number(stats.totalCanceled);
    const totalAmountWon = stats.totalAmountWonByPlayer;
    const totalAmountInvested = stats.totalAmountInvestedByPlayer;

    // derived stats:
    const playableMatches = totalMatches - totalCanceled;
    const winPercentage = playableMatches > 0 ? ((totalWins / playableMatches) * 100).toFixed(1) : "0";
    const netGains = totalAmountWon - totalAmountInvested;

    // ----------------------------------------------------------------
    // Render UI
    // ----------------------------------------------------------------
    return (
        <div className="pt-40 relative min-h-screen bg-gradient-to-br from-blue-100 to-purple-900 dark:from-gray-900 dark:to-gray-900 overflow-hidden">
            {/* Glowing Background Layer */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 left-1/2 w-[600px] h-[600px] bg-purple-500 opacity-20 blur-[160px]" />
                <div className="absolute top-40 right-1/3 w-[400px] h-[400px] bg-blue-500 opacity-20 blur-[140px]" />
            </div>

            <div className="max-w-7xl mx-auto">
                {!address ? (
                    <div className="text-center p-8 rounded-xl bg-white dark:bg-gray-800 shadow-lg">
                        <p className="text-xl text-gray-600 dark:text-gray-300">
                            Connect your wallet to view matches
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Player Stats Section */}
                        <section className="mb-12">
                            <h2 className="text-2xl font-bold text-blue-600 dark:text-gray-200 mb-6 flex items-center">
                                <ChartBarIcon className="w-6 h-6 text-gray-700 mr-2" />
                                Player Stats
                            </h2>

                            <div className="w-full dark:bg-gray-900/20 bg-gray-900/50 p-6 rounded-lg shadow-md backdrop-blur-md">
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-10 gap-4 text-center">
                                    {/* Total Matches */}
                                    <div>
                                        <p className="text-sm dark:text-gray-400">Total Matches</p>
                                        <p className="text-2xl font-bold text-blue-500">{totalMatches}</p>
                                    </div>

                                    {/* Total Wins */}
                                    <div>
                                        <p className="text-sm dark:text-gray-400">Total Wins</p>
                                        <p className="text-2xl font-bold text-green-500">{totalWins}</p>
                                    </div>

                                    {/* Total Losses */}
                                    <div>
                                        <p className="text-sm dark:text-gray-400">Total Losses</p>
                                        <p className="text-2xl font-bold text-red-500">{totalLosses}</p>
                                    </div>

                                    {/* Total Canceled */}
                                    <div>
                                        <p className="text-sm dark:text-gray-400">Total Canceled</p>
                                        <p className="text-2xl font-bold text-yellow-500">{totalCanceled}</p>
                                    </div>

                                    {/* Win % */}
                                    <div>
                                        <p className="text-sm dark:text-gray-400">Win %</p>
                                        <p className="text-2xl font-bold text-yellow-400">{winPercentage}%</p>
                                    </div>

                                    {/* Win/Loss Ratio */}
                                    <div>
                                        <p className="text-sm dark:text-gray-400">Win/Loss Ratio</p>
                                        <p
                                            className={`text-2xl font-bold ${totalLosses === 0
                                                ? "text-gray-400"
                                                : totalWins / totalLosses > 1
                                                    ? "text-green-500"
                                                    : totalWins / totalLosses > 0.5
                                                        ? "text-yellow-400"
                                                        : "text-red-500"
                                                }`}
                                        >
                                            {totalLosses > 0 ? (totalWins / totalLosses).toFixed(2) : "∞"}
                                        </p>
                                    </div>

                                    {/* Total Invested */}
                                    <div>
                                        <p className="text-sm dark:text-gray-400">Total Invested</p>
                                        <p className="text-2xl font-bold text-blue-500">
                                            {formatEther(totalAmountInvested)}
                                            <span className="text-sm"> {nativeCurrency}</span>
                                        </p>
                                    </div>

                                    {/* Total Won */}
                                    <div>
                                        <p className="text-sm dark:text-gray-400">Total Won</p>
                                        <p className="text-2xl font-bold text-green-500">
                                            {formatEther(totalAmountWon)}
                                            <span className="text-sm"> {nativeCurrency}</span>
                                        </p>
                                    </div>

                                    {/* Net Gain/Loss */}
                                    <div>
                                        <p className="text-sm dark:text-gray-400">Net Gain/Loss</p>
                                        <p className={`text-2xl font-bold ${netGains > BigInt(0) ? "text-green-500" : "text-red-500"}`}>
                                            {parseFloat(formatEther(netGains)).toFixed(3)}
                                            <span className="text-sm"> {nativeCurrency}</span>
                                        </p>
                                    </div>

                                    {/* Refund Balance */}
                                    <div className="flex flex-col items-center justify-center">
                                        <p className="text-sm dark:text-gray-400">Refund Balance</p>
                                        <p className="text-2xl font-bold text-white">
                                            {formatEther(refundAmount)}
                                            <span className="text-sm"> {nativeCurrency}</span>
                                        </p>
                                        {refundAmount > BigInt(0) && (
                                            <button
                                                onClick={handleWithdrawRefund}
                                                disabled={withdrawingRefund}
                                                className="mt-3 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {withdrawingRefund ? (
                                                    <>
                                                        <ArrowPathIcon className="w-5 h-5 animate-spin" />
                                                        Withdrawing...
                                                    </>
                                                ) : (
                                                    <>
                                                        <ArrowPathIcon className="w-5 h-5" />
                                                        Withdraw
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Active Matches Section */}
                        <section className="mb-12">
                            <h2 className="text-2xl font-bold text-blue-600 dark:text-gray-200 mb-6 flex items-center">
                                <PlayIcon className="w-6 h-6 text-gray-700 mr-2" />
                                Active Matches
                            </h2>

                            {activeMatches.length === 0 ? (
                                <div className="text-center py-6 bg-white/10 dark:bg-gray-800 rounded-lg shadow-md">
                                    <p className="text-lg text-gray-600 dark:text-gray-300 font-medium">No active matches</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {activeMatches.map((match) => (
                                        <div key={match.id.toString()} className="relative group">
                                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
                                            <div className="relative rounded-xl bg-white/5 dark:bg-gray-800/80 p-6 shadow-lg hover:shadow-xl transition-shadow">
                                                <div className="flex justify-between items-start mb-4">
                                                    <span className="text-sm font-mono dark:text-blue-600 dark:text-blue-400">
                                                        #{match.id.toString()}
                                                    </span>
                                                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium">
                                                        {match.state === 0 ? "Waiting" : match.state === 1 ? "Flipping" : "Active"}
                                                    </span>
                                                </div>
                                                <div className="space-y-4">
                                                    {match.state === 1 && (
                                                        <div className="w-2 h-2 mx-auto">
                                                            <FlipCoin />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <label className="text-sm text-gray-500 dark:text-gray-400">Bet Amount</label>
                                                        <p className="text-xl font-bold text-gray-800 dark:text-gray-200">
                                                            {formatEther(match.betAmount)} {nativeCurrency}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <label className="text-sm text-gray-500 dark:text-gray-400">
                                                            {match.player1 === address ? "Opponent" : "Creator"}
                                                        </label>
                                                        <p className="font-medium text-gray-800 dark:text-gray-200 break-all">
                                                            {match.player1 === address
                                                                ? match.player2 === "0x0000000000000000000000000000000000000000"
                                                                    ? "Waiting for player..."
                                                                    : `${match.player2.slice(0, 6)}...${match.player2.slice(-4)}`
                                                                : match.player1}
                                                        </p>
                                                    </div>
                                                    {match.state === 0 && match.player1 === address && (
                                                        <button
                                                            onClick={() => handleCancelMatch(match.id)}
                                                            disabled={cancelingMatchId === match.id}
                                                            className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg font-medium transition-all transform hover:-translate-y-0.5 backdrop-blur-lg bg-opacity-30 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            {cancelingMatchId === match.id ? (
                                                                <>
                                                                    <XMarkIcon className="h-5 w-5 animate-spin" />
                                                                    Canceling match...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <XMarkIcon className="h-5 w-5" />
                                                                    Cancel
                                                                </>
                                                            )}
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
                            <h2 className="text-2xl font-bold text-blue-600 dark:text-gray-200 mb-6 flex items-center">
                                <DocumentTextIcon className="w-6 h-6 text-gray-700 mr-2" />
                                Match History
                            </h2>
                            <div className="relative max-h-[390px] overflow-y-auto no-scrollbar rounded-lg shadow-lg p-4">
                                {endedMatches.length === 0 ? (
                                    <div className="text-center p-4">
                                        <p className="text-lg text-gray-600 dark:text-gray-300">No match history available</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {endedMatches.slice().reverse().map((match) => {
                                            const won = match.winner === address;
                                            const isCanceled = match.state === 2;
                                            const icon = isCanceled ? (
                                                <XCircleIcon className="w-6 h-6 text-yellow-500" />
                                            ) : won ? (
                                                <TrophyIcon className="w-6 h-6 text-green-500" />
                                            ) : (
                                                <FaceFrownIcon className="w-6 h-6 text-red-500" />
                                            );
                                            const statusText = isCanceled ? "Canceled" : won ? "Victory" : "Defeat";

                                            return (
                                                <div
                                                    key={match.id.toString()}
                                                    className={`rounded-xl p-6 ${won
                                                        ? "bg-green-500/5 dark:bg-gray-500/30 border border-gray-600 dark:border dark:border-gray-500 backdrop-blur-lg"
                                                        : isCanceled
                                                            ? "bg-yellow-500/5 border border-gray-600 dark:bg-gray-500/30 dark:border dark:border-gray-500 backdrop-blur-lg"
                                                            : "bg-red-500/5 border border-gray-600 dark:border dark:border-gray-500 dark:bg-gray-500/30 backdrop-blur-lg"
                                                        } transition-transform hover:scale-[1.02]`}
                                                >
                                                    <div className="flex justify-between items-start mb-4">
                                                        <span className="text-2xl">{icon}</span>
                                                        <span
                                                            className={`px-3 py-1 rounded-full text-xs font-medium ${isCanceled
                                                                ? "bg-yellow-500/30 dark:bg-yellow-500/40 text-yellow-900 dark:text-yellow-200"
                                                                : won
                                                                    ? "bg-green-500/30 dark:bg-green-500/40 text-green-900 dark:text-green-200"
                                                                    : "bg-red-500/30 dark:bg-red-500/40 text-red-900 dark:text-red-200"
                                                                }`}
                                                        >
                                                            {statusText}
                                                        </span>
                                                    </div>
                                                    <div className="space-y-3">
                                                        <div>
                                                            <p className="text-sm text-gray-600 dark:text-gray-300">Bet Amount</p>
                                                            <p className="font-semibold text-gray-800 dark:text-gray-200">
                                                                {formatEther(match.betAmount)} {nativeCurrency}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-gray-600 dark:text-gray-300">Result</p>
                                                            <p className="font-medium text-gray-800 dark:text-gray-200">
                                                                {match.result ? "Heads" : "Tails"}
                                                            </p>
                                                        </div>
                                                        <div className="border-t border-black dark:border-gray-700 pt-3">
                                                            <p className="text-sm text-gray-900 dark:text-gray-400 mt-2">
                                                                <span className="block">
                                                                    <strong>Start time:</strong>{" "}
                                                                    {new Date(Number(match.startTime) * 1000).toLocaleString("en-US", {
                                                                        year: "numeric",
                                                                        month: "short",
                                                                        day: "numeric",
                                                                        hour: "2-digit",
                                                                        minute: "2-digit",
                                                                    })}
                                                                </span>
                                                                <span className="block">
                                                                    <strong>End time:</strong>{" "}
                                                                    {new Date(Number(match.endTime) * 1000).toLocaleString("en-US", {
                                                                        year: "numeric",
                                                                        month: "short",
                                                                        day: "numeric",
                                                                        hour: "2-digit",
                                                                        minute: "2-digit",
                                                                    })}
                                                                </span>
                                                            </p>
                                                            <p className="text-sm text-black dark:text-blue-400 flex justify-end">
                                                                #{match.id.toString()}
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
