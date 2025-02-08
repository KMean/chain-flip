'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAccount, useReadContract } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { CONTRACTS } from '@/config/contracts.config';

const Navbar = () => {
    const { address } = useAccount();
    const [isOwner, setIsOwner] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    const { data: ownerAddress } = useReadContract({
        address: CONTRACTS.chainFlip.address,
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

    return (
        <nav className="fixed top-0 left-0 w-full z-50 bg-gray-900 bg-opacity-0 backdrop-blur-md p-4 text-white">
            {/* Top row: Logo + Desktop Nav + Hamburger */}
            <div className="flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center">
                    <Image
                        src="/chainflip_logo.png"
                        alt="Coin Fl!p Logo"
                        width={50}
                        height={50}
                        className="hover:opacity-80 transition-opacity duration-200 rounded-full"
                    />
                </Link>

                {/* Desktop Nav (hidden on mobile) */}
                <div className="hidden lg:flex lg:items-center lg:space-x-6">
                    <Link
                        href="/matches"
                        className="hover:text-gray-300 transition-colors duration-200"
                    >
                        Matches
                    </Link>
                    <Link
                        href="/dashboard"
                        className="hover:text-gray-300 transition-colors duration-200"
                    >
                        Dashboard
                    </Link>
                    <Link
                        href="/leaderboard"
                        className="hover:text-gray-300 transition-colors duration-200"
                    >
                        Leader Board
                    </Link>
                    {isOwner && (
                        <Link
                            href="/admin"
                            className="hover:text-gray-300 transition-colors duration-200"
                        >
                            Admin
                        </Link>
                    )}

                    {/* Desktop Connect Button */}
                    <ConnectButton
                        chainStatus="icon"
                        showBalance={false}
                        accountStatus={{
                            smallScreen: 'avatar',
                            largeScreen: 'full',
                        }}
                        label="Connect"
                    />
                </div>

                {/* Hamburger Button (mobile only) */}
                <div className="lg:hidden">
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="text-white hover:text-gray-300 focus:outline-none"
                    >
                        {/* Toggle icon between hamburger and "X" */}
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
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

            {/* Mobile Menu (hidden on desktop) */}
            <div className={`${menuOpen ? 'block' : 'hidden'} lg:hidden mt-4`}>
                <div className="flex flex-col space-y-2">
                    <Link
                        href="/matches"
                        onClick={() => setMenuOpen(false)}
                        className="hover:text-gray-300 transition-colors duration-200"
                    >
                        Matches
                    </Link>
                    <Link
                        href="/dashboard"
                        onClick={() => setMenuOpen(false)}
                        className="hover:text-gray-300 transition-colors duration-200"
                    >
                        Dashboard
                    </Link>
                    <Link
                        href="/leaderboard"
                        onClick={() => setMenuOpen(false)}
                        className="hover:text-gray-300 transition-colors duration-200"
                    >
                        Leader Board
                    </Link>
                    {isOwner && (
                        <Link
                            href="/admin"
                            onClick={() => setMenuOpen(false)}
                            className="hover:text-gray-300 transition-colors duration-200"
                        >
                            Admin
                        </Link>
                    )}

                    {/* Mobile Connect Button */}
                    <div className="mt-2">
                        <ConnectButton
                            chainStatus="icon"
                            showBalance={false}
                            accountStatus={{
                                smallScreen: 'avatar',
                                largeScreen: 'full',
                            }}
                            label="Connect"
                        />
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
