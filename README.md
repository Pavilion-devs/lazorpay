# LazorPay

> Passkey-Powered Payment SDK for Solana - Built with LazorKit

[![Built with LazorKit](https://img.shields.io/badge/Built%20with-LazorKit-00D4AA?style=flat-square)](https://docs.lazorkit.com)
[![Solana](https://img.shields.io/badge/Solana-Devnet-9945FF?style=flat-square)](https://solana.com)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square)](https://nextjs.org)

LazorPay is a complete payment solution demonstrating how to build passkey-powered, gasless payments on Solana using the LazorKit SDK. Users authenticate with Face ID, Touch ID, or Windows Hello—no seed phrases, browser extensions, or SOL for gas required.

## Features

- **Passkey Authentication** - WebAuthn-based login with biometrics
- **Gasless Transactions** - Paymaster-sponsored fees via LazorKit
- **Smart Wallet Integration** - PDA-based wallets controlled by passkeys
- **Drop-in Components** - Pre-built React components for payments
- **Payment Links** - Generate shareable links with QR codes
- **TypeScript Support** - Full type safety throughout

## Live Demo

Try the live demo on Solana Devnet:
- **Checkout Demo**: Test the full payment flow
- **Payment Links**: Create shareable payment requests
- **Documentation**: Interactive API reference

## Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/your-username/lazorpay.git
cd lazorpay
npm install
```

### 2. Environment Setup

Create a `.env.local` file:

```env
NEXT_PUBLIC_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_PORTAL_URL=https://portal.lazor.sh
NEXT_PUBLIC_PAYMASTER_URL=https://kora.devnet.lazorkit.com
NEXT_PUBLIC_CLUSTER=devnet
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Tutorial 1: Setting Up LazorKit Provider

The LazorKit provider wraps your application and enables passkey authentication.

```tsx
// src/app/layout.tsx
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

**Key Configuration Options:**
- `rpcUrl`: Solana RPC endpoint (devnet or mainnet)
- `portalUrl`: LazorKit authentication portal
- `paymasterConfig`: Enable gasless transactions with fee sponsorship

## Tutorial 2: Building a Connect Button

Create a wallet connection component using the `useWallet` hook.

```tsx
// src/components/ConnectButton.tsx
"use client";
import { useWallet } from "@lazorkit/wallet";

export function ConnectButton() {
  const {
    isConnected,
    isConnecting,
    connect,
    disconnect,
    smartWalletPubkey
  } = useWallet();

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

  return (
    <button onClick={connect}>
      Connect with Passkey
    </button>
  );
}
```

**How it works:**
1. User clicks "Connect with Passkey"
2. LazorKit opens authentication portal
3. User authenticates with Face ID/Touch ID
4. Smart wallet address is returned
5. User is now connected!

## Tutorial 3: Processing Payments

Send SOL or SPL tokens with a single function call.

```tsx
// src/components/PaymentButton.tsx
"use client";
import { useWallet } from "@lazorkit/wallet";
import { SystemProgram, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";

interface PaymentButtonProps {
  recipient: string;
  amount: number; // in SOL
}

export function PaymentButton({ recipient, amount }: PaymentButtonProps) {
  const { isConnected, connect, signAndSendTransaction, smartWalletPubkey } = useWallet();

  const handlePayment = async () => {
    // Connect if not already connected
    if (!isConnected) {
      await connect();
      return;
    }

    try {
      // Create transfer instruction
      const instruction = SystemProgram.transfer({
        fromPubkey: smartWalletPubkey!,
        toPubkey: new PublicKey(recipient),
        lamports: amount * LAMPORTS_PER_SOL,
      });

      // Sign and send with gasless option
      const signature = await signAndSendTransaction({
        instructions: [instruction],
        transactionOptions: {
          // Pay fees with USDC instead of SOL (gasless)
          feeToken: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        },
      });

      console.log("Transaction successful:", signature);
      return signature;
    } catch (error) {
      console.error("Payment failed:", error);
      throw error;
    }
  };

  return (
    <button onClick={handlePayment}>
      Pay {amount} SOL
    </button>
  );
}
```

**Key Points:**
- `signAndSendTransaction` handles all signing and submission
- Setting `feeToken` enables gasless transactions
- The user only sees a biometric prompt—no complex UX

## Project Structure

```
lazorpay/
├── src/
│   ├── app/
│   │   ├── layout.tsx        # Root layout with provider
│   │   ├── page.tsx          # Landing page
│   │   ├── checkout/         # Checkout demo page
│   │   ├── pay/              # Payment link generator
│   │   └── docs/             # Documentation page
│   ├── components/
│   │   ├── layout/           # Header, Footer
│   │   ├── wallet/           # ConnectButton
│   │   └── payment/          # PaymentModal, LazorPayButton
│   ├── lib/
│   │   ├── lazorkit/         # SDK configuration
│   │   └── utils/            # Formatting utilities
│   └── types/                # TypeScript definitions
└── public/                   # Static assets
```

## Components Reference

### LazorPayButton

A drop-in payment button with built-in modal.

```tsx
<LazorPayButton
  recipient="WALLET_ADDRESS"
  amount={10}
  token="SOL"
  merchantName="My Store"
  memo="Order #123"
  onSuccess={(result) => console.log(result.signature)}
  onError={(error) => console.error(error)}
  variant="default"  // "default" | "outline" | "minimal"
  size="md"          // "sm" | "md" | "lg"
/>
```

### ConnectButton

Styled wallet connection button.

```tsx
<ConnectButton
  variant="default"  // "default" | "outline" | "ghost"
  size="md"          // "sm" | "md" | "lg"
  className="custom-class"
/>
```

### PaymentModal

Full-screen payment modal with status tracking.

```tsx
<PaymentModal
  isOpen={true}
  onClose={() => setOpen(false)}
  recipient="WALLET_ADDRESS"
  amount={5}
  token="USDC"
  merchantName="Coffee Shop"
  onSuccess={handleSuccess}
  onError={handleError}
/>
```

## useWallet Hook Reference

```tsx
const {
  // Connection state
  isConnected,      // boolean - wallet connected
  isConnecting,     // boolean - connection in progress

  // Wallet info
  smartWalletPubkey, // PublicKey | null - smart wallet address

  // Actions
  connect,          // () => Promise<void> - initiate connection
  disconnect,       // () => void - disconnect wallet

  // Transactions
  signAndSendTransaction, // (params) => Promise<string>
  signMessage,            // (message) => Promise<Uint8Array>
} = useWallet();
```

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy!

```bash
npm run build  # Test production build locally
```

### Environment Variables for Production

```env
NEXT_PUBLIC_RPC_URL=https://api.mainnet-beta.solana.com
NEXT_PUBLIC_PORTAL_URL=https://portal.lazor.sh
NEXT_PUBLIC_PAYMASTER_URL=https://kora.mainnet.lazorkit.com
NEXT_PUBLIC_CLUSTER=mainnet
```

## Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4
- **Wallet SDK**: @lazorkit/wallet
- **Blockchain**: Solana (via @solana/web3.js)
- **Icons**: Lucide React
- **QR Codes**: qrcode.react

## Resources

- [LazorKit Documentation](https://docs.lazorkit.com)
- [LazorKit GitHub](https://github.com/lazor-kit/lazor-kit)
- [Solana Web3.js Docs](https://solana-labs.github.io/solana-web3.js/)

## License

MIT License - feel free to use this as a starting point for your own projects!

---

Built for the LazorKit SDK Bounty
