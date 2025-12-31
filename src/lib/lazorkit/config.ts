/**
 * LazorKit Configuration
 * Environment variables and SDK settings
 */

export const LAZORKIT_CONFIG = {
  // RPC endpoint for Solana
  RPC_URL: process.env.NEXT_PUBLIC_RPC_URL || "https://api.devnet.solana.com",

  // LazorKit portal URL (handles passkey authentication)
  PORTAL_URL: process.env.NEXT_PUBLIC_PORTAL_URL || "https://portal.lazor.sh",

  // Paymaster service for gasless transactions
  PAYMASTER_URL: process.env.NEXT_PUBLIC_PAYMASTER_URL || "https://kora.devnet.lazorkit.com",

  // Network cluster
  CLUSTER: (process.env.NEXT_PUBLIC_CLUSTER || "devnet") as "devnet" | "mainnet",
};

// Token addresses for different networks
export const TOKEN_ADDRESSES = {
  devnet: {
    // Devnet USDC (SPL Token for testing)
    USDC: "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr",
    // Native SOL (wrapped)
    WSOL: "So11111111111111111111111111111111111111112",
  },
  mainnet: {
    // Mainnet USDC
    USDC: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    // Native SOL (wrapped)
    WSOL: "So11111111111111111111111111111111111111112",
  },
};

// Get token addresses for current network
export const getTokenAddress = (token: "USDC" | "WSOL") => {
  const cluster = LAZORKIT_CONFIG.CLUSTER;
  return TOKEN_ADDRESSES[cluster][token];
};

// Paymaster config object for LazorKit
export const getPaymasterConfig = () => ({
  paymasterUrl: LAZORKIT_CONFIG.PAYMASTER_URL,
  apiKey: process.env.NEXT_PUBLIC_PAYMASTER_API_KEY,
});

// Explorer URLs
export const EXPLORER_URLS = {
  devnet: "https://explorer.solana.com/tx/",
  mainnet: "https://explorer.solana.com/tx/",
};

export const getExplorerUrl = (signature: string) => {
  const cluster = LAZORKIT_CONFIG.CLUSTER;
  const baseUrl = EXPLORER_URLS[cluster];
  const suffix = cluster === "devnet" ? "?cluster=devnet" : "";
  return `${baseUrl}${signature}${suffix}`;
};
