"use client";

import { useAppKit } from "@reown/appkit/react";
import { useEVVM } from "@/hooks/useEVVM";
import { EVVM_CONFIG, formatBalance, shortenAddress, getContractExplorerUrl } from "@/lib/evvm";
import { Button, Card } from "@/components/ui";

export function WalletPanel() {
  const { open } = useAppKit();
  const {
    isConnected,
    address,
    balance,
    refetchBalance,
    claimFaucet,
    isFaucetPending,
    isFaucetConfirming,
    isFaucetSuccess,
    faucetError,
  } = useEVVM();

  const handleConnect = () => {
    open();
  };

  const handleClaimFaucet = async () => {
    await claimFaucet("1");
    // Refetch balance after successful claim
    setTimeout(() => refetchBalance(), 2000);
  };

  if (!isConnected) {
    return (
      <Card className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-sigilo-teal/20 rounded-lg flex items-center justify-center">
            <svg
              className="w-5 h-5 text-sigilo-teal"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-sigilo-text-primary">
              Connect Wallet
            </h3>
            <p className="text-xs text-sigilo-text-muted">
              Connect to interact with EVVM
            </p>
          </div>
        </div>

        <p className="text-sm text-sigilo-text-secondary">
          Connect your wallet to claim testnet tokens and submit emergency reports
          to the EVVM blockchain on Sepolia.
        </p>

        <Button onClick={handleConnect} className="w-full">
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
            />
          </svg>
          Connect Wallet
        </Button>

        {/* Network badge */}
        <div className="flex items-center justify-center gap-2">
          <span className="px-2 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-xs font-medium text-amber-400">
            Sepolia Testnet
          </span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
            <svg
              className="w-5 h-5 text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-sigilo-text-primary">
              Wallet Connected
            </h3>
            <p className="text-xs font-mono text-sigilo-text-muted">
              {shortenAddress(address!)}
            </p>
          </div>
        </div>

        <button
          onClick={handleConnect}
          className="text-xs text-sigilo-text-muted hover:text-sigilo-text-secondary"
        >
          Switch
        </button>
      </div>

      {/* Balance */}
      <div className="bg-sigilo-surface/50 rounded-lg p-4 border border-sigilo-border/30">
        <p className="text-xs text-sigilo-text-muted mb-1">EVVM Balance</p>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-sigilo-text-primary">
            {balance ? formatBalance(balance) : "0.0000"}
          </span>
          <span className="text-sm text-sigilo-text-muted">ETH</span>
        </div>
      </div>

      {/* Faucet */}
      <div className="space-y-2">
        <Button
          onClick={handleClaimFaucet}
          disabled={isFaucetPending || isFaucetConfirming}
          isLoading={isFaucetPending || isFaucetConfirming}
          className="w-full"
          variant="secondary"
        >
          {isFaucetPending
            ? "Confirming..."
            : isFaucetConfirming
            ? "Processing..."
            : "Claim 1 ETH from Faucet"}
        </Button>

        {isFaucetSuccess && (
          <p className="text-xs text-green-400 text-center">
            Faucet claimed successfully!
          </p>
        )}

        {faucetError && (
          <p className="text-xs text-sigilo-red text-center">
            {faucetError.message}
          </p>
        )}
      </div>

      {/* Contract Link */}
      <a
        href={getContractExplorerUrl()}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 text-xs text-sigilo-text-muted hover:text-sigilo-teal transition-colors"
      >
        <span>View EVVM Contract</span>
        <svg
          className="w-3 h-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
          />
        </svg>
      </a>

      {/* Network badge */}
      <div className="flex items-center justify-center gap-2 pt-2 border-t border-sigilo-border/30">
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        <span className="text-xs text-sigilo-text-muted">
          Connected to {EVVM_CONFIG.chainName}
        </span>
      </div>
    </Card>
  );
}
