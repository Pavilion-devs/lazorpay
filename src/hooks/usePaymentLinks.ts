"use client";

import { useState, useEffect, useCallback } from "react";
import { useWallet } from "@lazorkit/wallet";
import {
  getPaymentLinks,
  addPaymentLink,
  updatePaymentLink,
  deletePaymentLink,
  incrementPaymentLinkViews,
  incrementPaymentLinkPayments,
  StoredPaymentLink,
} from "@/lib/utils/storage";

export function usePaymentLinks() {
  const { smartWalletPubkey, isConnected } = useWallet();
  const [paymentLinks, setPaymentLinks] = useState<StoredPaymentLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const walletAddress = smartWalletPubkey?.toString() || "";

  // Load payment links from localStorage
  const loadPaymentLinks = useCallback(() => {
    if (!walletAddress) {
      setPaymentLinks([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const stored = getPaymentLinks(walletAddress);
    setPaymentLinks(stored);
    setIsLoading(false);
  }, [walletAddress]);

  // Load on mount and when wallet changes
  useEffect(() => {
    loadPaymentLinks();
  }, [loadPaymentLinks]);

  // Create a new payment link
  const createPaymentLink = useCallback(
    ({
      name,
      amount,
      token,
      recipientAddress,
      memo,
      merchantName,
    }: {
      name: string;
      amount: number;
      token: "SOL" | "USDC";
      recipientAddress: string;
      memo?: string;
      merchantName?: string;
    }): StoredPaymentLink | null => {
      if (!walletAddress) return null;

      // Generate unique ID first so we can include it in URL
      const linkId = crypto.randomUUID();

      // Generate the URL with link ID for tracking
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
      const params = new URLSearchParams({
        to: recipientAddress,
        amount: amount.toString(),
        token: token,
        linkId: linkId,
      });
      if (memo) params.set("memo", memo);
      if (merchantName) params.set("merchant", merchantName);

      const url = `${baseUrl}/pay/checkout?${params.toString()}`;

      const newLink = addPaymentLink(
        {
          name,
          amount,
          token,
          recipientAddress,
          memo,
          merchantName,
          status: "active",
          url,
          walletAddress,
        },
        linkId
      );

      loadPaymentLinks();
      return newLink;
    },
    [walletAddress, loadPaymentLinks]
  );

  // Update a payment link
  const updateLink = useCallback(
    (id: string, updates: Partial<StoredPaymentLink>) => {
      const updated = updatePaymentLink(id, updates);
      if (updated) {
        loadPaymentLinks();
      }
      return updated;
    },
    [loadPaymentLinks]
  );

  // Delete a payment link
  const removePaymentLink = useCallback(
    (id: string) => {
      const deleted = deletePaymentLink(id);
      if (deleted) {
        loadPaymentLinks();
      }
      return deleted;
    },
    [loadPaymentLinks]
  );

  // Track a view
  const trackView = useCallback(
    (id: string) => {
      incrementPaymentLinkViews(id);
      loadPaymentLinks();
    },
    [loadPaymentLinks]
  );

  // Track a payment
  const trackPayment = useCallback(
    (id: string) => {
      incrementPaymentLinkPayments(id);
      loadPaymentLinks();
    },
    [loadPaymentLinks]
  );

  // Get stats
  const getStats = useCallback(() => {
    const totalViews = paymentLinks.reduce((sum, link) => sum + link.views, 0);
    const totalPayments = paymentLinks.reduce((sum, link) => sum + link.payments, 0);
    const activeLinks = paymentLinks.filter((link) => link.status === "active").length;

    return {
      totalLinks: paymentLinks.length,
      activeLinks,
      totalViews,
      totalPayments,
    };
  }, [paymentLinks]);

  return {
    paymentLinks,
    isLoading,
    isConnected,
    walletAddress,
    createPaymentLink,
    updateLink,
    removePaymentLink,
    trackView,
    trackPayment,
    getStats,
    refreshPaymentLinks: loadPaymentLinks,
  };
}
