"use client";
import { useState, useEffect } from "react";
import { useReadContract, useReadContracts, useAccount } from "wagmi";
import { CONTRACTS } from "../../config/contracts.config";

interface Match {
    id: bigint;
    state: number;
    winner: `0x${string}`;
}

interface ContractReadResult {
    result?: Match; // or 'Match | null' if there's a possibility of missing data
}

interface PlayerStats {
    address: string;
    wins: number;
}

export default function Leaderboard() {
    const { address: connectedAddress } = useAccount();
    const [leaderboard, setLeaderboard] = useState<PlayerStats[]>([]);

    // 1. Fetch the current highest match ID
    const { data: currentMatchId } = useReadContract({
        address: CONTRACTS.chainFlip.address,
        abi: CONTRACTS.chainFlip.abi,
        functionName: "getCurrentMatchId",
    });

    // 2. Prepare an array of read calls for each match
    const matchCount = Number(currentMatchId || 0);
    const matchContracts = Array.from({ length: matchCount }, (_, i) => ({
        address: CONTRACTS.chainFlip.address,
        abi: CONTRACTS.chainFlip.abi,
        functionName: "getMatch",
        args: [BigInt(i + 1)], // matches start from ID 1
    }));

    // 3. Fetch all match data
    const { data: matchesData } = useReadContracts({
        contracts: matchContracts,
        query: {
            enabled: matchCount > 0,
        },
    });

    // 4. Process matches to calculate leaderboard
    useEffect(() => {
        if (!matchesData) return;

        const winCount: Record<string, number> = {};

        matchesData.forEach((matchResult: ContractReadResult) => {
            const match = matchResult.result;
            // match.state = 3 => ended
            // match.winner != 0x0000 => increment their wins
            if (
                match &&
                match.state === 3 &&
                match.winner !== "0x0000000000000000000000000000000000000000"
            ) {
                const addr = match.winner.toLowerCase();
                winCount[addr] = (winCount[addr] || 0) + 1;
            }
        });

        // Convert to array and sort by wins
        const leaderboardArray: PlayerStats[] = Object.entries(winCount)
            .map(([playerAddress, wins]) => ({
                address: playerAddress,
                wins,
            }))
            .sort((a, b) => b.wins - a.wins);

        setLeaderboard(leaderboardArray);
    }, [matchesData]);

    return (
        <div className="min-h-screen pt-40 p-8 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-900 text-white">
            {/* Glowing Background Layer */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 left-1/2 w-[600px] h-[600px] bg-purple-500 opacity-20 blur-[160px]" />
                <div className="absolute top-40 right-1/3 w-[400px] h-[400px] bg-blue-500 opacity-20 blur-[140px]" />
            </div>

            <h1 className="text-3xl font-bold text-center mb-8">Leaderboard</h1>

            {leaderboard.length > 0 ? (
                <div className="overflow-x-auto shadow-md rounded-lg">
                    <table className="min-w-full bg-gray-800 border border-gray-700">
                        <thead>
                            <tr className="bg-gray-700 text-left">
                                <th className="py-3 px-6">Rank</th>
                                <th className="py-3 px-6">Player</th>
                                <th className="py-3 px-6">Wins</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaderboard.map((player, index) => {
                                const isCurrentUser =
                                    player.address.toLowerCase() === connectedAddress?.toLowerCase();

                                return (
                                    <tr
                                        key={player.address}
                                        className={`border-t border-gray-700 ${isCurrentUser
                                                ? "bg-blue-900 text-white font-bold"
                                                : "text-gray-300"
                                            }`}
                                    >
                                        <td className="py-3 px-6">{index + 1}</td>
                                        <td className="py-3 px-6">{`${player.address.slice(0, 6)}...${player.address.slice(
                                            -4
                                        )}`}</td>
                                        <td className="py-3 px-6">{player.wins}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-center text-gray-400 mt-8">
                    No match data available yet.
                </p>
            )}
        </div>
    );
}
