"use client";

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { EVVM_CONFIG, EVVM_ABI, generateReportHash, type ReportSubmission } from "@/lib/evvm";

/**
 * Hook for EVVM contract interactions using wagmi
 */
export function useEVVM() {
  const { address, isConnected } = useAccount();

  // Read user's EVVM balance
  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: EVVM_CONFIG.evvmAddress,
    abi: EVVM_ABI,
    functionName: "balances",
    args: address ? [address, EVVM_CONFIG.nativeToken] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Write contract hook for faucet
  const {
    writeContract: claimFaucet,
    data: faucetTxHash,
    isPending: isFaucetPending,
    error: faucetError,
  } = useWriteContract();

  // Wait for faucet transaction
  const { isLoading: isFaucetConfirming, isSuccess: isFaucetSuccess } =
    useWaitForTransactionReceipt({
      hash: faucetTxHash,
    });

  // Claim from faucet (adds balance for testing)
  const handleClaimFaucet = async (amount: string = "1") => {
    if (!address) return;

    claimFaucet({
      address: EVVM_CONFIG.evvmAddress,
      abi: EVVM_ABI,
      functionName: "addBalance",
      args: [address, EVVM_CONFIG.nativeToken, parseEther(amount)],
    });
  };

  // Submit emergency report to blockchain
  const submitEmergencyReport = async (
    message: string,
    location?: { lat: number; lng: number }
  ): Promise<{ success: boolean; txHash?: string; reportHash?: string; error?: string }> => {
    if (!address) {
      return { success: false, error: "Wallet not connected" };
    }

    try {
      const report: Omit<ReportSubmission, "reportHash"> = {
        timestamp: Date.now(),
        location,
        message,
        isEmergency: true,
      };

      const reportHash = generateReportHash(report);

      // For demo purposes, we'll use the faucet to "record" the emergency
      // In production, this would call a specific emergency submission function
      claimFaucet({
        address: EVVM_CONFIG.evvmAddress,
        abi: EVVM_ABI,
        functionName: "addBalance",
        args: [address, EVVM_CONFIG.nativeToken, BigInt(1)], // Minimal amount as proof
      });

      return {
        success: true,
        txHash: faucetTxHash,
        reportHash,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Transaction failed",
      };
    }
  };

  return {
    // Connection state
    isConnected,
    address,

    // Balance
    balance: balance as bigint | undefined,
    refetchBalance,

    // Faucet operations
    claimFaucet: handleClaimFaucet,
    faucetTxHash,
    isFaucetPending,
    isFaucetConfirming,
    isFaucetSuccess,
    faucetError,

    // Emergency submission
    submitEmergencyReport,
  };
}
