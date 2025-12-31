"use client";

import { useState, useEffect, useCallback } from "react";
import { useWallet } from "@lazorkit/wallet";
import {
  getInvoices,
  addInvoice,
  updateInvoice,
  deleteInvoice,
  StoredInvoice,
} from "@/lib/utils/storage";

export function useInvoices() {
  const { smartWalletPubkey, isConnected } = useWallet();
  const [invoices, setInvoices] = useState<StoredInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const walletAddress = smartWalletPubkey?.toString() || "";

  // Load invoices from localStorage
  const loadInvoices = useCallback(() => {
    if (!walletAddress) {
      setInvoices([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const stored = getInvoices(walletAddress);
    setInvoices(stored);
    setIsLoading(false);
  }, [walletAddress]);

  // Load on mount and when wallet changes
  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  // Create a new invoice
  const createInvoice = useCallback(
    ({
      client,
      email,
      amount,
      token,
      dueDate,
      items,
      status = "draft",
    }: {
      client: string;
      email?: string;
      amount: number;
      token: "SOL" | "USDC";
      dueDate: number;
      items: { description: string; amount: number }[];
      status?: "draft" | "pending";
    }): StoredInvoice | null => {
      if (!walletAddress) return null;

      const newInvoice = addInvoice({
        client,
        email,
        amount,
        token,
        dueDate,
        items,
        status,
        walletAddress,
      });

      loadInvoices();
      return newInvoice;
    },
    [walletAddress, loadInvoices]
  );

  // Update an invoice
  const updateInvoiceData = useCallback(
    (id: string, updates: Partial<StoredInvoice>) => {
      const updated = updateInvoice(id, updates);
      if (updated) {
        loadInvoices();
      }
      return updated;
    },
    [loadInvoices]
  );

  // Mark invoice as paid
  const markAsPaid = useCallback(
    (id: string, paymentSignature?: string) => {
      return updateInvoiceData(id, {
        status: "paid",
        paidDate: Date.now(),
        paymentSignature,
      });
    },
    [updateInvoiceData]
  );

  // Send invoice (change status to pending)
  const sendInvoice = useCallback(
    (id: string) => {
      return updateInvoiceData(id, { status: "pending" });
    },
    [updateInvoiceData]
  );

  // Delete an invoice
  const removeInvoice = useCallback(
    (id: string) => {
      const deleted = deleteInvoice(id);
      if (deleted) {
        loadInvoices();
      }
      return deleted;
    },
    [loadInvoices]
  );

  // Check for overdue invoices
  const checkOverdue = useCallback(() => {
    const now = Date.now();
    let updated = false;

    invoices.forEach((invoice) => {
      if (invoice.status === "pending" && invoice.dueDate < now) {
        updateInvoice(invoice.id, { status: "overdue" });
        updated = true;
      }
    });

    if (updated) {
      loadInvoices();
    }
  }, [invoices, loadInvoices]);

  // Run overdue check on load
  useEffect(() => {
    if (invoices.length > 0) {
      checkOverdue();
    }
  }, [invoices.length]); // Only run when invoice count changes

  // Get stats
  const getStats = useCallback(() => {
    const paid = invoices.filter((inv) => inv.status === "paid");
    const pending = invoices.filter((inv) => inv.status === "pending");
    const overdue = invoices.filter((inv) => inv.status === "overdue");
    const draft = invoices.filter((inv) => inv.status === "draft");

    const paidAmount = paid.reduce((sum, inv) => sum + inv.amount, 0);
    const pendingAmount = pending.reduce((sum, inv) => sum + inv.amount, 0);
    const overdueAmount = overdue.reduce((sum, inv) => sum + inv.amount, 0);

    return {
      total: invoices.length,
      paidCount: paid.length,
      pendingCount: pending.length,
      overdueCount: overdue.length,
      draftCount: draft.length,
      paidAmount,
      pendingAmount,
      overdueAmount,
    };
  }, [invoices]);

  // Filter invoices by status
  const getFilteredInvoices = useCallback(
    (status?: "all" | "paid" | "pending" | "overdue" | "draft") => {
      if (!status || status === "all") return invoices;
      return invoices.filter((inv) => inv.status === status);
    },
    [invoices]
  );

  return {
    invoices,
    isLoading,
    isConnected,
    walletAddress,
    createInvoice,
    updateInvoice: updateInvoiceData,
    markAsPaid,
    sendInvoice,
    removeInvoice,
    getStats,
    getFilteredInvoices,
    refreshInvoices: loadInvoices,
  };
}
