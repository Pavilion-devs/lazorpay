"use client";

import { useState } from "react";
import { useWallet } from "@lazorkit/wallet";
import { SystemProgram, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";

interface CheckoutProps {
  recipient: string;
  amount: number;
  token?: "SOL" | "USDC";
  merchantName?: string;
  memo?: string;
  onSuccess?: (signature: string) => void;
  onError?: (error: Error) => void;
}

type Status = "idle" | "connecting" | "processing" | "success" | "error";

export function Checkout({
  recipient,
  amount,
  token = "SOL",
  merchantName,
  memo,
  onSuccess,
  onError,
}: CheckoutProps) {
  const {
    isConnected,
    isConnecting,
    connect,
    disconnect,
    smartWalletPubkey,
    signAndSendTransaction,
  } = useWallet();

  const [status, setStatus] = useState<Status>("idle");
  const [signature, setSignature] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleConnect = async () => {
    try {
      setStatus("connecting");
      await connect({ feeMode: "paymaster" });
      setStatus("idle");
    } catch (err) {
      setError("Failed to connect");
      setStatus("error");
    }
  };

  const handlePayment = async () => {
    if (!smartWalletPubkey) return;

    try {
      setStatus("processing");
      setError("");

      // Build SOL transfer instruction
      const instruction = SystemProgram.transfer({
        fromPubkey: smartWalletPubkey,
        toPubkey: new PublicKey(recipient),
        lamports: Math.floor(amount * LAMPORTS_PER_SOL),
      });

      // Sign and send with gasless option
      const txSignature = await signAndSendTransaction({
        instructions: [instruction],
        transactionOptions: {
          clusterSimulation: "devnet",
        },
      });

      setSignature(txSignature);
      setStatus("success");
      onSuccess?.(txSignature);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Payment failed";
      setError(errorMessage);
      setStatus("error");
      onError?.(err instanceof Error ? err : new Error(errorMessage));
    }
  };

  const resetPayment = () => {
    setStatus("idle");
    setSignature("");
    setError("");
  };

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
      {/* Order Summary */}
      <div className="mb-6 pb-6 border-b border-zinc-800">
        <div className="flex justify-between mb-2">
          <span className="text-zinc-400">{merchantName || "Payment"}</span>
          <span className="font-semibold">
            {amount} {token}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-zinc-500">Network Fee</span>
          <span className="text-green-400">Sponsored (Free)</span>
        </div>
        {memo && (
          <p className="text-zinc-500 text-sm mt-2 italic">&quot;{memo}&quot;</p>
        )}
      </div>

      {/* Success State */}
      {status === "success" && (
        <div className="text-center py-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Payment Successful!</h3>
          <a
            href={`https://explorer.solana.com/tx/${signature}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-violet-400 text-sm hover:underline"
          >
            View on Explorer →
          </a>
          <button
            onClick={resetPayment}
            className="block w-full mt-4 py-2 px-4 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition"
          >
            Make Another Payment
          </button>
        </div>
      )}

      {/* Error State */}
      {status === "error" && (
        <div className="text-center py-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Payment Failed</h3>
          <p className="text-red-400 text-sm mb-4">{error}</p>
          <button
            onClick={resetPayment}
            className="py-2 px-4 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Payment Flow */}
      {status !== "success" && status !== "error" && (
        <>
          {!isConnected ? (
            <button
              onClick={handleConnect}
              disabled={isConnecting || status === "connecting"}
              className="w-full py-3 px-6 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 rounded-xl font-semibold transition flex items-center justify-center gap-2"
            >
              {status === "connecting" ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Connecting...
                </>
              ) : (
                "Connect with Passkey"
              )}
            </button>
          ) : (
            <>
              <div className="mb-4 p-3 bg-zinc-800/50 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                  <span className="text-sm">Connected</span>
                </div>
                <span className="text-xs text-zinc-500 font-mono">
                  {smartWalletPubkey?.toString().slice(0, 8)}...
                </span>
              </div>

              <button
                onClick={handlePayment}
                disabled={status === "processing"}
                className="w-full py-3 px-6 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 rounded-xl font-semibold transition flex items-center justify-center gap-2"
              >
                {status === "processing" ? (
                  <>
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839-1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                    </svg>
                    Pay with Passkey
                  </>
                )}
              </button>

              <button
                onClick={disconnect}
                className="w-full mt-2 py-2 text-sm text-zinc-500 hover:text-white transition"
              >
                Disconnect
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
}

