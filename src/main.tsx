import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { sepolia } from 'wagmi/chains'; 
import { http } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a custom Sepolia configuration with a more reliable RPC endpoint
const customSepolia = {
  ...sepolia,
  rpcUrls: {
    ...sepolia.rpcUrls,
    default: {
      http: ['https://ethereum-sepolia.publicnode.com']
    },
    public: {
      http: ['https://ethereum-sepolia.publicnode.com']
    }
  }
};

// Get the current window location for dynamic metadata URL
const currentUrl = typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.host}` : 'http://localhost:8080';

const metadata = {
  name: 'SecureLance',
  description: 'SecureLance Freelancing Platform',
  url: currentUrl, // Use dynamic URL based on current location
  icons: ['https://securelance.xyz/favicon.svg']
};

const config = getDefaultConfig({
  appName: metadata.name, 
  projectId: '55f3e7b7ab26f240fbcb0005631facf4',
  chains: [customSepolia], // Use our custom Sepolia config
  transports: {
    [customSepolia.id]: http('https://ethereum-sepolia.publicnode.com')
  },
  ssr: false,
  walletConnectProjectId: '55f3e7b7ab26f240fbcb0005631facf4',
  metadata: metadata,
});

const queryClient = new QueryClient();
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <App />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
);
