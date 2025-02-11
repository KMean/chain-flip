'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAccount, useReadContract, useChainId } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { CONTRACTS } from '@/config/contracts.config';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

const SepoliaChainId = 11155111;
const BnbTestnetChainId = 97;

const Navbar = () => {
    const { address } = useAccount();
    const [isOwner, setIsOwner] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    // Default theme is "dark" if no value exists in localStorage
    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        if (typeof window !== "undefined") {
            return (localStorage.getItem('theme') as 'light' | 'dark') || 'dark';
        }
        return 'dark';
    });

    // Get chain ID
    const chainId = useChainId();

    //get chainFlip contract address based on chainId
    let chainFlipContractAddress;
    if (chainId === SepoliaChainId) {
        chainFlipContractAddress = CONTRACTS.chainFlip.sepolia;
    } else if (chainId === BnbTestnetChainId) {
        chainFlipContractAddress = CONTRACTS.chainFlip.bnbtestnet; // Use the BSC testnet address
    } else {
        chainFlipContractAddress = CONTRACTS.chainFlip.amoy;
    }

    const { data: ownerAddress } = useReadContract({
        address: chainFlipContractAddress,
        abi: CONTRACTS.chainFlip.abi,
        functionName: 'owner',
    });

    useEffect(() => {
        if (ownerAddress && address && ownerAddress.toLowerCase() === address.toLowerCase()) {
            setIsOwner(true);
        } else {
            setIsOwner(false);
        }
    }, [ownerAddress, address]);

    // Theme Toggle Handler
    useEffect(() => {
        if (typeof window !== "undefined") {
            document.documentElement.classList.toggle('dark', theme === 'dark');
            localStorage.setItem('theme', theme);
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    return (
        <nav className="fixed top-0 left-0 w-full z-50 bg-white/1 dark:bg-gray-900/1 backdrop-blur-lg p-4 text-gray-900 dark:text-white">
            <div className="flex items-center justify-between">
                <Link href="/" className="flex items-center">
                    <Image
                        src="/chainflip_logo.png"
                        alt="Coin Fl!p Logo"
                        width={50}
                        height={50}
                        className="hover:opacity-80 transition-opacity duration-200 rounded-full"
                    />
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden lg:flex lg:items-center lg:space-x-6">
                    <Link href="/matches" className="hover:text-blue-500 dark:hover:text-purple-300 transition-colors duration-200">Matches</Link>
                    <Link href="/dashboard" className="hover:text-blue-500 dark:hover:text-purple-300 transition-colors duration-200">Dashboard</Link>
                    <Link href="/leaderboard" className="hover:text-blue-500 dark:hover:text-purple-300 transition-colors duration-200">Leader Board</Link>
                    {isOwner && <Link href="/admin" className="hover:text-blue-500 dark:hover:text-purple-300 transition-colors duration-200">Admin</Link>}

                    {/* Theme Toggle Button */}
                    <button onClick={toggleTheme} className="ml-4 p-2 rounded-full bg-purple-300/1 dark:bg-gray-800/1 hover:bg-purple-300/50 dark:hover:bg-blue-500/20 transition-all">
                        {theme === 'light' ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
                    </button>

                    {/* Connect Button */}
                    <ConnectButton
                        chainStatus="icon"
                        showBalance={false}
                        accountStatus={{ smallScreen: 'avatar', largeScreen: 'full' }}
                        label="Connect"
                    />
                </div>

                {/* Mobile Menu Button */}
                <div className="lg:hidden">
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="text-gray-900 dark:text-white hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
                    >
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                            {menuOpen ? (
                                <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            ) : (
                                <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"
                                />
                            )}
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <div className={`${menuOpen ? 'block' : 'hidden'} lg:hidden mt-4`}>
                <div className="flex flex-col space-y-2">
                    <Link href="/matches" onClick={() => setMenuOpen(false)} className="hover:text-gray-500 dark:hover:text-gray-300 transition-colors duration-200">Matches</Link>
                    <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="hover:text-gray-500 dark:hover:text-gray-300 transition-colors duration-200">Dashboard</Link>
                    <Link href="/leaderboard" onClick={() => setMenuOpen(false)} className="hover:text-gray-500 dark:hover:text-gray-300 transition-colors duration-200">Leader Board</Link>
                    {isOwner && <Link href="/admin" onClick={() => setMenuOpen(false)} className="hover:text-gray-500 dark:hover:text-gray-300 transition-colors duration-200">Admin</Link>}

                    {/* Theme Toggle in Mobile Menu */}
                    <button onClick={toggleTheme} className="ml-4 p-2 rounded-full bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-all">
                        {theme === 'light' ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
                    </button>

                    {/* Connect Button for Mobile */}
                    <div className="mt-2">
                        <ConnectButton chainStatus="icon" showBalance={false} accountStatus={{ smallScreen: 'avatar', largeScreen: 'full' }} label="Connect" />
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
