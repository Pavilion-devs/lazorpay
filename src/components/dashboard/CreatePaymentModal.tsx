"use client";

import { useState, useMemo } from "react";
import { useWallet } from "@lazorkit/wallet";
import {
  Copy,
  Check,
  Link as LinkIcon,
  QrCode,
  Wallet,
  Share2,
  ExternalLink,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Modal } from "./DashboardLayout";
import { formatAmount, isValidSolanaAddress } from "@/lib/utils/format";
import { usePaymentLinks } from "@/hooks/usePaymentLinks";

type Token = "SOL" | "USDC";

export function CreatePaymentModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { smartWalletPubkey } = useWallet();
  const { createPaymentLink } = usePaymentLinks();

  // Form state - pre-fill with connected wallet
  const [recipientAddress, setRecipientAddress] = useState(
    smartWalletPubkey?.toString() || ""
  );
  const [amount, setAmount] = useState("");
  const [token, setToken] = useState<Token>("SOL");
  const [memo, setMemo] = useState("");
  const [merchantName, setMerchantName] = useState("");

  // UI state
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [linkGenerated, setLinkGenerated] = useState(false);

  // Update recipient when wallet changes
  useState(() => {
    if (smartWalletPubkey && !recipientAddress) {
      setRecipientAddress(smartWalletPubkey.toString());
    }
  });

  // Validate form
  const isValidForm = useMemo(() => {
    return isValidSolanaAddress(recipientAddress) && parseFloat(amount) > 0;
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
      console.log("Share cancelled");
    }
  };

  const handleGenerateLink = () => {
    if (isValidForm) {
      // Save the payment link to localStorage
      createPaymentLink({
        name: merchantName || `Payment ${parseFloat(amount).toFixed(2)} ${token}`,
        amount: parseFloat(amount),
        token: token,
        recipientAddress: recipientAddress,
        memo: memo || undefined,
        merchantName: merchantName || undefined,
      });
      setLinkGenerated(true);
    }
  };

  const handleClose = () => {
    // Reset form on close
    setAmount("");
    setMemo("");
    setMerchantName("");
    setLinkGenerated(false);
    setShowQR(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create Payment Link">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left: Form */}
        <div className="space-y-5">
          {/* Recipient Address */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Recipient Wallet Address *
            </label>
            <div className="relative">
              <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input
                type="text"
                value={recipientAddress}
                onChange={(e) => {
                  setRecipientAddress(e.target.value);
                  setLinkGenerated(false);
                }}
                placeholder="Enter Solana wallet address"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-white/10 bg-zinc-900/50 text-white placeholder:text-zinc-500 focus:outline-none focus:border-violet-500/50 transition-colors tracking-tight text-sm"
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
                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-zinc-900/50 text-white placeholder:text-zinc-500 focus:outline-none focus:border-violet-500/50 transition-colors tracking-tight text-sm"
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
                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-zinc-900/50 text-white focus:outline-none focus:border-violet-500/50 transition-colors tracking-tight text-sm cursor-pointer"
              >
                <option value="SOL">SOL</option>
                <option value="USDC">USDC</option>
              </select>
            </div>
          </div>

          {/* Merchant Name (optional) */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Business Name <span className="text-zinc-500">(optional)</span>
            </label>
            <input
              type="text"
              value={merchantName}
              onChange={(e) => {
                setMerchantName(e.target.value);
                setLinkGenerated(false);
              }}
              placeholder="Your Store Name"
              className="w-full px-4 py-3 rounded-xl border border-white/10 bg-zinc-900/50 text-white placeholder:text-zinc-500 focus:outline-none focus:border-violet-500/50 transition-colors tracking-tight text-sm"
            />
          </div>

          {/* Memo (optional) */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Memo <span className="text-zinc-500">(optional)</span>
            </label>
            <input
              type="text"
              value={memo}
              onChange={(e) => {
                setMemo(e.target.value);
                setLinkGenerated(false);
              }}
              placeholder="Payment for..."
              className="w-full px-4 py-3 rounded-xl border border-white/10 bg-zinc-900/50 text-white placeholder:text-zinc-500 focus:outline-none focus:border-violet-500/50 transition-colors tracking-tight text-sm"
            />
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerateLink}
            disabled={!isValidForm}
            className={`w-full py-3 px-6 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
              isValidForm
                ? "bg-violet-600 hover:bg-violet-500 text-white"
                : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
            }`}
          >
            <LinkIcon className="w-5 h-5" />
            Generate Payment Link
          </button>
        </div>

        {/* Right: Preview & Link */}
        <div className="rounded-xl border border-white/10 bg-zinc-900/30 p-6">
          <h3 className="text-sm font-medium text-zinc-400 mb-4">
            {linkGenerated ? "Your Payment Link" : "Preview"}
          </h3>

          {/* Payment Preview Card */}
          <div className="bg-zinc-950/50 rounded-xl p-5 mb-5 border border-white/5">
            <div className="text-center">
              <p className="text-zinc-400 text-sm mb-2">
                {merchantName || "Payment Request"}
              </p>
              <p className="text-2xl font-light text-white mb-1 tracking-tight">
                {amount ? formatAmount(parseFloat(amount), 4) : "0.00"} {token}
              </p>
              {memo && <p className="text-zinc-500 text-xs mt-2">{memo}</p>}
            </div>
          </div>

          {linkGenerated && isValidForm ? (
            <>
              {/* QR Code Toggle */}
              <div className="flex items-center justify-center mb-4">
                <button
                  onClick={() => setShowQR(!showQR)}
                  className="flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300 transition-colors"
                >
                  <QrCode className="w-4 h-4" />
                  {showQR ? "Hide" : "Show"} QR Code
                </button>
              </div>

              {/* QR Code */}
              {showQR && (
                <div className="flex justify-center mb-4">
                  <div className="bg-white p-3 rounded-xl">
                    <QRCodeSVG value={paymentLink} size={140} level="H" includeMargin={false} />
                  </div>
                </div>
              )}

              {/* Generated Link */}
              <div className="mb-4">
                <label className="block text-xs text-zinc-500 mb-2">
                  Payment Link
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={paymentLink}
                    readOnly
                    className="flex-1 px-3 py-2 rounded-lg border border-white/10 bg-zinc-950/50 text-xs font-mono text-zinc-300 focus:outline-none"
                  />
                  <button
                    onClick={copyLink}
                    className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-2"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-violet-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={shareLink}
                  className="flex-1 py-2 px-3 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
                <a
                  href={paymentLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 px-3 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open
                </a>
              </div>
            </>
          ) : (
            <div className="text-center py-6">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-zinc-800/50 flex items-center justify-center">
                <LinkIcon className="w-6 h-6 text-zinc-600" />
              </div>
              <p className="text-zinc-500 text-sm">
                Fill in the details to generate your payment link
              </p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
