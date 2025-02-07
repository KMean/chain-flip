'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';  // Import Next.js Image component
import { useAccount, useReadContract } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { CONTRACTS } from '@/config/contracts.config';


const Navbar = () => {
    const { address } = useAccount();
    const [isOwner, setIsOwner] = useState(false);

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
        <nav className="fixed top-0 left-0 w-full z-50 bg-gray-900 bg-opacity-0 backdrop-blur-md p-4 text-white flex justify-between items-center">
            <div className="flex space-x-6 items-center">
                {/* Replace text with logo */}
                <Link href="/" className="flex items-center">
                    <Image
                        src="/chainflip_logo.png"  // Path to the logo in public folder
                        alt="Coin Fl!p Logo"
                        width={50}        // Adjust width as needed
                        height={50}       // Adjust height as needed
                        className="hover:opacity-80 transition-opacity duration-200 rounded-full"
                    />
                </Link>

                {/* Navigation Links */}
                <Link href="/matches" className="hover:text-gray-300 transition-colors duration-200">Matches</Link>
                <Link href="/stats" className="hover:text-gray-300 transition-colors duration-200">Stats</Link>
                <Link href="/leaderboard" className="hover:text-gray-300 transition-colors duration-200">Leader Board</Link>
                {isOwner && <Link href="/admin" className="hover:text-gray-300 transition-colors duration-200">Admin</Link>}
            </div>

            <div>
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
        </nav>
    );
};

export default Navbar;
