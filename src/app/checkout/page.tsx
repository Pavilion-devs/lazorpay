"use client";

/**
 * Checkout Demo Page
 * Interactive demo of the payment flow
 */

import { useState } from "react";
import { useWallet } from "@lazorkit/wallet";
import {
  ArrowLeft,
  Fingerprint,
  CheckCircle2,
  CreditCard,
  Zap,
  ShoppingBag,
} from "lucide-react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ConnectButton } from "@/components/wallet/ConnectButton";
import { LazorPayButton } from "@/components/payment/LazorPayButton";
import { truncateAddress, formatAmount } from "@/lib/utils/format";

// Demo products
const demoProducts = [
  {
    id: 1,
    name: "Premium Subscription",
    description: "Monthly access to all features",
    price: 0.01,
    token: "SOL" as const,
  },
  {
    id: 2,
    name: "One-Time Purchase",
    description: "Lifetime access to the starter pack",
    price: 0.005,
    token: "SOL" as const,
  },
  {
    id: 3,
    name: "Custom Amount",
    description: "Enter your own amount",
    price: 0,
    token: "SOL" as const,
    customAmount: true,
  },
];

// Demo merchant wallet
const MERCHANT_WALLET = "hij78MKbJSSs15qvkHWTDCtnmba2c1W4r1V22g5sD8w";

export default function CheckoutPage() {
  const { isConnected, smartWalletPubkey } = useWallet();
  const [selectedProduct, setSelectedProduct] = useState(demoProducts[0]);
  const [customAmount, setCustomAmount] = useState("0.01");
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [lastSignature, setLastSignature] = useState("");

  const handlePaymentSuccess = (result: { signature: string }) => {
    setPaymentSuccess(true);
    setLastSignature(result.signature);
  };

  const getAmount = () => {
    if (selectedProduct.customAmount) {
      return parseFloat(customAmount) || 0;
    }
    return selectedProduct.price;
  };

  return (
    <div className="min-h-screen">
      <Header />

      <main className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back link */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left: Product Selection */}
            <div>
              <h1 className="text-3xl font-light tracking-tight mb-2">
                Checkout Demo
              </h1>
              <p className="text-white/60 mb-8">
                Try the LazorPay payment flow with test transactions on Solana Devnet.
              </p>

              {/* Product Cards */}
              <div className="space-y-4 mb-8">
                {demoProducts.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => {
                      setSelectedProduct(product);
                      setPaymentSuccess(false);
                    }}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      selectedProduct.id === product.id
                        ? "bg-emerald-500/10 border-emerald-500/50"
                        : "bg-white/5 border-white/10 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            selectedProduct.id === product.id
                              ? "bg-emerald-500/20"
                              : "bg-white/10"
                          }`}
                        >
                          <ShoppingBag
                            className={`w-5 h-5 ${
                              selectedProduct.id === product.id
                                ? "text-emerald-400"
                                : "text-white/60"
                            }`}
                          />
                        </div>
                        <div>
                          <h3 className="font-medium text-white">
                            {product.name}
                          </h3>
                          <p className="text-sm text-white/50">
                            {product.description}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {product.customAmount ? (
                          <span className="text-white/60">Custom</span>
                        ) : (
                          <span className="text-lg font-semibold text-white">
                            {formatAmount(product.price, 4)} {product.token}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Custom Amount Input */}
              {selectedProduct.customAmount && (
                <div className="mb-8">
                  <label className="block text-sm text-white/60 mb-2">
                    Enter Amount (SOL)
                  </label>
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    step="0.001"
                    min="0.001"
                    className="input-glass text-lg"
                    placeholder="0.01"
                  />
                </div>
              )}

              {/* Features */}
              <div className="glass-card p-6">
                <h3 className="font-medium text-white mb-4">
                  What you&apos;re testing:
                </h3>
                <ul className="space-y-3">
                  {[
                    "Passkey wallet connection",
                    "Gasless transaction (fee sponsored)",
                    "SOL transfer on Devnet",
                    "Real-time transaction confirmation",
                  ].map((feature, index) => (
                    <li
                      key={index}
                      className="flex items-center gap-3 text-white/70"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right: Payment Summary */}
            <div>
              <div className="glass-card p-8 sticky top-8">
                <h2 className="text-xl font-medium text-white mb-6">
                  Order Summary
                </h2>

                {/* Order Details */}
                <div className="space-y-4 mb-6 pb-6 border-b border-white/10">
                  <div className="flex justify-between">
                    <span className="text-white/60">{selectedProduct.name}</span>
                    <span className="text-white">
                      {formatAmount(getAmount(), 4)} {selectedProduct.token}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Network Fee</span>
                    <span className="text-emerald-400 font-medium">
                      Sponsored (Free)
                    </span>
                  </div>
                </div>

                {/* Total */}
                <div className="flex justify-between mb-8">
                  <span className="text-lg font-medium text-white">Total</span>
                  <span className="text-2xl font-bold text-white">
                    {formatAmount(getAmount(), 4)} {selectedProduct.token}
                  </span>
                </div>

                {/* Recipient */}
                <div className="bg-white/5 rounded-lg p-3 mb-6">
                  <p className="text-xs text-white/40 mb-1">Paying to</p>
                  <p className="font-mono text-sm text-white/80">
                    {truncateAddress(MERCHANT_WALLET, 8, 8)}
                  </p>
                </div>

                {/* Payment Success */}
                {paymentSuccess ? (
                  <div className="text-center py-4">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h3 className="text-lg font-medium text-white mb-2">
                      Payment Successful!
                    </h3>
                    <p className="text-white/60 text-sm mb-4">
                      Your test transaction was processed.
                    </p>
                    <a
                      href={`https://explorer.solana.com/tx/${lastSignature}?cluster=devnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 text-sm hover:underline"
                    >
                      View on Explorer →
                    </a>
                    <button
                      onClick={() => setPaymentSuccess(false)}
                      className="block w-full mt-4 px-4 py-2 rounded-lg bg-white/10 text-white text-sm hover:bg-white/20 transition-colors"
                    >
                      Make Another Payment
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Connection Status */}
                    {!isConnected ? (
                      <div className="text-center">
                        <p className="text-white/60 text-sm mb-4">
                          Connect your wallet to continue
                        </p>
                        <ConnectButton className="w-full" />
                      </div>
                    ) : (
                      <>
                        <div className="mb-4 p-3 rounded-lg bg-white/5 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-400" />
                            <span className="text-sm text-white/80">
                              Connected
                            </span>
                          </div>
                          <span className="font-mono text-xs text-white/60">
                            {smartWalletPubkey && truncateAddress(smartWalletPubkey.toString())}
                          </span>
                        </div>

                        <LazorPayButton
                          recipient={MERCHANT_WALLET}
                          amount={getAmount()}
                          token={selectedProduct.token}
                          merchantName="LazorPay Demo Store"
                          memo={`Purchase: ${selectedProduct.name}`}
                          onSuccess={handlePaymentSuccess}
                          variant="default"
                          size="lg"
                          className="w-full"
                          label={`Pay ${formatAmount(getAmount(), 4)} ${selectedProduct.token}`}
                        />
                      </>
                    )}
                  </>
                )}

                {/* Security note */}
                <p className="text-center text-white/40 text-xs mt-6">
                  Secured by LazorKit • Powered by Solana
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
