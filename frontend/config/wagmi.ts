import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'wagmi';
import {
    sepolia,
    polygonAmoy,
    bscTestnet,
    anvil
} from 'wagmi/chains';


export const config = getDefaultConfig({
    appName: 'ChainFlip',
    projectId: process.env.NEXT_PUBLIC_RAINBOW_PROJECT_ID!,
    chains: [
        polygonAmoy,
        sepolia,
        bscTestnet,
        anvil
    ],
    transports: {
        [polygonAmoy.id]: http(process.env.NEXT_PUBLIC_AMOY_ALCHEMY_API_URL!),
        [sepolia.id]: http(process.env.NEXT_PUBLIC_SEPOLIA_ALCHEMY_API_URL!),
        [bscTestnet.id]: http(process.env.NEXT_PUBLIC_BNBTESTNET_ALCHEMY_API_URL!),
        [anvil.id]: http()
    },
    ssr: true,
});
