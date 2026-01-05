# Next.js Checkout Example

A minimal Next.js application demonstrating LazorPay integration with passkey-powered payments.

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

## Features

- Passkey authentication with LazorKit
- SOL and USDC transfers
- Gasless transactions
- Mobile-responsive UI

## Project Structure

```
nextjs-checkout/
├── app/
│   ├── layout.tsx      # LazorkitProvider setup
│   ├── page.tsx        # Checkout page
│   └── globals.css     # Styles
├── components/
│   └── Checkout.tsx    # Checkout component
├── package.json
├── next.config.js
└── tailwind.config.js
```

## Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_PORTAL_URL=https://portal.lazor.sh
NEXT_PUBLIC_PAYMASTER_URL=https://kora.devnet.lazorkit.com
NEXT_PUBLIC_CLUSTER=devnet
```

## Key Files

### app/layout.tsx

```tsx
import { LazorkitProvider } from "@lazorkit/wallet";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <LazorkitProvider
          rpcUrl={process.env.NEXT_PUBLIC_RPC_URL!}
          portalUrl={process.env.NEXT_PUBLIC_PORTAL_URL!}
          paymasterConfig={{
            paymasterUrl: process.env.NEXT_PUBLIC_PAYMASTER_URL!,
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

### components/Checkout.tsx

```tsx
"use client";
import { useState } from "react";
import { useWallet } from "@lazorkit/wallet";
import { SystemProgram, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";

export function Checkout({ recipient, amount }) {
  const { isConnected, connect, signAndSendTransaction, smartWalletPubkey } = useWallet();
  const [status, setStatus] = useState("idle");

  const handlePayment = async () => {
    if (!isConnected) {
      await connect();
      return;
    }

    try {
      setStatus("processing");

      const instruction = SystemProgram.transfer({
        fromPubkey: smartWalletPubkey!,
        toPubkey: new PublicKey(recipient),
        lamports: amount * LAMPORTS_PER_SOL,
      });

      await signAndSendTransaction({
        instructions: [instruction],
        transactionOptions: { clusterSimulation: "devnet" },
      });

      setStatus("success");
    } catch (error) {
      setStatus("error");
    }
  };

  return (
    <button onClick={handlePayment} disabled={status === "processing"}>
      {status === "processing" ? "Processing..." : `Pay ${amount} SOL`}
    </button>
  );
}
```

## Deployment

Deploy to Vercel for automatic HTTPS (required for WebAuthn):

```bash
npm run build
vercel deploy
```

## Resources

- [LazorPay Documentation](../../docs/)
- [LazorKit Official Docs](https://docs.lazorkit.com)
