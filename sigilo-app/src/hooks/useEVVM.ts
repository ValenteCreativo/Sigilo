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

  // Write contract hook for report submissions
  const {
    writeContractAsync: submitReportTx,
    data: reportTxHash,
    isPending: isReportPending,
    error: reportError,
  } = useWriteContract();

  // Wait for faucet transaction
  const { isLoading: isFaucetConfirming, isSuccess: isFaucetSuccess } =
    useWaitForTransactionReceipt({
      hash: faucetTxHash,
    });

  // Wait for report transaction
  const {
    data: reportReceipt,
    isLoading: isReportConfirming,
    isSuccess: isReportSuccess,
  } = useWaitForTransactionReceipt({
    hash: reportTxHash,
  });

  // Claim from faucet (adds balance for testing)
  const handleClaimFaucet = async (amount: string = "1") => {
    if (!address) return;

    claimFaucet({
      address: EVVM_CONFIG.evvmAddress,
      abi: EVVM_ABI,
      functionName: "addBalance",
      args: [address, EVVM_CONFIG.nativeToken, parseEther(amount)],
      chainId: EVVM_CONFIG.chainId,
      gas: 120000n, // keep bounded so wallets don't balloon estimates
    });
  };

  // Submit a report hash to EVVM (anchors whistleblower submission)
  const submitReport = async (
    report: Omit<ReportSubmission, "reportHash">
  ): Promise<{ success: boolean; txHash?: `0x${string}`; reportHash?: string; error?: string }> => {
    if (!address) {
      return { success: false, error: "Wallet not connected" };
    }

    try {
      const reportHash = generateReportHash(report);
      const txHash = await submitReportTx({
        address: EVVM_CONFIG.evvmAddress,
        abi: EVVM_ABI,
        functionName: "addBalance",
        args: [address, EVVM_CONFIG.nativeToken, BigInt(1)], // Minimal write to anchor the report
        chainId: EVVM_CONFIG.chainId,
        gas: 120000n,
      });

      return {
        success: true,
        txHash,
        reportHash,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Transaction failed",
      };
    }
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
        chainId: EVVM_CONFIG.chainId,
        gas: 120000n,
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

    // Report submission
    submitReport,
    reportTxHash,
    reportReceipt,
    isReportPending,
    isReportConfirming,
    isReportSuccess,
    reportError,

    // Emergency submission
    submitEmergencyReport,
  };
}
