"use client";

/**
 * LazorKit Provider Wrapper
 * Wraps the app with LazorKit context for wallet functionality
 */

import { ReactNode, useEffect, useState } from "react";
import { LazorkitProvider } from "@lazorkit/wallet";
import { LAZORKIT_CONFIG, getPaymasterConfig } from "./config";

// Buffer polyfill for browser compatibility
if (typeof window !== "undefined") {
  const { Buffer } = require("buffer");
  window.Buffer = window.Buffer || Buffer;
}

interface LazorPayProviderProps {
  children: ReactNode;
}

export function LazorPayProvider({ children }: LazorPayProviderProps) {
  const [mounted, setMounted] = useState(false);

  // Ensure we only render on client side
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a loading state or null during SSR
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-pulse text-white/50">Loading...</div>
      </div>
    );
  }

  return (
    <LazorkitProvider
      rpcUrl={LAZORKIT_CONFIG.RPC_URL}
      portalUrl={LAZORKIT_CONFIG.PORTAL_URL}
      paymasterConfig={getPaymasterConfig()}
    >
      {children}
    </LazorkitProvider>
  );
}
