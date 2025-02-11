"use client";
import { useState, useEffect } from "react";
import { useReadContract, useReadContracts, useAccount, useChainId } from "wagmi";
import { CONTRACTS } from "../../config/contracts.config";

interface Match {
    id: bigint;
    state: number;
    winner: `0x${string}`;
}

const SepoliaChainId = 11155111;
const BnbTestnetChainId = 97;

export default function Leaderboard() {
    const { address: connectedAddress } = useAccount();

    // local data shape
    interface WagmiReadContractsItem {
        status: "success" | "failure";
        error?: Error;
        result?: unknown;
    }

    interface PlayerStats {
        address: string;
        wins: number;
    }

    const [leaderboard, setLeaderboard] = useState<PlayerStats[]>([]);

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

    // getCurrentMatchId
    const { data: currentMatchId } = useReadContract({
        address: chainFlipContractAddress,
        abi: CONTRACTS.chainFlip.abi,
        functionName: "getCurrentMatchId",
    });

    // Build array of read calls
    const matchCount = Number(currentMatchId || 0);
    const matchContracts = Array.from({ length: matchCount }, (_, i) => ({
        address: chainFlipContractAddress,
        abi: CONTRACTS.chainFlip.abi,
        functionName: "getMatch",
        args: [BigInt(i + 1)],
    }));

    // Do the read
    const { data: matchesData } = useReadContracts<WagmiReadContractsItem[]>({
        contracts: matchContracts,
        query: {
            enabled: matchCount > 0,
        },
    });

    useEffect(() => {
        if (!matchesData) return; // no data
        const winCount: Record<string, number> = {};

        for (const item of matchesData) {
            // Type guard for success items
            if (item.status === "success" && item.result) {
                // cast item.result => your Match type
                const match = item.result as Match;

                // Check if ended => state === 3, winner != 0x00...
                if (
                    match.state === 3 &&
                    match.winner !== "0x0000000000000000000000000000000000000000"
                ) {
                    const addr = match.winner.toLowerCase();
                    winCount[addr] = (winCount[addr] || 0) + 1;
                }
            }
        }

        const leaderboardArray: PlayerStats[] = Object.entries(winCount)
            .map(([addr, wins]) => ({ address: addr, wins }))
            .sort((a, b) => b.wins - a.wins);

        setLeaderboard(leaderboardArray);
    }, [matchesData]);

    return (
        <div className="pt-40 relative min-h-screen bg-gradient-to-br from-blue-100 to-purple-900 dark:from-gray-900 dark:to-gray-900 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 left-1/2 w-[600px] h-[600px] bg-purple-500 opacity-20 blur-[160px]" />
                <div className="absolute top-40 right-1/3 w-[400px] h-[400px] bg-blue-500 opacity-20 blur-[140px]" />
            </div>

            <h1 className="text-3xl font-bold text-center mb-8 text-blue-700 dark:text-white">Leaderboard</h1>

            {leaderboard.length > 0 ? (
                <div className="overflow-x-auto shadow-md rounded-lg m-20">
                    <table className="min-w-full bg-blue-800/20 dark:bg-gray-800 dark:border dark:border-gray-700">
                        <thead>
                            <tr className="bg-blue-900/50 dark:bg-purple-700/50 text-left dark:text-blue-500">
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
                                            ? "bg-purple-900/30 dark:bg-blue-900/30 dark:text-white font-bold border"
                                            : "dark:text-gray-300 border"
                                            }`}
                                    >
                                        <td className="py-3 px-6">{index + 1}</td>
                                        <td className="py-3 px-6">
                                            {`${player.address.slice(0, 6)}...${player.address.slice(-4)}`}
                                        </td>
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
