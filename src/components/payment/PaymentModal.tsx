"use client";

/**
 * PaymentModal Component
 * Modal for processing payments with LazorKit
 */

import { useState } from "react";
import { useWallet } from "@lazorkit/wallet";
import {
  X,
  Fingerprint,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Copy,
  Wallet,
} from "lucide-react";
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { truncateAddress, formatAmount, copyToClipboard } from "@/lib/utils/format";
import { getExplorerUrl, getTokenAddress } from "@/lib/lazorkit/config";
import type { PaymentStatus, PaymentResult } from "@/types";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipient: string;
  amount: number;
  token?: "USDC" | "SOL";
  memo?: string;
  merchantName?: string;
  onSuccess?: (result: PaymentResult) => void;
  onError?: (error: Error) => void;
}

export function PaymentModal({
  isOpen,
  onClose,
  recipient,
  amount,
  token = "SOL",
  memo,
  merchantName,
  onSuccess,
  onError,
}: PaymentModalProps) {
  const { connect, signAndSendTransaction, isConnected, smartWalletPubkey, isConnecting } =
    useWallet();

  const [status, setStatus] = useState<PaymentStatus>("idle");
  const [signature, setSignature] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [copied, setCopied] = useState(false);

  // Handle wallet connection
  const handleConnect = async () => {
    try {
      setStatus("connecting");
      await connect({ feeMode: "paymaster" });
      setStatus("idle");
    } catch (err) {
      setError("Failed to connect wallet");
      setStatus("error");
    }
  };

  // Handle payment
  const handlePayment = async () => {
    if (!smartWalletPubkey) return;

    try {
      setStatus("signing");
      setError("");

      // Create transfer instruction
      const recipientPubkey = new PublicKey(recipient);

      // For now, we'll handle SOL transfers
      // USDC transfers would require SPL token program instructions
      const instruction = SystemProgram.transfer({
        fromPubkey: smartWalletPubkey,
        toPubkey: recipientPubkey,
        lamports: Math.floor(amount * LAMPORTS_PER_SOL),
      });

      setStatus("confirming");

      // Sign and send transaction
      const txSignature = await signAndSendTransaction({
        instructions: [instruction],
        transactionOptions: {
          // Use USDC for gas fees (gasless for user)
          feeToken: getTokenAddress("USDC"),
        },
      });

      setSignature(txSignature);
      setStatus("success");

      onSuccess?.({
        signature: txSignature,
        status: "success",
      });
    } catch (err) {
      console.error("Payment error:", err);
      const errorMessage = err instanceof Error ? err.message : "Payment failed";
      setError(errorMessage);
      setStatus("error");
      onError?.(err instanceof Error ? err : new Error(errorMessage));
    }
  };

  // Handle copy signature
  const handleCopy = async () => {
    await copyToClipboard(signature);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Close and reset
  const handleClose = () => {
    setStatus("idle");
    setSignature("");
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 glass-card p-6 animate-fade-in">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-white">
            {status === "success" ? "Payment Successful!" : "Pay with LazorPay"}
          </h2>
          {merchantName && status !== "success" && (
            <p className="text-white/60 text-sm mt-1">Paying to {merchantName}</p>
          )}
        </div>

        {/* Success State */}
        {status === "success" && (
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>

            <p className="text-white/80 mb-4">
              You sent <span className="font-semibold text-white">{formatAmount(amount)} {token}</span>
            </p>

            {/* Transaction hash */}
            <div className="bg-white/5 rounded-lg p-3 mb-4">
              <p className="text-xs text-white/40 mb-1">Transaction</p>
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-sm text-white/80 truncate">
                  {truncateAddress(signature, 8, 8)}
                </span>
                <button
                  onClick={handleCopy}
                  className="text-white/40 hover:text-white transition-colors"
                >
                  {copied ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <a
                href={getExplorerUrl(signature)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 text-sm font-medium transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                View on Explorer
              </a>
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-semibold transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {/* Error State */}
        {status === "error" && (
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>

            <p className="text-red-400 mb-4">{error}</p>

            <button
              onClick={() => setStatus("idle")}
              className="w-full px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Payment Form */}
        {status !== "success" && status !== "error" && (
          <>
            {/* Amount display */}
            <div className="text-center mb-6">
              <div className="text-4xl font-bold text-white mb-1">
                {formatAmount(amount)} {token}
              </div>
              <p className="text-white/40 text-sm">
                To: {truncateAddress(recipient)}
              </p>
              {memo && (
                <p className="text-white/60 text-sm mt-2 italic">"{memo}"</p>
              )}
            </div>

            {/* Fee info */}
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 mb-6">
              <div className="flex items-center gap-2 text-emerald-400 text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>Network fee: <strong>Sponsored (Free!)</strong></span>
              </div>
            </div>

            {/* Connect or Pay button */}
            {!isConnected ? (
              <button
                onClick={handleConnect}
                disabled={isConnecting || status === "connecting"}
                className="w-full glow-button flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {status === "connecting" ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <Wallet className="w-5 h-5" />
                    <span>Connect Wallet</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handlePayment}
                disabled={status === "signing" || status === "confirming"}
                className="w-full glow-button flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {status === "signing" ? (
                  <>
                    <Fingerprint className="w-5 h-5 animate-pulse" />
                    <span>Sign with Passkey...</span>
                  </>
                ) : status === "confirming" ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Confirming...</span>
                  </>
                ) : (
                  <>
                    <Fingerprint className="w-5 h-5" />
                    <span>Pay with Passkey</span>
                  </>
                )}
              </button>
            )}

            {/* Connected wallet info */}
            {isConnected && smartWalletPubkey && (
              <p className="text-center text-white/40 text-xs mt-3">
                Paying from: {truncateAddress(smartWalletPubkey.toString())}
              </p>
            )}
          </>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-white/10 text-center">
          <p className="text-white/30 text-xs">
            Powered by{" "}
            <a
              href="https://docs.lazorkit.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/50 hover:text-white transition-colors"
            >
              LazorKit
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
