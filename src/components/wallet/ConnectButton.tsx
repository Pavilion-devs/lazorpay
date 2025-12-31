"use client";

/**
 * ConnectButton Component
 * Handles wallet connection via LazorKit passkey authentication
 */

import { useWallet } from "@lazorkit/wallet";
import { Fingerprint, Loader2, LogOut, Wallet } from "lucide-react";
import { truncateAddress } from "@/lib/utils/format";

interface ConnectButtonProps {
  className?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

export function ConnectButton({
  className = "",
  variant = "default",
  size = "md",
}: ConnectButtonProps) {
  const { connect, disconnect, isConnected, isConnecting, wallet, smartWalletPubkey } = useWallet();

  const handleConnect = async () => {
    try {
      await connect({ feeMode: "paymaster" });
    } catch (error) {
      console.error("Failed to connect:", error);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
    } catch (error) {
      console.error("Failed to disconnect:", error);
    }
  };

  // Size classes
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm gap-1.5",
    md: "px-4 py-2.5 text-sm gap-2",
    lg: "px-6 py-3 text-base gap-2",
  };

  // Variant classes
  const variantClasses = {
    default:
      "bg-emerald-500 hover:bg-emerald-400 text-black font-semibold shadow-lg shadow-emerald-500/20",
    outline:
      "bg-transparent border border-white/20 hover:bg-white/5 text-white",
    ghost: "bg-white/5 hover:bg-white/10 text-white",
  };

  const baseClasses = `
    inline-flex items-center justify-center rounded-xl font-medium
    transition-all duration-200 ease-out
    disabled:opacity-50 disabled:cursor-not-allowed
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${className}
  `;

  // Loading state
  if (isConnecting) {
    return (
      <button className={baseClasses} disabled>
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Connecting...</span>
      </button>
    );
  }

  // Connected state
  if (isConnected && smartWalletPubkey) {
    return (
      <div className="flex items-center gap-2">
        <div className={`${baseClasses} cursor-default`}>
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono">
            {truncateAddress(smartWalletPubkey.toString())}
          </span>
        </div>
        <button
          onClick={handleDisconnect}
          className="p-2.5 rounded-xl bg-white/5 hover:bg-red-500/20 text-white/60 hover:text-red-400 transition-all"
          title="Disconnect wallet"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // Disconnected state
  return (
    <button onClick={handleConnect} className={baseClasses}>
      <Fingerprint className="w-4 h-4" />
      <span>Connect Wallet</span>
    </button>
  );
}

/**
 * Compact wallet display for headers
 */
export function WalletBadge() {
  const { isConnected, smartWalletPubkey, disconnect } = useWallet();

  if (!isConnected || !smartWalletPubkey) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
      <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-emerald-500 to-cyan-500" />
      <span className="text-sm font-mono text-white/80">
        {truncateAddress(smartWalletPubkey.toString())}
      </span>
      <button
        onClick={() => disconnect()}
        className="ml-1 text-white/40 hover:text-white transition-colors"
      >
        <LogOut className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
