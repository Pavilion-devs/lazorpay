# Code Examples

Complete examples to help you integrate LazorPay into your application.

## Basic Checkout Flow

A complete checkout component with connection, payment, and status handling.

```tsx
"use client";
import { useState } from "react";
import { useWallet } from "@lazorkit/wallet";
import { SystemProgram, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";

type Status = "idle" | "connecting" | "processing" | "success" | "error";

interface CheckoutProps {
  recipient: string;
  amount: number;
  productName: string;
}

export function Checkout({ recipient, amount, productName }: CheckoutProps) {
  const { isConnected, connect, signAndSendTransaction, smartWalletPubkey } = useWallet();
  const [status, setStatus] = useState<Status>("idle");
  const [signature, setSignature] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    try {
      // Connect if not connected
      if (!isConnected) {
        setStatus("connecting");
        await connect();
        setStatus("idle");
        return;
      }

      setStatus("processing");
      setError(null);

      // Create transfer instruction
      const instruction = SystemProgram.transfer({
        fromPubkey: smartWalletPubkey!,
        toPubkey: new PublicKey(recipient),
        lamports: amount * LAMPORTS_PER_SOL,
      });

      // Sign and send transaction
      const txSignature = await signAndSendTransaction({
        instructions: [instruction],
        transactionOptions: {
          clusterSimulation: "devnet",
        },
      });

      setSignature(txSignature);
      setStatus("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed");
      setStatus("error");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">{productName}</h2>
      <p className="text-gray-600 mb-6">Amount: {amount} SOL</p>

      {status === "success" ? (
        <div className="text-center">
          <p className="text-green-600 font-medium mb-2">Payment Successful!</p>
          <a
            href={`https://explorer.solana.com/tx/${signature}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline"
          >
            View Transaction
          </a>
        </div>
      ) : (
        <>
          <button
            onClick={handleCheckout}
            disabled={status === "connecting" || status === "processing"}
            className="w-full py-3 px-4 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50"
          >
            {status === "connecting" && "Connecting..."}
            {status === "processing" && "Processing..."}
            {status === "idle" && (isConnected ? "Pay Now" : "Connect & Pay")}
            {status === "error" && "Try Again"}
          </button>

          {error && <p className="mt-4 text-red-500 text-sm">{error}</p>}
        </>
      )}
    </div>
  );
}
```

---

## USDC Payment

Transfer USDC tokens with automatic Associated Token Account creation.

```tsx
"use client";
import { useState } from "react";
import { useWallet } from "@lazorkit/wallet";
import { Connection, PublicKey } from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
} from "@solana/spl-token";

// Devnet USDC mint address
const USDC_MINT = new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU");
const USDC_DECIMALS = 6;

interface USDCPaymentProps {
  recipient: string;
  amount: number;
}

export function USDCPayment({ recipient, amount }: USDCPaymentProps) {
  const { signAndSendTransaction, smartWalletPubkey, isConnected } = useWallet();
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle");

  const handlePayment = async () => {
    if (!isConnected || !smartWalletPubkey) return;

    try {
      setStatus("processing");

      const connection = new Connection("https://api.devnet.solana.com");
      const recipientPubkey = new PublicKey(recipient);
      const instructions = [];

      // Get Associated Token Accounts
      const senderATA = await getAssociatedTokenAddress(USDC_MINT, smartWalletPubkey);
      const recipientATA = await getAssociatedTokenAddress(USDC_MINT, recipientPubkey);

      // Check if recipient has a token account
      const recipientAccount = await connection.getAccountInfo(recipientATA);
      if (!recipientAccount) {
        // Create ATA for recipient
        instructions.push(
          createAssociatedTokenAccountInstruction(
            smartWalletPubkey,
            recipientATA,
            recipientPubkey,
            USDC_MINT
          )
        );
      }

      // Add transfer instruction
      const amountInBaseUnits = amount * Math.pow(10, USDC_DECIMALS);
      instructions.push(
        createTransferInstruction(
          senderATA,
          recipientATA,
          smartWalletPubkey,
          amountInBaseUnits
        )
      );

      // Sign and send
      const signature = await signAndSendTransaction({
        instructions,
        transactionOptions: {
          clusterSimulation: "devnet",
        },
      });

      console.log("USDC Transfer:", signature);
      setStatus("success");
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={status === "processing" || !isConnected}
      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
    >
      {status === "processing" ? "Processing..." : `Pay ${amount} USDC`}
    </button>
  );
}
```

---

## Payment Link Generator

Create shareable payment links with QR codes.

```tsx
"use client";
import { useState } from "react";
import { useWallet } from "@lazorkit/wallet";
import { QRCodeSVG } from "qrcode.react";

interface PaymentLinkData {
  amount: number;
  token: "SOL" | "USDC";
  memo?: string;
  merchantName?: string;
}

export function PaymentLinkGenerator() {
  const { smartWalletPubkey, isConnected } = useWallet();
  const [linkData, setLinkData] = useState<PaymentLinkData>({
    amount: 0,
    token: "SOL",
  });
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);

  const generateLink = () => {
    if (!smartWalletPubkey || linkData.amount <= 0) return;

    const baseUrl = window.location.origin;
    const params = new URLSearchParams({
      to: smartWalletPubkey.toString(),
      amount: linkData.amount.toString(),
      token: linkData.token,
    });

    if (linkData.memo) params.set("memo", linkData.memo);
    if (linkData.merchantName) params.set("merchant", linkData.merchantName);

    const url = `${baseUrl}/pay/checkout?${params.toString()}`;
    setGeneratedLink(url);
  };

  const copyLink = async () => {
    if (generatedLink) {
      await navigator.clipboard.writeText(generatedLink);
      alert("Link copied!");
    }
  };

  if (!isConnected) {
    return <p>Connect your wallet to create payment links.</p>;
  }

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Amount</label>
        <input
          type="number"
          value={linkData.amount}
          onChange={(e) => setLinkData({ ...linkData, amount: parseFloat(e.target.value) || 0 })}
          className="w-full px-3 py-2 border rounded"
          placeholder="0.00"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Token</label>
        <select
          value={linkData.token}
          onChange={(e) => setLinkData({ ...linkData, token: e.target.value as "SOL" | "USDC" })}
          className="w-full px-3 py-2 border rounded"
        >
          <option value="SOL">SOL</option>
          <option value="USDC">USDC</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Memo (optional)</label>
        <input
          type="text"
          value={linkData.memo || ""}
          onChange={(e) => setLinkData({ ...linkData, memo: e.target.value })}
          className="w-full px-3 py-2 border rounded"
          placeholder="Payment for..."
        />
      </div>

      <button
        onClick={generateLink}
        className="w-full py-2 bg-violet-600 text-white rounded hover:bg-violet-700"
      >
        Generate Payment Link
      </button>

      {generatedLink && (
        <div className="mt-6 p-4 bg-gray-50 rounded space-y-4">
          <div className="flex justify-center">
            <QRCodeSVG value={generatedLink} size={200} />
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={generatedLink}
              readOnly
              className="flex-1 px-3 py-2 border rounded text-sm"
            />
            <button
              onClick={copyLink}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Copy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## Transaction History

Display transaction history from localStorage.

```tsx
"use client";
import { useEffect, useState } from "react";
import { useWallet } from "@lazorkit/wallet";

interface Transaction {
  signature: string;
  type: "sent" | "received";
  amount: number;
  token: "SOL" | "USDC";
  timestamp: string;
  recipient?: string;
  sender?: string;
}

export function TransactionHistory() {
  const { smartWalletPubkey, isConnected } = useWallet();
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (!isConnected || !smartWalletPubkey) return;

    // Load from localStorage
    const stored = localStorage.getItem("lazorpay_transactions");
    if (stored) {
      const allTx = JSON.parse(stored) as Transaction[];
      const myTx = allTx.filter(
        (tx) => tx.walletAddress === smartWalletPubkey.toString()
      );
      setTransactions(myTx.reverse()); // Most recent first
    }
  }, [isConnected, smartWalletPubkey]);

  if (!isConnected) {
    return <p>Connect your wallet to view transaction history.</p>;
  }

  if (transactions.length === 0) {
    return <p className="text-gray-500">No transactions yet.</p>;
  }

  return (
    <div className="space-y-2">
      {transactions.map((tx) => (
        <div
          key={tx.signature}
          className="flex items-center justify-between p-3 bg-gray-50 rounded"
        >
          <div>
            <span className={tx.type === "sent" ? "text-red-600" : "text-green-600"}>
              {tx.type === "sent" ? "-" : "+"}
              {tx.amount} {tx.token}
            </span>
            <p className="text-xs text-gray-500">
              {new Date(tx.timestamp).toLocaleDateString()}
            </p>
          </div>

          <a
            href={`https://explorer.solana.com/tx/${tx.signature}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 text-sm"
          >
            View
          </a>
        </div>
      ))}
    </div>
  );
}
```

---

## Full App Example

See the [examples/nextjs-checkout](../examples/nextjs-checkout) directory for a complete, runnable Next.js application.
