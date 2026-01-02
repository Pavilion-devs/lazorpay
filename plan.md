# LazorPay - Implementation Plan

> A passkey-powered payment SDK starter template for Solana, built with LazorKit

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Why LazorPay Wins](#why-lazorpay-wins)
3. [Core Features](#core-features)
4. [Technical Architecture](#technical-architecture)
5. [Project Structure](#project-structure)
6. [Implementation Phases](#implementation-phases)
7. [UI/UX Design](#uiux-design)
8. [Tutorials We'll Create](#tutorials-well-create)
9. [Deployment Strategy](#deployment-strategy)
10. [Success Metrics](#success-metrics)

---

## Project Overview

### What is LazorPay?

LazorPay is a **Next.js starter template** that demonstrates how to build a complete payment solution using LazorKit SDK. It showcases:

- **Passkey Authentication** - No seed phrases, just biometrics
- **Gasless USDC Payments** - Users don't need SOL for gas fees
- **Embeddable Payment Widget** - "Pay with Solana" button for any website
- **Payment Links** - Shareable links for easy payments
- **Merchant Dashboard** - Track payments in real-time

### Target Audience

- Solana developers wanting to integrate passkey payments
- E-commerce platforms looking for crypto payment solutions
- DApp builders needing gasless transaction examples

---

## Why LazorPay Wins

### Judging Criteria Alignment

| Criteria | Weight | Our Strategy |
|----------|--------|--------------|
| **Clarity & Usefulness** | 40% | Comprehensive README, inline comments, 3 step-by-step tutorials |
| **SDK Integration Quality** | 30% | Demonstrates ALL key features: passkey auth, gasless tx, USDC transfers |
| **Code Structure & Reusability** | 30% | Component library pattern, hooks, clean separation of concerns |

### Competitive Advantages

1. **Unique Use Case** - No existing payment widget example in the repo
2. **Real-World Application** - E-commerce/payment is highly practical
3. **Multiple Integration Demos** - Shows various ways to use LazorKit
4. **Production-Ready Patterns** - Error handling, loading states, TypeScript
5. **Bonus Content** - Blog-ready tutorials for extra points

---

## Core Features

### 1. Passkey Wallet Connection

```
User Flow:
[Landing Page] → [Connect Wallet Button] → [Passkey Prompt (FaceID/TouchID)] → [Connected State]
```

**Implementation:**
- `useWallet()` hook from `@lazorkit/wallet`
- Session persistence across page refreshes
- Disconnect functionality

### 2. Gasless USDC Payments

```
User Flow:
[Enter Amount] → [Review Payment] → [Sign with Passkey] → [Transaction Confirmed]
```

**Implementation:**
- SPL Token transfers using USDC mint address
- Paymaster configuration for gas sponsorship
- Transaction status tracking

### 3. Payment Widget (Embeddable Component)

```jsx
// How developers will use it
<LazorPayButton
  amount={10.00}
  currency="USDC"
  recipient="merchant_wallet_address"
  onSuccess={(txHash) => console.log('Paid!', txHash)}
  onError={(error) => console.error(error)}
/>
```

**Implementation:**
- Standalone React component
- Customizable styling (themes)
- Callback handlers for integration
- Modal-based checkout flow

### 4. Payment Links

```
Generated Link Format:
https://lazorpay.vercel.app/pay?to=WALLET&amount=10&token=USDC&memo=Order123
```

**Implementation:**
- Dynamic route `/pay/[id]` or query params
- QR code generation
- Link sharing functionality
- Payment metadata support

### 5. Merchant Dashboard (Demo)

**Features:**
- View payment history
- Total revenue display
- Recent transactions list
- Export functionality (optional)

**Implementation:**
- Local storage for demo (no backend needed)
- Transaction listener using Solana connection
- Simple analytics display

---

## Technical Architecture

### Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| State Management | React Context + Zustand (if needed) |
| Blockchain | LazorKit SDK (`@lazorkit/wallet`) |
| Solana Libraries | `@solana/web3.js`, `@solana/spl-token` |
| UI Components | shadcn/ui (optional) or custom |
| Icons | Lucide React |
| Deployment | Vercel |

### LazorKit Integration Points

```typescript
// 1. Provider Setup (app/providers.tsx)
<LazorkitProvider
  rpcUrl={process.env.NEXT_PUBLIC_RPC_URL}
  portalUrl="https://portal.lazor.sh"
  paymasterConfig={{
    paymasterUrl: "https://kora.devnet.lazorkit.com",
  }}
>
  {children}
</LazorkitProvider>

// 2. Wallet Hook Usage (components/ConnectButton.tsx)
const { connect, disconnect, isConnected, wallet, smartWalletPubkey } = useWallet();

// 3. Transaction Signing (lib/payments.ts)
const signature = await signAndSendTransaction({
  instructions: [transferInstruction],
  transactionOptions: {
    feeToken: 'USDC', // Gasless!
  }
});
```

### Key Dependencies

```json
{
  "dependencies": {
    "@lazorkit/wallet": "latest",
    "@solana/web3.js": "^1.87.0",
    "@solana/spl-token": "^0.3.8",
    "@coral-xyz/anchor": "^0.29.0",
    "next": "14.x",
    "react": "18.x",
    "tailwindcss": "^3.4.0",
    "zustand": "^4.4.0",
    "lucide-react": "^0.294.0",
    "qrcode.react": "^3.1.0"
  }
}
```

---

## Project Structure

```
lazorpay/
├── app/
│   ├── layout.tsx              # Root layout with providers
│   ├── page.tsx                # Landing page / Hero
│   ├── globals.css             # Global styles
│   │
│   ├── checkout/
│   │   └── page.tsx            # Checkout demo page
│   │
│   ├── pay/
│   │   └── page.tsx            # Payment link handler
│   │
│   ├── dashboard/
│   │   └── page.tsx            # Merchant dashboard
│   │
│   └── docs/
│       └── page.tsx            # Integration guide
│
├── components/
│   ├── ui/                     # Base UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── modal.tsx
│   │   └── toast.tsx
│   │
│   ├── wallet/                 # Wallet-related components
│   │   ├── ConnectButton.tsx   # Main connect button
│   │   ├── WalletInfo.tsx      # Display wallet info
│   │   └── DisconnectButton.tsx
│   │
│   ├── payment/                # Payment components
│   │   ├── LazorPayButton.tsx  # Embeddable widget
│   │   ├── PaymentModal.tsx    # Checkout modal
│   │   ├── PaymentForm.tsx     # Amount input form
│   │   ├── PaymentStatus.tsx   # Transaction status
│   │   └── PaymentLink.tsx     # Payment link generator
│   │
│   ├── dashboard/              # Dashboard components
│   │   ├── TransactionList.tsx
│   │   ├── StatsCards.tsx
│   │   └── RevenueChart.tsx
│   │
│   └── layout/                 # Layout components
│       ├── Header.tsx
│       ├── Footer.tsx
│       └── Sidebar.tsx
│
├── lib/
│   ├── lazorkit/
│   │   ├── provider.tsx        # LazorKit provider wrapper
│   │   ├── config.ts           # SDK configuration
│   │   └── constants.ts        # Token addresses, etc.
│   │
│   ├── solana/
│   │   ├── tokens.ts           # SPL token helpers
│   │   ├── transactions.ts     # Transaction builders
│   │   └── utils.ts            # Utility functions
│   │
│   └── utils/
│       ├── format.ts           # Formatting helpers
│       ├── validation.ts       # Input validation
│       └── storage.ts          # Local storage helpers
│
├── hooks/
│   ├── usePayment.ts           # Payment logic hook
│   ├── useTransactionHistory.ts # History tracking
│   └── useTokenBalance.ts      # Balance fetching
│
├── store/
│   └── payment-store.ts        # Zustand store (if needed)
│
├── types/
│   └── index.ts                # TypeScript types
│
├── tutorials/                  # Tutorial markdown files
│   ├── 01-passkey-wallet-setup.md
│   ├── 02-gasless-usdc-payment.md
│   └── 03-embed-payment-widget.md
│
├── public/
│   ├── images/
│   └── icons/
│
├── .env.example                # Environment template
├── .env.local                  # Local environment (gitignored)
├── next.config.js              # Next.js configuration
├── tailwind.config.js          # Tailwind configuration
├── tsconfig.json               # TypeScript configuration
├── package.json
└── README.md                   # Main documentation
```

---

## Implementation Phases

### Phase 1: Project Setup & Foundation
**Files to create:**
- [ ] Initialize Next.js project with TypeScript
- [ ] Configure Tailwind CSS
- [ ] Set up LazorKit provider
- [ ] Create base UI components
- [ ] Configure environment variables

**Key Tasks:**
1. `npx create-next-app@latest lazorpay --typescript --tailwind --app`
2. Install LazorKit and Solana dependencies
3. Set up polyfills for browser compatibility
4. Create provider wrapper component

### Phase 2: Wallet Integration
**Files to create:**
- [ ] `components/wallet/ConnectButton.tsx`
- [ ] `components/wallet/WalletInfo.tsx`
- [ ] `lib/lazorkit/provider.tsx`
- [ ] `lib/lazorkit/config.ts`

**Key Tasks:**
1. Implement connect/disconnect functionality
2. Display wallet address and balance
3. Handle session persistence
4. Add loading and error states

### Phase 3: Payment System
**Files to create:**
- [ ] `components/payment/LazorPayButton.tsx`
- [ ] `components/payment/PaymentModal.tsx`
- [ ] `components/payment/PaymentForm.tsx`
- [ ] `components/payment/PaymentStatus.tsx`
- [ ] `lib/solana/transactions.ts`
- [ ] `hooks/usePayment.ts`

**Key Tasks:**
1. Build USDC transfer instruction creator
2. Implement gasless transaction flow
3. Create payment modal with amount input
4. Add transaction confirmation UI
5. Handle success/error callbacks

### Phase 4: Payment Links & QR Codes
**Files to create:**
- [ ] `app/pay/page.tsx`
- [ ] `components/payment/PaymentLink.tsx`
- [ ] `components/payment/QRCode.tsx`

**Key Tasks:**
1. Create dynamic payment link route
2. Parse URL parameters for payment details
3. Generate QR codes for links
4. Add share functionality

### Phase 5: Merchant Dashboard
**Files to create:**
- [ ] `app/dashboard/page.tsx`
- [ ] `components/dashboard/TransactionList.tsx`
- [ ] `components/dashboard/StatsCards.tsx`
- [ ] `hooks/useTransactionHistory.ts`
- [ ] `lib/utils/storage.ts`

**Key Tasks:**
1. Track transactions in local storage
2. Display transaction history
3. Calculate and show statistics
4. Add filtering/sorting

### Phase 6: Documentation & Tutorials
**Files to create:**
- [ ] `README.md` (comprehensive)
- [ ] `tutorials/01-passkey-wallet-setup.md`
- [ ] `tutorials/02-gasless-usdc-payment.md`
- [ ] `tutorials/03-embed-payment-widget.md`
- [ ] `app/docs/page.tsx`

**Key Tasks:**
1. Write detailed README with quick start
2. Create step-by-step tutorials
3. Add inline code comments
4. Build in-app documentation page

### Phase 7: Polish & Deploy
**Tasks:**
- [ ] Add responsive design
- [ ] Implement dark/light mode
- [ ] Add loading skeletons
- [ ] Error boundary implementation
- [ ] Deploy to Vercel
- [ ] Test on Devnet
- [ ] Final code review

---

## UI/UX Design

### Landing Page

```
┌─────────────────────────────────────────────────────────────┐
│  [Logo] LazorPay                    [Connect Wallet]        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│              Passkey-Powered Payments                       │
│                   for Solana                                │
│                                                             │
│     Accept USDC payments with zero gas fees                 │
│     No seed phrases. Just biometrics.                       │
│                                                             │
│         [Try Demo]        [View Docs]                       │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐                 │
│   │ Passkey  │  │ Gasless  │  │ Instant  │                 │
│   │   Auth   │  │   Fees   │  │ Payments │                 │
│   └──────────┘  └──────────┘  └──────────┘                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Payment Widget (Modal)

```
┌─────────────────────────────────────┐
│         Pay with LazorPay      [X]  │
├─────────────────────────────────────┤
│                                     │
│   Paying to: merchant.sol           │
│                                     │
│   ┌─────────────────────────────┐   │
│   │    $ 10.00 USDC             │   │
│   └─────────────────────────────┘   │
│                                     │
│   Network Fee: Sponsored (Free!)    │
│                                     │
│   ┌─────────────────────────────┐   │
│   │    Pay with Passkey         │   │
│   │    [Fingerprint Icon]       │   │
│   └─────────────────────────────┘   │
│                                     │
│   Powered by LazorKit               │
└─────────────────────────────────────┘
```

### Payment Success

```
┌─────────────────────────────────────┐
│              [Check]                │
│                                     │
│        Payment Successful!          │
│                                     │
│   Amount: 10.00 USDC                │
│   To: Abc1...xyz9                   │
│                                     │
│   Transaction: 5xK2...mN8p          │
│   [Copy] [View on Explorer]         │
│                                     │
│   ┌─────────────────────────────┐   │
│   │          Done               │   │
│   └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

### Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│  [Logo] LazorPay Dashboard              [Wallet: Abc...xyz] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │ Total Rev   │ │ Transactions│ │ Avg Payment │           │
│  │ $1,234.56   │ │     47      │ │   $26.27    │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
│                                                             │
│  Recent Transactions                                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ From          Amount      Status      Time          │   │
│  │ Xyz...123     10 USDC     Success     2 min ago     │   │
│  │ Abc...456     25 USDC     Success     1 hour ago    │   │
│  │ Def...789     5 USDC      Success     3 hours ago   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [Create Payment Link]                                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Tutorials We'll Create

### Tutorial 1: Setting Up Passkey Wallet Authentication

**Topics Covered:**
- Installing LazorKit SDK
- Configuring the provider
- Implementing connect/disconnect
- Handling wallet state
- Session persistence

**Code Snippets:**
- Provider setup
- ConnectButton component
- useWallet hook usage

### Tutorial 2: Implementing Gasless USDC Payments

**Topics Covered:**
- Understanding the paymaster
- Building transfer instructions
- SPL token transfers
- Transaction options for gasless
- Handling transaction status

**Code Snippets:**
- USDC transfer instruction
- signAndSendTransaction usage
- Error handling patterns

### Tutorial 3: Embedding the Payment Widget

**Topics Covered:**
- Widget component architecture
- Customization options
- Event callbacks
- Styling integration
- Testing the widget

**Code Snippets:**
- LazorPayButton component
- Integration examples
- Callback handling

---

## Deployment Strategy

### Environment Variables

```env
# .env.example
NEXT_PUBLIC_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_PORTAL_URL=https://portal.lazor.sh
NEXT_PUBLIC_PAYMASTER_URL=https://kora.devnet.lazorkit.com
NEXT_PUBLIC_USDC_MINT=Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr
NEXT_PUBLIC_NETWORK=devnet
```

### Vercel Deployment

1. Connect GitHub repo to Vercel
2. Configure environment variables
3. Deploy to `lazorpay.vercel.app` (or similar)
4. Test all flows on Devnet

### Testing Checklist

- [ ] Wallet connection works on Chrome, Safari, Firefox
- [ ] Passkey prompt appears correctly
- [ ] USDC transfer completes successfully
- [ ] Payment links work correctly
- [ ] Dashboard displays transactions
- [ ] Mobile responsive design works
- [ ] Error states display properly

---

## Success Metrics

### Bounty Requirements Checklist

| Requirement | Implementation |
|-------------|----------------|
| Working Example Repo | Next.js app with all features |
| Framework (Next.js/Vite/Expo) | Next.js 14 with App Router |
| Clean folder structure | See Project Structure section |
| Well-documented code | JSDoc comments + inline explanations |
| Quick-Start Guide | README with 5-minute setup |
| 2+ Step-by-Step Tutorials | 3 tutorials in /tutorials folder |
| Live Demo | Deployed on Vercel + Devnet |

### Quality Indicators

- TypeScript for type safety
- Error boundaries for resilience
- Loading states for UX
- Responsive design
- Accessible UI components
- Clean git history with meaningful commits

---

## Next Steps

1. **Review this plan** - Make any adjustments needed
2. **Initialize project** - Set up Next.js with all configs
3. **Implement in phases** - Follow the phase breakdown
4. **Test thoroughly** - Each feature on Devnet
5. **Write documentation** - As we build
6. **Deploy and submit** - Before deadline

---

## Reference Materials

- LazorKit SDK Reference: `./lazorkit-sdk-reference/`
- LazorKit Docs: https://docs.lazorkit.com/
- Solana Web3.js: https://solana-labs.github.io/solana-web3.js/
- SPL Token: https://spl.solana.com/token

---

*Plan created: December 30, 2024*
*Bounty deadline: January 15, 2026*
