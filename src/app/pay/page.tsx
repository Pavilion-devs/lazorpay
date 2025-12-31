"use client";

/**
 * Payment Link Generator Page
 * Create shareable payment links for receiving payments
 */

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Copy,
  Check,
  Link as LinkIcon,
  QrCode,
  Wallet,
  Zap,
  Share2,
  ExternalLink,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { LazorPayButton } from "@/components/payment/LazorPayButton";
import { formatAmount, isValidSolanaAddress } from "@/lib/utils/format";

type Token = "SOL" | "USDC";

export default function PaymentLinkPage() {
  // Form state
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [token, setToken] = useState<Token>("SOL");
  const [memo, setMemo] = useState("");
  const [merchantName, setMerchantName] = useState("");

  // UI state
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [linkGenerated, setLinkGenerated] = useState(false);

  // Validate form
  const isValidForm = useMemo(() => {
    return (
      isValidSolanaAddress(recipientAddress) &&
      parseFloat(amount) > 0
    );
  }, [recipientAddress, amount]);

  // Generate payment link
  const paymentLink = useMemo(() => {
    if (!isValidForm) return "";

    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    const params = new URLSearchParams({
      to: recipientAddress,
      amount: amount,
      token: token,
    });

    if (memo) params.set("memo", memo);
    if (merchantName) params.set("merchant", merchantName);

    return `${baseUrl}/pay/checkout?${params.toString()}`;
  }, [isValidForm, recipientAddress, amount, token, memo, merchantName]);

  // Copy link to clipboard
  const copyLink = async () => {
    if (!paymentLink) return;

    try {
      await navigator.clipboard.writeText(paymentLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // Share link
  const shareLink = async () => {
    if (!paymentLink || typeof navigator.share !== "function") return;

    try {
      await navigator.share({
        title: merchantName || "Payment Request",
        text: `Pay ${amount} ${token} via LazorPay`,
        url: paymentLink,
      });
    } catch (err) {
      // User cancelled or share failed
      console.log("Share cancelled");
    }
  };

  const handleGenerateLink = () => {
    if (isValidForm) {
      setLinkGenerated(true);
    }
  };

  return (
    <div className="min-h-screen">
      <Header />

      <main className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back link */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left: Form */}
            <div>
              <h1 className="text-3xl font-light tracking-tight mb-2">
                Create Payment Link
              </h1>
              <p className="text-white/60 mb-8">
                Generate a shareable link to receive payments instantly. No account
                required for payers.
              </p>

              <div className="space-y-6">
                {/* Recipient Address */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Your Wallet Address *
                  </label>
                  <div className="relative">
                    <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                      type="text"
                      value={recipientAddress}
                      onChange={(e) => {
                        setRecipientAddress(e.target.value);
                        setLinkGenerated(false);
                      }}
                      placeholder="Enter your Solana wallet address"
                      className="input-glass pl-11 w-full"
                    />
                  </div>
                  {recipientAddress && !isValidSolanaAddress(recipientAddress) && (
                    <p className="text-red-400 text-xs mt-1">
                      Please enter a valid Solana address
                    </p>
                  )}
                </div>

                {/* Amount and Token */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Amount *
                    </label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => {
                        setAmount(e.target.value);
                        setLinkGenerated(false);
                      }}
                      placeholder="0.00"
                      step="0.001"
                      min="0"
                      className="input-glass w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Token
                    </label>
                    <select
                      value={token}
                      onChange={(e) => {
                        setToken(e.target.value as Token);
                        setLinkGenerated(false);
                      }}
                      className="input-glass w-full cursor-pointer"
                    >
                      <option value="SOL">SOL</option>
                      <option value="USDC">USDC</option>
                    </select>
                  </div>
                </div>

                {/* Merchant Name (optional) */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Business Name{" "}
                    <span className="text-white/40">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={merchantName}
                    onChange={(e) => {
                      setMerchantName(e.target.value);
                      setLinkGenerated(false);
                    }}
                    placeholder="Your Store Name"
                    className="input-glass w-full"
                  />
                </div>

                {/* Memo (optional) */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Memo <span className="text-white/40">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={memo}
                    onChange={(e) => {
                      setMemo(e.target.value);
                      setLinkGenerated(false);
                    }}
                    placeholder="Payment for..."
                    className="input-glass w-full"
                  />
                </div>

                {/* Generate Button */}
                <button
                  onClick={handleGenerateLink}
                  disabled={!isValidForm}
                  className={`w-full py-3 px-6 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                    isValidForm
                      ? "glow-button"
                      : "bg-white/10 text-white/40 cursor-not-allowed"
                  }`}
                >
                  <LinkIcon className="w-5 h-5" />
                  Generate Payment Link
                </button>
              </div>
            </div>

            {/* Right: Preview & Link */}
            <div>
              <div className="glass-card p-8 sticky top-8">
                <h2 className="text-xl font-medium text-white mb-6 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-emerald-400" />
                  {linkGenerated ? "Your Payment Link" : "Preview"}
                </h2>

                {/* Payment Preview Card */}
                <div className="bg-white/5 rounded-xl p-6 mb-6">
                  <div className="text-center">
                    <p className="text-white/60 text-sm mb-2">
                      {merchantName || "Payment Request"}
                    </p>
                    <p className="text-3xl font-bold text-white mb-1">
                      {amount ? formatAmount(parseFloat(amount), 4) : "0.00"}{" "}
                      {token}
                    </p>
                    {memo && (
                      <p className="text-white/50 text-sm mt-2">{memo}</p>
                    )}
                  </div>
                </div>

                {linkGenerated && isValidForm ? (
                  <>
                    {/* QR Code Toggle */}
                    <div className="flex items-center justify-center mb-6">
                      <button
                        onClick={() => setShowQR(!showQR)}
                        className="flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                      >
                        <QrCode className="w-4 h-4" />
                        {showQR ? "Hide" : "Show"} QR Code
                      </button>
                    </div>

                    {/* QR Code */}
                    {showQR && (
                      <div className="flex justify-center mb-6">
                        <div className="bg-white p-4 rounded-xl">
                          <QRCodeSVG
                            value={paymentLink}
                            size={180}
                            level="H"
                            includeMargin={false}
                          />
                        </div>
                      </div>
                    )}

                    {/* Generated Link */}
                    <div className="mb-4">
                      <label className="block text-sm text-white/60 mb-2">
                        Payment Link
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={paymentLink}
                          readOnly
                          className="input-glass flex-1 text-sm font-mono"
                        />
                        <button
                          onClick={copyLink}
                          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-2"
                        >
                          {copied ? (
                            <Check className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={shareLink}
                        className="flex-1 py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center justify-center gap-2"
                      >
                        <Share2 className="w-4 h-4" />
                        Share
                      </button>
                      <a
                        href={paymentLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center justify-center gap-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Open
                      </a>
                    </div>

                    {/* Test Payment */}
                    <div className="mt-6 pt-6 border-t border-white/10">
                      <p className="text-sm text-white/50 mb-3 text-center">
                        Test your payment link
                      </p>
                      <LazorPayButton
                        recipient={recipientAddress}
                        amount={parseFloat(amount)}
                        token={token}
                        memo={memo}
                        merchantName={merchantName}
                        variant="outline"
                        size="md"
                        className="w-full"
                      />
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                      <LinkIcon className="w-8 h-8 text-white/30" />
                    </div>
                    <p className="text-white/50 text-sm">
                      Fill in the details to generate your payment link
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Use Cases */}
          <div className="mt-16 grid md:grid-cols-3 gap-6">
            {[
              {
                title: "Online Stores",
                description:
                  "Embed payment buttons on your website for instant checkout.",
              },
              {
                title: "Invoicing",
                description:
                  "Send payment links to clients via email or messaging apps.",
              },
              {
                title: "Donations",
                description:
                  "Accept tips and donations with zero friction for supporters.",
              },
            ].map((useCase) => (
              <div key={useCase.title} className="glass-card p-6">
                <h3 className="font-medium text-white mb-2">{useCase.title}</h3>
                <p className="text-white/50 text-sm">{useCase.description}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
