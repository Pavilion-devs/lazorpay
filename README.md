# LazorPay

> Passkey-Powered Payment SDK for Solana - Built with LazorKit

[![Built with LazorKit](https://img.shields.io/badge/Built%20with-LazorKit-00D4AA?style=flat-square)](https://docs.lazorkit.com)
[![Solana](https://img.shields.io/badge/Solana-Devnet-9945FF?style=flat-square)](https://solana.com)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square)](https://nextjs.org)

LazorPay is a complete payment solution demonstrating passkey-powered, gasless payments on Solana using the LazorKit SDK. Users authenticate with Face ID, Touch ID, or Windows Hello—no seed phrases, browser extensions, or SOL for gas required.

## Live Demo

**[Try LazorPay Live](https://lazorpay-green.vercel.app/)** on Solana Devnet

| Feature | Link |
|---------|------|
| Checkout Demo | [/checkout](https://lazorpay-green.vercel.app/checkout) |
| Payment Links | [/pay](https://lazorpay-green.vercel.app/pay) |
| Merchant Dashboard | [/dashboard](https://lazorpay-green.vercel.app/dashboard) |
| Documentation | [/docs](https://lazorpay-green.vercel.app/docs) |

## Features

- **Passkey Authentication** - WebAuthn-based login with biometrics
- **Gasless Transactions** - Paymaster-sponsored fees via LazorKit
- **Smart Wallet Integration** - PDA-based wallets controlled by passkeys
- **SOL & USDC Transfers** - Native support for both tokens
- **Payment Links** - Generate shareable links with QR codes
- **Merchant Dashboard** - Track transactions, revenue, and payment links

## Quick Start

```bash
# Clone and install
git clone https://github.com/your-username/lazorpay.git
cd lazorpay
npm install

# Configure environment
cp .env.example .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Documentation

| Guide | Description |
|-------|-------------|
| [Getting Started](./docs/getting-started.md) | Installation and setup |
| [Components](./docs/components.md) | Pre-built UI components |
| [Hooks](./docs/hooks.md) | React hooks reference |
| [Examples](./docs/examples.md) | Code examples |

## Examples

See the [examples/](./examples/) directory for runnable examples:

- **[nextjs-checkout](./examples/nextjs-checkout/)** - Minimal Next.js checkout integration

## Project Structure

```
lazorpay/
├── docs/                   # Documentation (markdown)
├── examples/               # Runnable examples
│   └── nextjs-checkout/    # Next.js example
├── src/
│   ├── app/                # Next.js pages
│   ├── components/         # React components
│   ├── hooks/              # Custom hooks
│   └── lib/                # Utilities
└── public/                 # Static assets
```

## Environment Variables

```env
NEXT_PUBLIC_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_PORTAL_URL=https://portal.lazor.sh
NEXT_PUBLIC_PAYMASTER_URL=https://kora.devnet.lazorkit.com
NEXT_PUBLIC_CLUSTER=devnet
```

## Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4
- **Wallet SDK**: @lazorkit/wallet
- **Blockchain**: Solana (@solana/web3.js)

## Resources

- [LazorKit Documentation](https://docs.lazorkit.com)
- [Solana Web3.js Docs](https://solana-labs.github.io/solana-web3.js/)

## License

MIT License

---

Built for the LazorKit SDK Bounty
