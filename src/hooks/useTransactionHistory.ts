"use client";

import { useState, useEffect, useCallback } from "react";
import { useWallet } from "@lazorkit/wallet";
import {
  getTransactions,
  addTransaction,
  updateTransaction,
  calculateDashboardStats,
  StoredTransaction,
  DashboardStats,
} from "@/lib/utils/storage";

export function useTransactionHistory() {
  const { smartWalletPubkey, isConnected } = useWallet();
  const [transactions, setTransactions] = useState<StoredTransaction[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalTransactions: 0,
    avgPayment: 0,
    totalPaymentLinks: 0,
    totalViews: 0,
    totalInvoicesPaid: 0,
    pendingAmount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const walletAddress = smartWalletPubkey?.toString() || "";

  // Load transactions from localStorage
  const loadTransactions = useCallback(() => {
    if (!walletAddress) {
      setTransactions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const stored = getTransactions(walletAddress);
    setTransactions(stored);
    setStats(calculateDashboardStats(walletAddress));
    setIsLoading(false);
  }, [walletAddress]);

  // Load on mount and when wallet changes
  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  // Add a new transaction
  const recordTransaction = useCallback(
    (
      transaction: Omit<StoredTransaction, "id" | "walletAddress">
    ): StoredTransaction | null => {
      if (!walletAddress) return null;

      const newTx = addTransaction({
        ...transaction,
        walletAddress,
      });

      // Refresh the list
      loadTransactions();

      return newTx;
    },
    [walletAddress, loadTransactions]
  );

  // Record an incoming payment (received)
  const recordIncomingPayment = useCallback(
    ({
      signature,
      amount,
      token,
      from,
      memo,
    }: {
      signature: string;
      amount: number;
      token: "SOL" | "USDC";
      from: string;
      memo?: string;
    }) => {
      return recordTransaction({
        signature,
        type: "incoming",
        amount,
        token,
        from,
        memo,
        timestamp: Date.now(),
        status: "confirmed",
      });
    },
    [recordTransaction]
  );

  // Record an outgoing payment (sent)
  const recordOutgoingPayment = useCallback(
    ({
      signature,
      amount,
      token,
      to,
      memo,
    }: {
      signature: string;
      amount: number;
      token: "SOL" | "USDC";
      to: string;
      memo?: string;
    }) => {
      return recordTransaction({
        signature,
        type: "outgoing",
        amount,
        token,
        to,
        memo,
        timestamp: Date.now(),
        status: "confirmed",
      });
    },
    [recordTransaction]
  );

  // Update transaction status
  const updateTransactionStatus = useCallback(
    (signature: string, status: "pending" | "confirmed" | "failed") => {
      const updated = updateTransaction(signature, { status });
      if (updated) {
        loadTransactions();
      }
      return updated;
    },
    [loadTransactions]
  );

  // Filter transactions
  const getFilteredTransactions = useCallback(
    (filter: "all" | "incoming" | "outgoing" = "all") => {
      if (filter === "all") return transactions;
      return transactions.filter((tx) => tx.type === filter);
    },
    [transactions]
  );

  // Get recent transactions (limited)
  const getRecentTransactions = useCallback(
    (limit: number = 5) => {
      return transactions.slice(0, limit);
    },
    [transactions]
  );

  return {
    transactions,
    stats,
    isLoading,
    isConnected,
    walletAddress,
    recordTransaction,
    recordIncomingPayment,
    recordOutgoingPayment,
    updateTransactionStatus,
    getFilteredTransactions,
    getRecentTransactions,
    refreshTransactions: loadTransactions,
  };
}
