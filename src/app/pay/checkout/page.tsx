"use client";

/**
 * Payment Link Checkout Page
 * Stripe-inspired split layout checkout
 */

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Zap,
  Shield,
  Fingerprint,
  Loader2,
  Wallet,
  ExternalLink,
  Copy,
} from "lucide-react";
import { useWallet } from "@lazorkit/wallet";
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL, TransactionInstruction } from "@solana/web3.js";
import { truncateAddress, formatAmount, isValidSolanaAddress, copyToClipboard } from "@/lib/utils/format";
import { getExplorerUrl, LAZORKIT_CONFIG } from "@/lib/lazorkit/config";
import { incrementPaymentLinkViews, incrementPaymentLinkPayments, addTransaction } from "@/lib/utils/storage";
import { buildUSDCTransferInstructions, createConnection } from "@/lib/solana/tokens";

type PaymentStatus = "idle" | "connecting" | "signing" | "confirming" | "success" | "error";

function PaymentCheckoutContent() {
  const searchParams = useSearchParams();
  const { connect, signAndSendTransaction, isConnected, smartWalletPubkey, isConnecting } = useWallet();

  // Parse URL parameters
  const recipient = searchParams.get("to") || "";
  const amount = parseFloat(searchParams.get("amount") || "0");
  const token = (searchParams.get("token") as "SOL" | "USDC") || "SOL";
  const memo = searchParams.get("memo") || "";
  const merchantName = searchParams.get("merchant") || "Payment Request";
  const linkId = searchParams.get("linkId") || "";

  // State
  const [status, setStatus] = useState<PaymentStatus>("idle");
  const [signature, setSignature] = useState("");
  const [error, setError] = useState("");
  const [viewTracked, setViewTracked] = useState(false);
  const [copied, setCopied] = useState(false);

  // Validate parameters
  const isValid = isValidSolanaAddress(recipient) && amount > 0;

  // Track view when page loads (only once)
  useEffect(() => {
    if (linkId && isValid && !viewTracked) {
      incrementPaymentLinkViews(linkId);
      setViewTracked(true);
    }
  }, [linkId, isValid, viewTracked]);

  // Handle wallet connection
  const handleConnect = async () => {
    try {
      setStatus("connecting");
      setError("");
      await connect({ feeMode: "paymaster" });
      setStatus("idle");
    } catch (err) {
      console.error("Connection error:", err);
      setError(err instanceof Error ? err.message : "Failed to connect wallet");
      setStatus("error");
    }
  };

  // Handle payment
  const handlePayment = async () => {
    if (!smartWalletPubkey) return;

    try {
      setStatus("signing");
      setError("");

      const recipientPubkey = new PublicKey(recipient);
      let instructions: TransactionInstruction[];

      if (token === "USDC") {
        // Build USDC transfer instructions (may include ATA creation)
        const connection = createConnection();
        instructions = await buildUSDCTransferInstructions({
          connection,
          from: smartWalletPubkey,
          to: recipientPubkey,
          amount,
        });
      } else {
        // SOL transfer
        instructions = [
          SystemProgram.transfer({
            fromPubkey: smartWalletPubkey,
            toPubkey: recipientPubkey,
            lamports: Math.floor(amount * LAMPORTS_PER_SOL),
          }),
        ];
      }

      setStatus("confirming");

      // Sign and send transaction with proper network configuration
      const txSignature = await signAndSendTransaction({
        instructions,
        transactionOptions: {
          clusterSimulation: LAZORKIT_CONFIG.CLUSTER,
        },
      });

      setSignature(txSignature);
      setStatus("success");

      // Track payment for the link
      if (linkId) {
        incrementPaymentLinkPayments(linkId);
      }

      // Record transactions
      if (smartWalletPubkey) {
        addTransaction({
          signature: txSignature,
          type: "outgoing",
          amount: amount,
          token: token,
          from: smartWalletPubkey.toString(),
          to: recipient,
          timestamp: Date.now(),
          status: "confirmed",
          memo: memo,
          walletAddress: smartWalletPubkey.toString(),
        });

        addTransaction({
          signature: txSignature,
          type: "incoming",
          amount: amount,
          token: token,
          from: smartWalletPubkey.toString(),
          to: recipient,
          timestamp: Date.now(),
          status: "confirmed",
          memo: memo,
          walletAddress: recipient,
        });
      }
    } catch (err) {
      console.error("Payment error:", err);

      // Parse error message for better user feedback
      let errorMessage = "Payment failed";
      if (err instanceof Error) {
        const msg = err.message.toLowerCase();
        if (msg.includes("insufficient") || msg.includes("balance")) {
          errorMessage = "Insufficient balance. Please add funds to your wallet.";
        } else if (msg.includes("cancelled") || msg.includes("canceled") || msg.includes("abort")) {
          errorMessage = "Transaction was cancelled.";
        } else if (msg.includes("timeout")) {
          errorMessage = "Transaction timed out. Please try again.";
        } else if (msg.includes("sign")) {
          errorMessage = "Signing failed. Please try again.";
        } else if (msg.includes("network") || msg.includes("connection")) {
          errorMessage = "Network error. Please check your connection.";
        } else {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);
      setStatus("error");
    }
  };

  const handleCopy = async () => {
    await copyToClipboard(signature);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Invalid link state
  if (!isValid) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-zinc-900 rounded-2xl p-8 text-center border border-white/10">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-light text-white mb-4">Invalid Payment Link</h1>
          <p className="text-zinc-400 mb-6">
            This payment link appears to be invalid or incomplete. Please check the URL and try again.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-medium transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  // Success state - full page
  if (status === "success") {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-zinc-900 rounded-2xl p-8 text-center border border-white/10">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-violet-500/20 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-violet-400" />
          </div>
          <h1 className="text-2xl font-light text-white mb-2">Payment Successful!</h1>
          <p className="text-zinc-400 mb-6">
            Your payment of {formatAmount(amount, 4)} {token} has been sent.
          </p>

          <div className="bg-zinc-950 rounded-xl p-4 mb-6">
            <p className="text-xs text-zinc-500 mb-2">Transaction ID</p>
            <div className="flex items-center justify-between gap-2">
              <p className="font-mono text-sm text-zinc-300 truncate">
                {truncateAddress(signature, 12, 12)}
              </p>
              <button
                onClick={handleCopy}
                className="text-zinc-500 hover:text-white transition-colors"
              >
                {copied ? <CheckCircle2 className="w-4 h-4 text-violet-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex gap-3">
            <a
              href={getExplorerUrl(signature)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              View on Explorer
            </a>
            <Link
              href="/dashboard"
              className="flex-1 px-4 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors text-center"
            >
              Done
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Order Summary (Dark/Violet) */}
      <div className="lg:w-1/2 bg-zinc-950 p-6 lg:p-12 flex flex-col">
        {/* Back button and logo */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/"
            className="p-2 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="LazorPay" width={28} height={28} />
            <span className="text-white font-medium">LazorPay</span>
          </Link>
        </div>

        {/* Payment Details */}
        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full lg:mx-0">
          <p className="text-zinc-400 text-sm mb-2">Pay to {merchantName}</p>
          <h1 className="text-4xl lg:text-5xl font-light text-white mb-1 tracking-tight">
            {formatAmount(amount, 4)}
            <span className="text-2xl lg:text-3xl text-zinc-500 ml-2">{token}</span>
          </h1>

          {/* Order details card */}
          <div className="mt-8 bg-zinc-900/50 rounded-xl border border-white/5 overflow-hidden">
            <div className="p-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-violet-600 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">{merchantName}</p>
                  {memo && <p className="text-sm text-zinc-500">{memo}</p>}
                </div>
                <p className="text-white font-medium">
                  {formatAmount(amount, 4)} {token}
                </p>
              </div>
            </div>

            <div className="p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 text-sm">Subtotal</span>
                <span className="text-white text-sm">
                  {formatAmount(amount, 4)} {token}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 text-sm">Network fee</span>
                <span className="text-violet-400 text-sm font-medium">Sponsored</span>
              </div>
              <div className="pt-3 border-t border-white/5 flex justify-between items-center">
                <span className="text-white font-medium">Total due today</span>
                <span className="text-white font-medium">
                  {formatAmount(amount, 4)} {token}
                </span>
              </div>
            </div>
          </div>

          {/* Powered by */}
          <div className="mt-8 flex items-center gap-2 text-zinc-600 text-sm">
            <span>Powered by</span>
            <Link href="/" className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors">
              <Image src="/logo.png" alt="LazorPay" width={16} height={16} />
              <span>LazorPay</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Right Side - Payment Form (White) */}
      <div className="lg:w-1/2 bg-white p-6 lg:p-12 flex flex-col">
        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
          <h2 className="text-xl font-medium text-zinc-900 mb-6">Payment method</h2>

          {/* Wallet Connection Card */}
          <div className="bg-zinc-50 rounded-xl border border-zinc-200 p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-violet-600" />
              </div>
              <div className="flex-1">
                <p className="text-zinc-900 font-medium">Solana Wallet</p>
                <p className="text-sm text-zinc-500">Pay with passkey authentication</p>
              </div>
              {isConnected && (
                <div className="flex items-center gap-2 px-3 py-1 bg-violet-100 rounded-full">
                  <div className="w-2 h-2 bg-violet-500 rounded-full"></div>
                  <span className="text-xs text-violet-700 font-medium">Connected</span>
                </div>
              )}
            </div>

            {isConnected && smartWalletPubkey && (
              <div className="mt-4 pt-4 border-t border-zinc-200">
                <p className="text-xs text-zinc-500 mb-1">Connected wallet</p>
                <p className="font-mono text-sm text-zinc-700">
                  {truncateAddress(smartWalletPubkey.toString(), 8, 8)}
                </p>
              </div>
            )}
          </div>

          {/* Payment Details */}
          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center py-3 border-b border-zinc-100">
              <span className="text-zinc-500">Recipient</span>
              <span className="font-mono text-sm text-zinc-700">
                {truncateAddress(recipient, 6, 6)}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-zinc-100">
              <span className="text-zinc-500">Network</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-violet-500 rounded-full"></div>
                <span className="text-zinc-700">Solana Devnet</span>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {status === "error" && error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-800 font-medium">Payment failed</p>
                  <p className="text-sm text-red-600 mt-1">{error}</p>
                </div>
              </div>
              <button
                onClick={() => setStatus("idle")}
                className="mt-3 text-sm text-red-600 hover:text-red-800 font-medium"
              >
                Try again
              </button>
            </div>
          )}

          {/* Action Button */}
          {!isConnected ? (
            <button
              onClick={handleConnect}
              disabled={status === "connecting" || isConnecting}
              className="w-full py-4 px-6 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === "connecting" ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <Fingerprint className="w-5 h-5" />
                  <span>Connect Wallet</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handlePayment}
              disabled={status === "signing" || status === "confirming"}
              className="w-full py-4 px-6 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  <Zap className="w-5 h-5" />
                  <span>Pay {formatAmount(amount, 4)} {token}</span>
                </>
              )}
            </button>
          )}

          {/* Security badges */}
          <div className="mt-6 flex items-center justify-center gap-6 text-zinc-400 text-xs">
            <div className="flex items-center gap-1.5">
              <Shield className="w-4 h-4" />
              <span>Secured by LazorKit</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Fingerprint className="w-4 h-4" />
              <span>Passkey Protected</span>
            </div>
          </div>

          {/* Terms */}
          <p className="mt-6 text-center text-xs text-zinc-400">
            By continuing, you agree to our{" "}
            <Link href="/docs" className="text-zinc-600 hover:text-zinc-900 underline">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/docs" className="text-zinc-600 hover:text-zinc-900 underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PaymentCheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full" />
        </div>
      }
    >
      <PaymentCheckoutContent />
    </Suspense>
  );
}
