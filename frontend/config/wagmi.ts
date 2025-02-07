import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'wagmi';
import {
    sepolia,
    polygonAmoy,
    anvil
} from 'wagmi/chains';


export const config = getDefaultConfig({
    appName: 'ChainFlip',
    projectId: process.env.NEXT_PUBLIC_RAINBOW_PROJECT_ID!,
    chains: [
        polygonAmoy,
        sepolia,
        anvil
    ],
    transports: {
        [polygonAmoy.id]: http(process.env.NEXT_PUBLIC_ALCHEMY_API_URL!),
        [sepolia.id]: http(),
        [anvil.id]: http()
    },
    ssr: true,
});
