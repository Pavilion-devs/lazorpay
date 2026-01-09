/**
 * SPL Token Transfer Utilities
 * Helper functions for building USDC and other SPL token transfer instructions
 */

import {
  PublicKey,
  TransactionInstruction,
  Connection,
} from "@solana/web3.js";
import {
  createTransferInstruction,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountIdempotentInstruction,
  getAccount,
  TokenAccountNotFoundError,
} from "@solana/spl-token";
import { getTokenAddress, LAZORKIT_CONFIG } from "@/lib/lazorkit/config";

// USDC has 6 decimals
export const USDC_DECIMALS = 6;

// SOL has 9 decimals (lamports)
export const SOL_DECIMALS = 9;

/**
 * Get the token decimals for a given token type
 */
export function getTokenDecimals(token: "SOL" | "USDC"): number {
  return token === "USDC" ? USDC_DECIMALS : SOL_DECIMALS;
}

/**
 * Convert a human-readable amount to token base units
 * e.g., 10 USDC -> 10_000_000 (6 decimals)
 * e.g., 1 SOL -> 1_000_000_000 (9 decimals / lamports)
 */
export function toBaseUnits(amount: number, token: "SOL" | "USDC"): number {
  const decimals = getTokenDecimals(token);
  return Math.floor(amount * Math.pow(10, decimals));
}

/**
 * Convert base units to human-readable amount
 */
export function fromBaseUnits(baseUnits: number, token: "SOL" | "USDC"): number {
  const decimals = getTokenDecimals(token);
  return baseUnits / Math.pow(10, decimals);
}

/**
 * Get the Associated Token Account (ATA) address for a wallet and mint
 */
export async function getATA(
  walletAddress: PublicKey,
  mintAddress: PublicKey
): Promise<PublicKey> {
  return getAssociatedTokenAddress(mintAddress, walletAddress, true);
}

/**
 * Check if an Associated Token Account exists
 */
export async function checkATAExists(
  connection: Connection,
  ataAddress: PublicKey
): Promise<boolean> {
  try {
    await getAccount(connection, ataAddress);
    return true;
  } catch (error) {
    if (error instanceof TokenAccountNotFoundError) {
      return false;
    }
    throw error;
  }
}

/**
 * Build instructions for a USDC transfer
 * Uses idempotent ATA creation to avoid async checks and timing issues
 * 
 * Note: We use createAssociatedTokenAccountIdempotentInstruction which:
 * - Creates the ATA if it doesn't exist
 * - Does nothing (succeeds silently) if it already exists
 * This avoids async RPC calls that can cause "TransactionTooOld" errors
 */
export async function buildUSDCTransferInstructions({
  from,
  to,
  amount,
}: {
  connection?: Connection; // Optional - not needed with idempotent approach
  from: PublicKey;
  to: PublicKey;
  amount: number; // Human-readable amount (e.g., 10 for 10 USDC)
}): Promise<TransactionInstruction[]> {
  const instructions: TransactionInstruction[] = [];

  // Get USDC mint address for current network
  const usdcMintAddress = new PublicKey(getTokenAddress("USDC"));

  // Get sender's ATA (sync - just derives the PDA)
  const senderATA = await getATA(from, usdcMintAddress);

  // Get recipient's ATA (sync - just derives the PDA)
  const recipientATA = await getATA(to, usdcMintAddress);

  // Use idempotent instruction - creates ATA if doesn't exist, no-op if exists
  // This avoids the async checkATAExists call which can cause timing issues
  instructions.push(
    createAssociatedTokenAccountIdempotentInstruction(
      from, // payer (will be replaced by paymaster's fee payer)
      recipientATA, // ata address
      to, // owner
      usdcMintAddress // mint
    )
  );

  // Convert amount to base units (6 decimals for USDC)
  const amountInBaseUnits = toBaseUnits(amount, "USDC");

  // Create transfer instruction
  instructions.push(
    createTransferInstruction(
      senderATA, // source
      recipientATA, // destination
      from, // owner/authority
      amountInBaseUnits // amount in base units
    )
  );

  return instructions;
}

/**
 * Get USDC balance for a wallet
 */
export async function getUSDCBalance(
  connection: Connection,
  walletAddress: PublicKey
): Promise<number> {
  try {
    const usdcMintAddress = new PublicKey(getTokenAddress("USDC"));
    const ataAddress = await getATA(walletAddress, usdcMintAddress);

    const account = await getAccount(connection, ataAddress);
    return fromBaseUnits(Number(account.amount), "USDC");
  } catch (error) {
    if (error instanceof TokenAccountNotFoundError) {
      return 0;
    }
    throw error;
  }
}

/**
 * Create a Solana connection instance
 */
export function createConnection(): Connection {
  return new Connection(LAZORKIT_CONFIG.RPC_URL, "confirmed");
}
