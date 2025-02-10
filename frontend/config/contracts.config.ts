import { chainFlipAbi } from '@/config/chainflip';

// Centralized contract configuration
export const CONTRACTS = {
    chainFlip: {
        // Use different environment variables for each network
        amoy: process.env.NEXT_PUBLIC_AMOY_CHAINFLIP_CONTRACT_ADDRESS as `0x${string}`,
        sepolia: process.env.NEXT_PUBLIC_SEPOLIA_CHAINFLIP_CONTRACT_ADDRESS as `0x${string}`,
        bnbtestnet: process.env.NEXT_PUBLIC_BNBTESTNET_CHAINFLIP_CONTRACT_ADDRESS as `0x${string}`,
        abi: chainFlipAbi,
    },
    // Add more contracts here if needed
};
