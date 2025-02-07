'use client';
import { useState, useEffect } from 'react';
import { useAccount, useReadContracts, useWatchContractEvent, useWriteContract } from 'wagmi';
import { formatEther } from 'viem';
import { CONTRACTS } from '@/contracts.config';

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

    const { data: matchesData } = useReadContracts({
        contracts: matchContracts,
        query: { enabled: matchIds.length > 0 },
    });

    // Listen for match-related events and refetch data dynamically
    (['MatchCreated', 'MatchJoined', 'MatchEnded', 'MatchCanceledByPlayer'] as const).forEach(event =>
        useWatchContractEvent({
            address: CONTRACTS.chainFlip.address,
            abi: CONTRACTS.chainFlip.abi,
            eventName: event,
            onLogs: () => refetch(),
        })
    );

    // Process match data
    useEffect(() => {
        if (matchesData) {
            const processed = matchesData
                .map((result: any) => result.result)
                .filter(Boolean) as Match[];
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

    return (
        <div className="min-h-screen pt-40 p-8 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <h2 className="text-2xl font-semibold mb-4">Active Matches</h2>
            {!address ? (
                <p className="text-center">Connect your wallet to view matches</p>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                        {activeMatches.map((match) => (
                            <div key={match.id.toString()} className="border rounded-lg p-4 shadow-md bg-white dark:bg-gray-800">
                                <p className="text-sm text-gray-600 dark:text-gray-300">Match #{match.id.toString()}</p>
                                <p className="text-gray-800 dark:text-gray-200">Bet: {formatEther(match.betAmount)} ETH</p>
                                <p className="text-gray-800 dark:text-gray-200">
                                    Opponent: {match.player1 === address ? (match.player2 || 'Waiting...') : match.player1}
                                </p>
                                {match.state === 0 && (
                                    <button
                                        onClick={() => handleCancelMatch(match.id)}
                                        className="mt-4 w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg shadow"
                                    >
                                        Cancel Match
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    <h2 className="text-2xl font-semibold mb-4">Match History</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {endedMatches.map((match) => {
                            // Determine outcome
                            const won = match.winner === address;
                            const isCanceled = match.state === 2; // CANCELED state

                            // Set card color based on match outcome
                            const bgColor = isCanceled
                                ? 'bg-yellow-200 dark:bg-yellow-800'
                                : won
                                    ? 'bg-green-200 dark:bg-green-800 '
                                    : 'bg-red-200 dark:bg-red-800';

                            return (
                                <div key={match.id.toString()} className={`border rounded-lg p-4 shadow-sm ${bgColor}`}>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">Match #{match.id.toString()}</p>
                                    <p className="text-gray-800 dark:text-gray-200">Bet: {formatEther(match.betAmount)} ETH</p>
                                    <p className="text-gray-600 dark:text-gray-400">Result: {match.result ? 'Heads' : 'Tails'}</p>

                                    {isCanceled ? (
                                        <p className="font-bold text-lg">Match Canceled</p>
                                    ) : (
                                        <p className="font-bold text-lg">
                                            {won ? 'You Won!' : 'You Lost'}
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <h2 className="text-2xl font-semibold mb-4">Player Stats</h2>
                    {playerStats ? (
                        <div className="text-lg text-gray-800 dark:text-gray-200">
                            <p>Total Matches: {playerStats[0]?.toString()}</p>
                            <p>Total Wins: {playerStats[1]?.toString()}</p>
                            <p>Refund Amount: {formatEther(refundAmount)} ETH</p>
                            {refundAmount > BigInt(0) && (
                                <button
                                    onClick={handleWithdrawRefund}
                                    className="mt-2 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg shadow"
                                >
                                    Withdraw Refund
                                </button>
                            )}
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 dark:text-gray-400">Loading player stats...</p>
                    )}
                </>
            )}

            {address && matches.length === 0 && (
                <p className="text-center mt-8 text-gray-500 dark:text-gray-400">No matches found</p>
            )}
        </div>
    );
}
