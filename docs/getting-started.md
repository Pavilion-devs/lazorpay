# Getting Started with LazorPay

This guide will help you integrate passkey-powered payments into your application using LazorKit SDK.

## Prerequisites

- Node.js 18+
- A React/Next.js application
- Basic understanding of Solana

## Installation

```bash
npm install @lazorkit/wallet @solana/web3.js
```

## Step 1: Configure the Provider

Wrap your application with `LazorkitProvider` to enable passkey authentication.

```tsx
// app/layout.tsx
import { LazorkitProvider } from "@lazorkit/wallet";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <LazorkitProvider
          rpcUrl="https://api.devnet.solana.com"
          portalUrl="https://portal.lazor.sh"
          paymasterConfig={{
            paymasterUrl: "https://kora.devnet.lazorkit.com",
            feeTokens: ["USDC"],
          }}
        >
          {children}
        </LazorkitProvider>
      </body>
    </html>
  );
}
```

### Configuration Options

| Option | Type | Description |
|--------|------|-------------|
| `rpcUrl` | string | Solana RPC endpoint (devnet or mainnet) |
| `portalUrl` | string | LazorKit authentication portal URL |
| `paymasterConfig` | object | Configuration for gasless transactions |
| `paymasterConfig.paymasterUrl` | string | Kora paymaster endpoint |
| `paymasterConfig.feeTokens` | string[] | Supported fee tokens (e.g., ["USDC"]) |

## Step 2: Add Wallet Connection

Use the `useWallet` hook to handle wallet connections.

```tsx
// components/ConnectButton.tsx
"use client";
import { useWallet } from "@lazorkit/wallet";

export function ConnectButton() {
  const { isConnected, isConnecting, connect, disconnect, smartWalletPubkey } = useWallet();

  if (isConnecting) {
    return <button disabled>Connecting...</button>;
  }

  if (isConnected && smartWalletPubkey) {
    return (
      <div>
        <span>{smartWalletPubkey.toString().slice(0, 8)}...</span>
        <button onClick={disconnect}>Disconnect</button>
      </div>
    );
  }

  return <button onClick={connect}>Connect with Passkey</button>;
}
```

### How Authentication Works

1. User clicks "Connect with Passkey"
2. LazorKit opens the authentication portal
3. User authenticates with Face ID, Touch ID, or Windows Hello
4. A smart wallet address is returned
5. User is now connected and ready to transact

## Step 3: Process Payments

Send SOL with a single function call.

```tsx
// components/PaymentButton.tsx
"use client";
import { useWallet } from "@lazorkit/wallet";
import { SystemProgram, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";

export function PaymentButton({ recipient, amount }: { recipient: string; amount: number }) {
  const { signAndSendTransaction, smartWalletPubkey } = useWallet();

  const handlePayment = async () => {
    const instruction = SystemProgram.transfer({
      fromPubkey: smartWalletPubkey!,
      toPubkey: new PublicKey(recipient),
      lamports: amount * LAMPORTS_PER_SOL,
    });

    const signature = await signAndSendTransaction({
      instructions: [instruction],
      transactionOptions: {
        clusterSimulation: "devnet",
      },
    });

    console.log("Transaction successful:", signature);
  };

  return <button onClick={handlePayment}>Pay {amount} SOL</button>;
}
```

## Step 4: USDC Transfers (Optional)

For USDC transfers, you need to handle Associated Token Accounts.

```tsx
import { Connection, PublicKey } from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
} from "@solana/spl-token";

const USDC_MINT = new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"); // Devnet USDC

async function buildUSDCTransfer(connection: Connection, from: PublicKey, to: PublicKey, amount: number) {
  const instructions = [];

  const senderATA = await getAssociatedTokenAddress(USDC_MINT, from);
  const recipientATA = await getAssociatedTokenAddress(USDC_MINT, to);

  // Check if recipient has a token account
  const recipientAccount = await connection.getAccountInfo(recipientATA);
  if (!recipientAccount) {
    instructions.push(
      createAssociatedTokenAccountInstruction(from, recipientATA, to, USDC_MINT)
    );
  }

  // Add transfer instruction (USDC has 6 decimals)
  instructions.push(
    createTransferInstruction(senderATA, recipientATA, from, amount * 1_000_000)
  );

  return instructions;
}
```

## Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_PORTAL_URL=https://portal.lazor.sh
NEXT_PUBLIC_PAYMASTER_URL=https://kora.devnet.lazorkit.com
NEXT_PUBLIC_CLUSTER=devnet
```

## Next Steps

- [Components Reference](./components.md) - Pre-built UI components
- [Hooks Reference](./hooks.md) - Available React hooks
- [Code Examples](./examples.md) - Complete code examples

## Troubleshooting

### WebAuthn Not Supported Error

This error occurs when accessing the app over HTTP or with invalid TLS certificates. Solutions:
- Use `localhost` (automatically secure)
- Deploy to a platform with valid HTTPS (Vercel, Netlify)

### Transaction Failed

Common causes:
- Insufficient balance
- Invalid recipient address
- Network congestion (retry with higher priority)

## Resources

- [LazorKit Documentation](https://docs.lazorkit.com)
- [Solana Web3.js Docs](https://solana-labs.github.io/solana-web3.js/)
