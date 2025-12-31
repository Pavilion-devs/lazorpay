"use client";

/**
 * Payment Link Checkout Page
 * Handles incoming payment links and processes payments
 */

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Zap,
  Shield,
  Fingerprint,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { LazorPayButton } from "@/components/payment/LazorPayButton";
import { truncateAddress, formatAmount, isValidSolanaAddress } from "@/lib/utils/format";

function PaymentCheckoutContent() {
  const searchParams = useSearchParams();

  // Parse URL parameters
  const recipient = searchParams.get("to") || "";
  const amount = parseFloat(searchParams.get("amount") || "0");
  const token = (searchParams.get("token") as "SOL" | "USDC") || "SOL";
  const memo = searchParams.get("memo") || "";
  const merchantName = searchParams.get("merchant") || "Payment Request";

  // State
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [lastSignature, setLastSignature] = useState("");

  // Validate parameters
  const isValid = isValidSolanaAddress(recipient) && amount > 0;

  const handlePaymentSuccess = (result: { signature: string }) => {
    setPaymentSuccess(true);
    setLastSignature(result.signature);
  };

  if (!isValid) {
    return (
      <div className="min-h-screen">
        <Header />

        <main className="py-20">
          <div className="max-w-md mx-auto px-4 text-center">
            <div className="glass-card p-8">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
              <h1 className="text-2xl font-light text-white mb-4">
                Invalid Payment Link
              </h1>
              <p className="text-white/60 mb-6">
                This payment link appears to be invalid or incomplete. Please
                check the URL and try again.
              </p>
              <Link href="/" className="glow-button inline-flex px-6 py-2.5">
                Return Home
              </Link>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />

      <main className="py-12">
        <div className="max-w-md mx-auto px-4">
          {/* Back link */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          {/* Payment Card */}
          <div className="glass-card p-8">
            {paymentSuccess ? (
              /* Success State */
              <div className="text-center py-4">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                </div>
                <h1 className="text-2xl font-light text-white mb-2">
                  Payment Successful!
                </h1>
                <p className="text-white/60 mb-6">
                  Your payment of {formatAmount(amount, 4)} {token} has been
                  sent.
                </p>

                <div className="bg-white/5 rounded-xl p-4 mb-6">
                  <p className="text-xs text-white/40 mb-1">Transaction ID</p>
                  <p className="font-mono text-sm text-white/80 break-all">
                    {truncateAddress(lastSignature, 12, 12)}
                  </p>
                </div>

                <a
                  href={`https://explorer.solana.com/tx/${lastSignature}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 text-sm hover:underline"
                >
                  View on Solana Explorer →
                </a>
              </div>
            ) : (
              /* Payment Form */
              <>
                {/* Merchant Info */}
                <div className="text-center mb-6">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-black" />
                  </div>
                  <h1 className="text-xl font-medium text-white">
                    {merchantName}
                  </h1>
                  {memo && (
                    <p className="text-white/50 text-sm mt-1">{memo}</p>
                  )}
                </div>

                {/* Amount Display */}
                <div className="bg-white/5 rounded-xl p-6 mb-6 text-center">
                  <p className="text-white/50 text-sm mb-1">Amount Due</p>
                  <p className="text-4xl font-bold text-white">
                    {formatAmount(amount, 4)}{" "}
                    <span className="text-2xl text-white/60">{token}</span>
                  </p>
                </div>

                {/* Payment Details */}
                <div className="space-y-3 mb-6 pb-6 border-b border-white/10">
                  <div className="flex justify-between items-center">
                    <span className="text-white/60 text-sm">Recipient</span>
                    <span className="font-mono text-sm text-white/80">
                      {truncateAddress(recipient)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/60 text-sm">Network</span>
                    <span className="text-white/80 text-sm">Solana Devnet</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/60 text-sm">Network Fee</span>
                    <span className="text-emerald-400 font-medium text-sm">
                      Sponsored (Free)
                    </span>
                  </div>
                </div>

                {/* Pay Button */}
                <LazorPayButton
                  recipient={recipient}
                  amount={amount}
                  token={token}
                  memo={memo}
                  merchantName={merchantName}
                  onSuccess={handlePaymentSuccess}
                  variant="default"
                  size="lg"
                  className="w-full"
                  label={`Pay ${formatAmount(amount, 4)} ${token}`}
                />

                {/* Security Info */}
                <div className="mt-6 pt-6 border-t border-white/10">
                  <div className="flex items-center justify-center gap-6 text-white/40 text-xs">
                    <div className="flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5" />
                      <span>Secured by LazorKit</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Fingerprint className="w-3.5 h-3.5" />
                      <span>Passkey Protected</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* How it works */}
          <div className="mt-8 text-center">
            <p className="text-white/40 text-sm mb-4">How does this work?</p>
            <div className="grid grid-cols-3 gap-4 text-center">
              {[
                { step: "1", label: "Connect" },
                { step: "2", label: "Verify" },
                { step: "3", label: "Done" },
              ].map((item) => (
                <div key={item.step}>
                  <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-white/5 flex items-center justify-center text-white/60 text-sm">
                    {item.step}
                  </div>
                  <p className="text-white/50 text-xs">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function PaymentCheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full" />
        </div>
      }
    >
      <PaymentCheckoutContent />
    </Suspense>
  );
}
