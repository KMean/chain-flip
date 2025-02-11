import React from 'react';
import { formatEther } from 'viem';
import { useChainId } from 'wagmi';
import { config } from '@/config/wagmi';



interface AdminDashboardProps {
    currentFeePercent?: { result?: bigint };
    betAmount?: { result?: bigint };
    collectedFees?: { result?: bigint };
    feePercent: number;
    setFeePercent: (value: number) => void;
    handleSetFee: () => void;
    minBetAmount: number;
    setMinBetAmount: (value: number) => void;
    handleSetMinBet: () => void;
    timeout: number;
    setTimeout: (value: number) => void;
    handleSetTimeout: () => void;
    recipient: string;
    setRecipient: (value: string) => void;
    withdrawAmount: number;
    setWithdrawAmount: (value: number) => void;
    handleWithdrawFees: () => void;
    isWithdrawDisabled: boolean;
}


const AdminDashboard: React.FC<AdminDashboardProps> = ({
    currentFeePercent,
    betAmount,
    collectedFees,
    feePercent,
    setFeePercent,
    handleSetFee,
    minBetAmount,
    setMinBetAmount,
    handleSetMinBet,
    timeout,
    setTimeout,
    handleSetTimeout,
    recipient,
    setRecipient,
    withdrawAmount,
    setWithdrawAmount,
    handleWithdrawFees,
    isWithdrawDisabled,

}) => {
    // Get chain ID
    const chainId = useChainId();
    const chain = config.chains.find((c) => c.id === chainId);
    const nativeCurrency = chain?.nativeCurrency?.symbol ?? "???"; // Fallback if undefined

    return (
        <div className="pt-40 relative min-h-screen bg-gradient-to-br from-blue-100 to-purple-900 dark:from-gray-900 dark:to-gray-900 overflow-hidden">
            {/* Glowing Background Layer */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 left-1/2 w-[600px] h-[600px] bg-purple-300 dark:bg-purple-500 opacity-20 blur-[160px]"></div>
                <div className="absolute top-40 right-1/3 w-[400px] h-[400px] bg-blue-300 dark:bg-blue-500 opacity-20 blur-[140px]"></div>
            </div>

            <h1 className="text-2xl font-bold mb-6 text-center text-blue-700 dark:text-white">Admin Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative max-w-4xl mx-auto">
                {/* Fee Section */}
                <div className="bg-gray-800/50 p-6 rounded-lg shadow-lg">
                    <label className="block mb-2 text-gray-300">Current Fee Percentage</label>
                    <p className="p-2 rounded bg-gray-700 text-white text-center">
                        {currentFeePercent?.result?.toString()}%
                    </p>
                    <div className="flex mt-4">
                        <input
                            type="number"
                            value={feePercent}
                            onChange={(e) => setFeePercent(Number(e.target.value))}
                            className="flex-1 p-2 rounded bg-gray-700 text-white"
                            max="10"
                        />
                        <button onClick={handleSetFee} className="ml-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded">
                            Update Fee
                        </button>
                    </div>
                </div>

                {/* Minimum Bet Amount */}
                <div className="bg-gray-800/50 p-6 rounded-lg shadow-lg">
                    <label className="block mb-2 text-gray-300">Current Minimum Bet Amount</label>
                    <p className="p-2 rounded bg-gray-700 text-white text-center">
                        {betAmount?.result ? parseFloat(formatEther(betAmount.result)).toFixed(2) : '0.0000'} {nativeCurrency}
                    </p>
                    <div className="flex mt-4">
                        <input
                            type="number"
                            step="0.01"
                            value={minBetAmount}
                            onChange={(e) => setMinBetAmount(Number(e.target.value))}
                            className="flex-1 p-2 rounded bg-gray-700 text-white"
                        />
                        <button onClick={handleSetMinBet} className="ml-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded">
                            Update Min Bet
                        </button>
                    </div>
                </div>

                {/* Timeout Section */}
                <div className="bg-gray-800/50 p-6 rounded-lg shadow-lg">
                    <label className="block mb-2 text-gray-300">Set Timeout for Stuck Matches (Minutes)</label>
                    <div className="flex">
                        <input
                            type="number"
                            value={timeout}
                            onChange={(e) => setTimeout(Number(e.target.value))}
                            className="flex-1 p-2 rounded bg-gray-700 text-white"
                        />
                        <button onClick={handleSetTimeout} className="ml-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded">
                            Update Timeout
                        </button>
                    </div>
                </div>

                {/* Collected Fees + Withdraw Section */}
                <div className="bg-gray-800/50 p-6 rounded-lg shadow-lg">
                    <label className="block mb-2 text-gray-300">Collected Fees</label>
                    <p className="p-2 rounded bg-gray-700 text-white text-center">
                        {collectedFees?.result ? parseFloat(formatEther(collectedFees.result)).toFixed(3) : '0.000'} {nativeCurrency}
                    </p>
                    <div className="mt-4 space-y-2">
                        <input
                            type="text"
                            placeholder="Recipient Address"
                            value={recipient}
                            onChange={(e) => setRecipient(e.target.value)}
                            className="w-full p-2 rounded bg-gray-700 text-white"
                        />
                        <div className="flex">
                            <input
                                type="number"
                                placeholder="Amount ({nativeCurrency})"
                                step="0.01"
                                value={withdrawAmount}
                                onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                                className="flex-1 p-2 rounded bg-gray-700 text-white"
                            />
                            {/* "Max" Button - Sets the withdrawal amount to the total collected fees */}
                            <button
                                onClick={() => setWithdrawAmount(parseFloat(formatEther(collectedFees?.result ?? BigInt(0))))}
                                className="px-3 py-2 bg-gray-600 hover:bg-gray-700 rounded text-white"
                                disabled={collectedFees?.result === undefined || collectedFees.result === BigInt(0)}
                            >
                                Max
                            </button>
                            <button
                                onClick={handleWithdrawFees}
                                disabled={isWithdrawDisabled}
                                className={`px-6 py-3 rounded-lg text-white font-medium transition-all shadow-lg
                    ${isWithdrawDisabled ? 'bg-gray-500 cursor-not-allowed opacity-50' : 'bg-blue-500 hover:bg-blue-600'}`}
                            >
                                Withdraw
                            </button>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
