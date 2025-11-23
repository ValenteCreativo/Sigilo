"use client";

/**
 * EVVM Contract Integration
 * Deployed on Sepolia (chainId: 11155111)
 */

export const EVVM_CONFIG = {
  chainId: 11155111,
  chainName: "Sepolia",
  rpcUrl: "https://ethereum-sepolia-rpc.publicnode.com",
  // Updated to proxy address from EVVM deployment
  evvmAddress: "0x389dC8fb09211bbDA841D59f4a51160dA2377832" as `0x${string}`,
  stakingAddress: "0x772cfc07cd378d42668f7c19db820f2cfe5bf2f2" as `0x${string}`,
  nameServiceAddress: "0x8bef10bdf2f3c665af4518f61e1d6f50463f8e11" as `0x${string}`,
  treasuryAddress: "0x866a746d18f43027322644e55356f709e05008cc" as `0x${string}`,
  p2pSwapAddress: "0xc59c5d6f44e813d66e38d21979797504fc7222aa" as `0x${string}`,
  // Native ETH token address (zero address in EVVM)
  nativeToken: "0x0000000000000000000000000000000000000000" as `0x${string}`,
};

// Full ABI for EVVM functions we need
export const EVVM_ABI = [
  // Faucet function - adds balance for testing
  {
    name: "addBalance",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "user", type: "address" },
      { name: "token", type: "address" },
      { name: "quantity", type: "uint256" },
    ],
    outputs: [],
  },
  // View balances
  {
    name: "balances",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "user", type: "address" },
      { name: "token", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  // Pay function for sending to an address
  {
    name: "pay",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "from", type: "address" },
      { name: "to_address", type: "address" },
      { name: "to_identity", type: "string" },
      { name: "token", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "priorityFee", type: "uint256" },
      { name: "nonce", type: "uint256" },
      { name: "priority", type: "bool" },
      { name: "executor", type: "address" },
      { name: "signature", type: "bytes" },
    ],
    outputs: [],
  },
] as const;

// Report submission structure
export interface ReportSubmission {
  reportHash: string;
  timestamp: number;
  location?: { lat: number; lng: number };
  message: string;
  isEmergency: boolean;
}

/**
 * Generate a hash for a report (keccak256-like for demo)
 */
export function generateReportHash(submission: Omit<ReportSubmission, "reportHash">): string {
  const data = JSON.stringify({
    ts: submission.timestamp,
    loc: submission.location,
    msg: submission.message,
    em: submission.isEmergency,
  });

  // Simple hash for demo (in production, use keccak256 from viem)
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }

  return "0x" + Math.abs(hash).toString(16).padStart(64, "0");
}

/**
 * Transaction receipt
 */
export interface TransactionReceipt {
  txHash: string;
  blockNumber: number;
  status: "success" | "pending" | "failed";
  reportHash: string;
  timestamp: number;
  chainId: number;
}

/**
 * Simulate submitting a report hash to EVVM
 * This is used when wallet is not connected - simulates the transaction
 */
export async function submitReportToEVVM(
  report: Omit<ReportSubmission, "reportHash">
): Promise<TransactionReceipt> {
  const reportHash = generateReportHash(report);

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Generate simulated transaction hash
  const txHash =
    "0x" +
    Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");

  return {
    txHash,
    blockNumber: Math.floor(Date.now() / 1000) % 1000000 + 5000000,
    status: "success",
    reportHash,
    timestamp: Date.now(),
    chainId: EVVM_CONFIG.chainId,
  };
}

/**
 * Format address for display
 */
export function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Get explorer URL for a transaction
 */
export function getExplorerUrl(txHash: string): string {
  return `https://sepolia.etherscan.io/tx/${txHash}`;
}

/**
 * Get explorer URL for the EVVM contract
 */
export function getContractExplorerUrl(): string {
  return `https://sepolia.etherscan.io/address/${EVVM_CONFIG.evvmAddress}`;
}

/**
 * Format wei to ether display
 */
export function formatBalance(wei: bigint, decimals: number = 18): string {
  const divisor = BigInt(10 ** decimals);
  const integerPart = wei / divisor;
  const fractionalPart = wei % divisor;
  const fractionalStr = fractionalPart.toString().padStart(decimals, "0").slice(0, 4);
  return `${integerPart}.${fractionalStr}`;
}
