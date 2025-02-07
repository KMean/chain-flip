import { chainFlipAbi } from '@/config/chainflip';

// Centralized contract configuration
export const CONTRACTS = {
    chainFlip: {
        address: process.env.NEXT_PUBLIC_CHAINFLIP_CONTRACT_ADDRESS as `0x${string}`,
        abi: chainFlipAbi,
    },
    // Add more contracts here if needed
};
