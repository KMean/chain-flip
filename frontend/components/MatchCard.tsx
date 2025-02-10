'use client';
import React from 'react';
import { formatEther } from 'viem';
import { useAccount, useChainId } from 'wagmi';
import {
    UserCircleIcon,
    CurrencyDollarIcon,
    ArrowPathIcon,
    PlusCircleIcon,
} from '@heroicons/react/24/outline';
import FlipCoin from '@/components/FlipCoin';
import { config } from '@/config/wagmi';

export interface Match {
    id: bigint;
    player1: string;
    player2: string;
    betAmount: bigint;
    state: bigint;
    player1Choice: boolean; // true for Heads, false for Tails
}

interface MatchCardProps {
    match: Match;
    onJoin: (id: bigint) => void;
    isJoining: boolean;
    disableJoin: boolean;
    feePercent?: bigint;
    pendingJoins?: bigint[];
}

const MatchCard: React.FC<MatchCardProps> = ({
    match,
    onJoin,
    isJoining,
    disableJoin,
    feePercent,
    pendingJoins = [],
}) => {
    const matchStates = ['Waiting for Player', 'Flipping Coin', 'Canceled', 'Ended'];
    const statusColors = ['bg-purple-500', 'bg-green-500', 'bg-yellow-500', 'bg-blue-500'];
    const matchStatus = matchStates[Number(match.state)];

    const { address } = useAccount();

    const totalBet = match.betAmount * BigInt(2);
    const feePercentValue = feePercent ? BigInt(feePercent) : BigInt(0);
    const fee = (totalBet * feePercentValue) / BigInt(10000);
    const adjustedPrizePool = totalBet - fee;

    // Get chain ID
    const chainId = useChainId();
    const chain = config.chains.find((c) => c.id === chainId);
    const nativeCurrency = chain?.nativeCurrency?.symbol ?? '???';

    return (
        <div
            className="
        relative
        flex flex-col
        bg-purple-100/30 dark:bg-gray-800/10
        dark:border border-gray-200 dark:border-gray-700
        rounded-xl
        shadow-xl
        hover:shadow-2xl
        transition-shadow duration-300
        p-4 sm:p-5 lg:p-6
        text-sm sm:text-base
        leading-tight
      "
        >
            {/* Flipping Coin Animation Overlay */}
            {Number(match.state) === 1 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl z-10 ">
                    <FlipCoin />
                </div>
            )}

            {/* Status Indicator Bar at Top */}
            <div
                className={`absolute top-0 left-0 w-full h-2 ${statusColors[Number(match.state)]} rounded-t-xl`}
            ></div>

            {/* Match Header */}
            <div className="flex items-center justify-between mb-4 ">
                <span className="text-xs font-mono text-blue-600 dark:text-blue-400">
                    #{match.id.toString()}
                </span>
                <span
                    className={`
            px-3 py-1 text-xs
            rounded-full text-white
            ${statusColors[Number(match.state)]}
          `}
                >
                    {matchStatus}
                </span>
            </div>

            {/* Bet Amount */}
            <div className="border-b border-gray-300 dark:border-gray-700 mb-3 pb-2">
                <h3 className="text-md sm:text-lg font-bold text-purple-600 dark:text-purple-300">
                    Bet: {formatEther(match.betAmount)} {nativeCurrency}
                </h3>
            </div>

            {/* Main Content */}
            <div className="flex-1 space-y-3 text-gray-800 dark:text-gray-400 ">
                {/* Player 1 */}
                <div className="flex items-center">
                    <UserCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-500 dark:text-blue-300" />
                    <span className="font-medium">Player 1:</span>
                    <span className="ml-2 font-mono block w-28 truncate">
                        {match.player1}
                    </span>
                    {match.player1 === address && (
                        <span className="ml-1 text-blue-500 dark:text-blue-400 text-xs">(You)</span>
                    )}
                </div>

                {/* Player 2 */}
                <div className="flex items-center">
                    <UserCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-red-500 dark:text-red-300" />
                    <span className="font-medium">Player 2:</span>
                    <span className="ml-2 font-mono block w-28 truncate">
                        {match.player2 === '0x0000000000000000000000000000000000000000'
                            ? 'Waiting...'
                            : match.player2}
                    </span>
                    {match.player2 === address && (
                        <span className="ml-1 text-blue-500 dark:text-blue-400 text-xs">(You)</span>
                    )}
                </div>

                {/* Prize Pool */}
                <div className="flex items-center">
                    <CurrencyDollarIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-500 dark:text-green-300" />
                    <span className="font-medium">Prize Pool:</span>
                    <span className="ml-2 text-blue-600 dark:text-blue-400">
                        {formatEther(adjustedPrizePool)} {nativeCurrency}
                    </span>
                </div>

                {/* Player 1 Choice */}
                <div className="flex items-center">
                    <span className="font-medium">Player 1 Choice:</span>
                    <span className="ml-2 text-purple-600 dark:text-purple-400 font-bold">
                        {match.player1Choice ? 'Heads' : 'Tails'}
                    </span>
                </div>
            </div>

            {/* Join Button */}
            {Number(match.state) === 0 && (
                <button
                    onClick={() => onJoin(match.id)}
                    disabled={isJoining || disableJoin || pendingJoins.includes(match.id)}
                    className={`
            mt-4 w-full flex items-center justify-center py-2 px-4 rounded-lg
            transition-all font-medium
            ${isJoining || disableJoin || pendingJoins.includes(match.id)
                            ? 'bg-blue-200 dark:bg-gray-700 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg text-white'
                        }
          `}
                >
                    {isJoining || pendingJoins.includes(match.id) ? (
                        <div className="flex items-center">
                            <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                            Joining Match...
                        </div>
                    ) : (
                        <div className="flex items-center">
                            <PlusCircleIcon className="w-5 h-5 mr-2" />
                            {disableJoin ? 'Your Match' : 'Join Match'}
                        </div>
                    )}
                </button>
            )}
        </div>
    );
};

export default MatchCard;
