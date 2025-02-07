'use client';

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, Chain, midnightTheme } from '@rainbow-me/rainbowkit';
import { config } from '@/config/wagmi';


const anvil: Chain = {
    id: 31_337,
    name: 'Anvil Local',
    nativeCurrency: {
        name: 'Anvil',
        symbol: 'ANVETH',
        decimals: 18
    },
    rpcUrls: {
        public: { http: ["http://localhost:8545"] },
        default: { http: ["http://localhost:8545"] }
    },
    testnet: true,
}

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider theme={midnightTheme()}>{children}</RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}