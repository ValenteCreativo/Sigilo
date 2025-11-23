"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createAppKit } from "@reown/appkit/react";
import { sepolia } from "@reown/appkit/networks";
import { WagmiProvider, type State } from "wagmi";
import { wagmiAdapter, projectId } from "@/config/wagmi";
import { AuthProvider } from "@/contexts";
import { useState, type ReactNode } from "react";

// Create AppKit modal
const modal = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [sepolia],
  defaultNetwork: sepolia,
  metadata: {
    name: "SIGILO",
    description: "Anonymous whistleblowing with EVVM blockchain integration",
    url: "https://sigilo.app",
    icons: ["/sigilo-icon.png"],
  },
  features: {
    analytics: false, // Disable for privacy
  },
  themeMode: "dark",
  themeVariables: {
    "--w3m-accent": "#14b8a6", // sigilo-teal
    "--w3m-border-radius-master": "12px",
  },
});

interface ProvidersProps {
  children: ReactNode;
  initialState?: State;
}

export function Providers({ children, initialState }: ProvidersProps) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{children}</AuthProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
