/**
 * Type definitions for LazorPay
 */

// Payment status enum
export type PaymentStatus = "idle" | "connecting" | "signing" | "confirming" | "success" | "error";

// Payment request interface
export interface PaymentRequest {
  recipient: string;
  amount: number;
  token: "USDC" | "SOL";
  memo?: string;
  reference?: string;
}

// Payment result interface
export interface PaymentResult {
  signature: string;
  status: "success" | "error";
  error?: string;
}

// Wallet info interface (from LazorKit)
export interface WalletInfo {
  smartWallet: string;
  credentialId: string;
  publicKey: string;
}

// Transaction history item
export interface TransactionHistoryItem {
  id: string;
  signature: string;
  recipient: string;
  amount: number;
  token: string;
  timestamp: number;
  status: "success" | "pending" | "failed";
  memo?: string;
}

// Payment link params
export interface PaymentLinkParams {
  to: string;
  amount: number;
  token?: string;
  memo?: string;
  label?: string;
}

// Component props
export interface ConnectButtonProps {
  className?: string;
  onConnect?: (wallet: WalletInfo) => void;
  onDisconnect?: () => void;
}

export interface PaymentButtonProps {
  recipient: string;
  amount: number;
  token?: "USDC" | "SOL";
  memo?: string;
  label?: string;
  className?: string;
  onSuccess?: (result: PaymentResult) => void;
  onError?: (error: Error) => void;
}

export interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipient: string;
  amount: number;
  token?: "USDC" | "SOL";
  memo?: string;
  onSuccess?: (result: PaymentResult) => void;
  onError?: (error: Error) => void;
}

// Buffer type declaration for TypeScript
declare global {
  interface Window {
    Buffer: typeof Buffer;
  }
}
