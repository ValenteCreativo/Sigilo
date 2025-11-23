"use client";

import { cookieStorage, createStorage } from "@wagmi/core";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { sepolia } from "@reown/appkit/networks";

// Reown Project ID from dashboard
export const projectId = "3b220d5fb4f1a2afb55f1ff2e9f92649";

if (!projectId) {
  throw new Error("NEXT_PUBLIC_PROJECT_ID is not defined");
}

// Sigilo only uses Sepolia testnet for EVVM
export const networks = [sepolia];

// Wagmi adapter for Reown AppKit
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({ storage: cookieStorage }),
  ssr: true,
  projectId,
  networks,
});

export const wagmiConfig = wagmiAdapter.wagmiConfig;
