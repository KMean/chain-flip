'use client';

import React from 'react';
import { useReadContracts, useChainId } from 'wagmi';
import { formatEther } from 'viem';
import { CONTRACTS } from '../config/contracts.config';
import { config } from '../config/wagmi';
import Link from 'next/link';
import { motion } from 'framer-motion';

const SepoliaChainId = 11155111;
const BnbTestnetChainId = 97;

export default function Home() {

  // Get chain ID
  const chainId = useChainId();
  // Choose the contract address based on chainId
  let chainFlipContractAddress;// = chainId === SepoliaChainId ? CONTRACTS.chainFlip.sepolia : CONTRACTS.chainFlip.amoy;

  if (chainId === SepoliaChainId) {
    chainFlipContractAddress = CONTRACTS.chainFlip.sepolia;
  } else if (chainId === BnbTestnetChainId) {
    chainFlipContractAddress = CONTRACTS.chainFlip.bnbtestnet;
  } else {
    chainFlipContractAddress = CONTRACTS.chainFlip.amoy;
  }
  // Get native currency symbol
  const chain = config.chains.find((c) => c.id === chainId);
  const nativeCurrency = chain?.nativeCurrency?.symbol ?? "???"; // Fallback if undefined

  // Fetch contract data
  const { data, isLoading, error } = useReadContracts({
    contracts: [
      {
        address: chainFlipContractAddress,
        abi: CONTRACTS.chainFlip.abi,
        functionName: 'getCurrentMatchId', // Fetch total matches played
      },
      {
        address: chainFlipContractAddress,
        abi: CONTRACTS.chainFlip.abi,
        functionName: 'getTotalWinnings', // Fetch total winnings
      },
      {
        address: chainFlipContractAddress,
        abi: CONTRACTS.chainFlip.abi,
        functionName: 'getFeePercent', // Fetch current fee percentage
      },
      {
        address: chainFlipContractAddress,
        abi: CONTRACTS.chainFlip.abi,
        functionName: 'getMinimumBetAmount', // Fetch minimum bet amount
      },

    ] as const,
  });

  // Extract values safely
  const totalMatches = data?.[0]?.result?.toString() ?? '0';
  const totalWinnings = data?.[1]?.result ? formatEther(data[1].result) : '0.00';
  const feePercent = data?.[2]?.result?.toString() ?? '0';
  const minBetAmount = data?.[3]?.result ? formatEther(data[3].result) : '0.01';

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gray-900 overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-[110%] h-[110%] object-cover opacity-60 blur-sm"
      >
        <source src="/background.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Dark Overlay for Contrast */}
      <div className="absolute inset-0 bg-blue-900 bg-opacity-10 z-0" />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col w-[85%] lg:w-[40%] md:w-[90%] ipadpro:w-[70%] samsungGalaxyS8:w-[90%] galaxyZFold5:w-[92%] custom:w-[100%] items-center text-center px-30  sm:px-50 py-12 backdrop-blur-sm bg-black/50 rounded-xl shadow-xl">
        <h1 className="text-2xl lg:text-4xl md:text-4xl font-bold text-white">
          Welcome to <span className="text-blue-400">Chain Fl!p</span>
        </h1>
        <p className="mt-4 text-xs sm:text-sm lg:text-lg md:text-lg text-gray-300">
          Try your luck with the ultimate coin flipping game!
        </p>

        {/* Game Stats (Dynamic from Contract) */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-white">
          {/* Total Matches */}
          <div className="p-4 bg-gray-800/40 rounded-lg shadow-md">
            <p className="text-sm text-gray-400">Total Matches</p>
            {isLoading ? (
              <p className="text-3xl font-semibold text-blue-400">Loading...</p>
            ) : error ? (
              <p className="text-3xl font-semibold text-red-400">Error</p>
            ) : (
              <p className="text-3xl font-semibold text-blue-400">{totalMatches}</p>
            )}
          </div>

          {/* Total Winnings */}
          <div className="p-4 bg-gray-800/40 rounded-lg shadow-md">
            <p className="text-sm text-gray-400">Total Winnings</p>
            {isLoading ? (
              <p className="text-3xl font-semibold text-green-400">Loading...</p>
            ) : error ? (
              <p className="text-3xl font-semibold text-red-400">Error</p>
            ) : (
              <p className="text-3xl font-semibold text-green-400">{parseFloat(totalWinnings).toFixed(2)}<span className='text-sm'> {nativeCurrency}</span></p>
            )}
          </div>

          {/* Fee Percentage */}
          <div className="p-4 bg-gray-800/40 rounded-lg shadow-md">
            <p className="text-sm text-gray-400">Fee Percentage</p>
            {isLoading ? (
              <p className="text-3xl font-semibold text-purple-400">Loading...</p>
            ) : error ? (
              <p className="text-3xl font-semibold text-red-400">Error</p>
            ) : (
              <p className="text-3xl font-semibold text-purple-400">{feePercent}%</p>
            )}
          </div>

          {/* Minimum Bet */}
          <div className="p-4 bg-gray-800/40 rounded-lg shadow-md">
            <p className="text-sm text-gray-400">Minimum Bet</p>
            {isLoading ? (
              <p className="text-3xl font-semibold text-yellow-400">Loading...</p>
            ) : error ? (
              <p className="text-3xl font-semibold text-red-400">Error</p>
            ) : (
              <p className="text-3xl font-semibold text-yellow-400">{minBetAmount}<span className='text-sm'> {nativeCurrency}</span></p>
            )}
          </div>
        </div>

        {/* CTA Button */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mt-8"
        >
          <Link href="/matches">
            <button className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-semibold text-lg transition-all duration-300 flex items-center gap-2 mx-auto shadow-lg hover:shadow-xl">
              Play Now

            </button>
          </Link>
        </motion.div>

      </div>
    </div>
  );
}
