"use client";

/**
 * LazorPayButton Component
 * Embeddable "Pay with Solana" button that opens the payment modal
 *
 * Usage:
 * <LazorPayButton
 *   recipient="WALLET_ADDRESS"
 *   amount={10}
 *   token="USDC"
 *   onSuccess={(result) => console.log(result)}
 * />
 */

import { useState } from "react";
import { Zap } from "lucide-react";
import { PaymentModal } from "./PaymentModal";
import type { PaymentResult } from "@/types";

interface LazorPayButtonProps {
  // Required
  recipient: string;
  amount: number;

  // Optional
  token?: "USDC" | "SOL";
  memo?: string;
  label?: string;
  merchantName?: string;
  className?: string;

  // Callbacks
  onSuccess?: (result: PaymentResult) => void;
  onError?: (error: Error) => void;

  // Styling variants
  variant?: "default" | "outline" | "minimal";
  size?: "sm" | "md" | "lg";
}

export function LazorPayButton({
  recipient,
  amount,
  token = "SOL",
  memo,
  label,
  merchantName,
  className = "",
  onSuccess,
  onError,
  variant = "default",
  size = "md",
}: LazorPayButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Size classes
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm gap-1.5",
    md: "px-5 py-2.5 text-base gap-2",
    lg: "px-6 py-3 text-lg gap-2",
  };

  // Variant classes
  const variantClasses = {
    default: `
      bg-gradient-to-r from-emerald-500 to-cyan-500
      hover:from-emerald-400 hover:to-cyan-400
      text-black font-semibold
      shadow-lg shadow-emerald-500/25
    `,
    outline: `
      bg-transparent
      border-2 border-emerald-500
      text-emerald-400 font-semibold
      hover:bg-emerald-500/10
    `,
    minimal: `
      bg-white/5
      border border-white/10
      text-white font-medium
      hover:bg-white/10
    `,
  };

  const buttonClasses = `
    inline-flex items-center justify-center
    rounded-xl
    transition-all duration-200 ease-out
    hover:-translate-y-0.5
    active:translate-y-0
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${className}
  `;

  const handleSuccess = (result: PaymentResult) => {
    onSuccess?.(result);
    // Keep modal open briefly to show success state
    setTimeout(() => setIsModalOpen(false), 2000);
  };

  return (
    <>
      <button onClick={() => setIsModalOpen(true)} className={buttonClasses}>
        <Zap className={size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4"} />
        <span>{label || `Pay ${amount} ${token}`}</span>
      </button>

      <PaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        recipient={recipient}
        amount={amount}
        token={token}
        memo={memo}
        merchantName={merchantName}
        onSuccess={handleSuccess}
        onError={onError}
      />
    </>
  );
}

/**
 * Simple payment link component
 * Displays as a styled link instead of a button
 */
export function LazorPayLink({
  recipient,
  amount,
  token = "SOL",
  memo,
  children,
  className = "",
  onSuccess,
  onError,
}: LazorPayButtonProps & { children?: React.ReactNode }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={`text-emerald-400 hover:text-emerald-300 underline underline-offset-2 transition-colors ${className}`}
      >
        {children || `Pay ${amount} ${token}`}
      </button>

      <PaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        recipient={recipient}
        amount={amount}
        token={token}
        memo={memo}
        onSuccess={onSuccess}
        onError={onError}
      />
    </>
  );
}
