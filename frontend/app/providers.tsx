'use client';

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, Theme } from '@rainbow-me/rainbowkit';
import { config } from '@/config/wagmi';



const queryClient = new QueryClient();

export const customTheme: Theme = {
    fonts: {
        body: 'system-ui, sans-serif',
    },
    shadows: {
        connectButton: '0 4px 8px rgba(0, 0, 0, 0.1)',
        dialog: '0 4px 8px rgba(0, 0, 0, 0.1)',
        profileDetailsAction: '0 4px 8px rgba(0, 0, 0, 0.1)',
        selectedOption: '0 4px 8px rgba(0, 0, 0, 0.1)',
        selectedWallet: '0 4px 8px rgba(0, 0, 0, 0.1)',
        walletLogo: '0 4px 8px rgba(0, 0, 0, 0.1)',
    },
    blurs: {
        modalOverlay: 'blur(10px)',
    },
    colors: {
        accentColor: '#8b5cf6',              // Vibrant violet
        accentColorForeground: '#ffffff',    // White text on accent
        actionButtonBorder: '#6366f1',       // Medium blue/violet
        actionButtonBorderMobile: '#6366f1',
        actionButtonSecondaryBackground: 'rgba(139, 92, 246, 0.1)', // Lighter violet overlay
        closeButton: '#3b82f6',              // Blue-500
        closeButtonBackground: '#ffffff',
        connectButtonBackground: 'rgba(139, 92, 246, 0.2)', // Light violet overlay
        connectButtonBackgroundError: '#ef4444',            // Red-500 for errors
        connectButtonInnerBackground: 'rgba(139, 92, 246, 0.1)',
        connectButtonText: '#ffffff',
        connectButtonTextError: '#ffffff',
        connectionIndicator: '#3b82f6',      // Blue-500
        error: '#ef4444',                    // Red-500
        generalBorder: '#6d28d9',            // A deeper violet
        generalBorderDim: '#4c1d95',         // Even deeper violet
        menuItemBackground: '#8b5cf6',       // Main violet
        modalBackdrop: 'rgba(0, 0, 0, 0.8)',
        modalBackground: 'rgba(67, 56, 202, 0.7)', // Slightly translucent violet
        modalBorder: '1px solid #4c1d95',
        modalText: '#ffffff',
        modalTextDim: '#d1d5db',            // Gray-300
        modalTextSecondary: '#9ca3af',      // Gray-400
        profileAction: '#8b5cf6',
        profileActionHover: '#7c3aed',
        profileForeground: 'rgba(139, 92, 246, 0.1)',
        selectedOptionBorder: '#3b82f6',
        standby: '#3b82f6',                 // Blue-500
        downloadBottomCardBackground: '#312e81', // Indigo-900-ish
        downloadTopCardBackground: '#4338ca',    // Indigo-700-ish
    },
    radii: {
        actionButton: '10px',
        connectButton: '10px',
        menuButton: '10px',
        modal: '10px',
        modalMobile: '10px',
    },
};



export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider theme={customTheme}>{children}</RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}