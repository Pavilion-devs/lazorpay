"use client";

/**
 * Documentation Page
 * Quick start guide and API reference for LazorPay
 */

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Book,
  Code2,
  Zap,
  Package,
  Fingerprint,
  CreditCard,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  Coins,
  Home,
  Settings,
  Wallet,
  Link as LinkIcon,
} from "lucide-react";

type Tab = "quickstart" | "components" | "hooks" | "examples";

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "quickstart", label: "Quick Start", icon: Zap },
  { id: "components", label: "Components", icon: Package },
  { id: "hooks", label: "Hooks", icon: Code2 },
  { id: "examples", label: "Examples", icon: Book },
];

// Code snippets
const codeSnippets = {
  install: `npm install @lazorkit/wallet @solana/web3.js`,
  provider: `// app/layout.tsx
import { LazorkitProvider } from "@lazorkit/wallet";

export default function RootLayout({ children }) {
  return (
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
  );
}`,
  connectButton: `import { useWallet } from "@lazorkit/wallet";

function ConnectButton() {
  const { isConnected, connect, disconnect, smartWalletPubkey } = useWallet();

  if (isConnected) {
    return (
      <button onClick={disconnect}>
        {smartWalletPubkey?.toString().slice(0, 8)}...
      </button>
    );
  }

  return <button onClick={connect}>Connect Wallet</button>;
}`,
  payment: `import { useWallet } from "@lazorkit/wallet";
import { SystemProgram, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";

function PaymentButton({ recipient, amount }) {
  const { signAndSendTransaction, smartWalletPubkey } = useWallet();

  const handlePayment = async () => {
    const instruction = SystemProgram.transfer({
      fromPubkey: smartWalletPubkey,
      toPubkey: new PublicKey(recipient),
      lamports: amount * LAMPORTS_PER_SOL,
    });

    const signature = await signAndSendTransaction({
      instructions: [instruction],
      transactionOptions: {
        // Enable gasless with USDC fee payment
        feeToken: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      },
    });

    console.log("Transaction:", signature);
  };

  return <button onClick={handlePayment}>Pay {amount} SOL</button>;
}`,
  fullExample: `"use client";
import { useState } from "react";
import { useWallet } from "@lazorkit/wallet";
import { SystemProgram, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";

export function CheckoutForm({ recipient, amount }) {
  const { isConnected, connect, signAndSendTransaction, smartWalletPubkey } = useWallet();
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle");

  const handleCheckout = async () => {
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

      const signature = await signAndSendTransaction({
        instructions: [instruction],
      });

      setStatus("success");
      console.log("Success:", signature);
    } catch (error) {
      setStatus("error");
      console.error(error);
    }
  };

  return (
    <div>
      <p>Amount: {amount} SOL</p>
      <button onClick={handleCheckout} disabled={status === "processing"}>
        {status === "processing" ? "Processing..." :
         status === "success" ? "✓ Paid" :
         isConnected ? "Pay Now" : "Connect & Pay"}
      </button>
    </div>
  );
}`,
  usdcPayment: `import { useWallet } from "@lazorkit/wallet";
import { Connection, PublicKey } from "@solana/web3.js";
import { buildUSDCTransferInstructions } from "@/lib/solana/tokens";

export function USDCPaymentButton({ recipient, amount }) {
  const { signAndSendTransaction, smartWalletPubkey } = useWallet();

  const handlePayment = async () => {
    const connection = new Connection("https://api.devnet.solana.com");

    // Build USDC transfer instructions (auto-creates recipient ATA if needed)
    const instructions = await buildUSDCTransferInstructions({
      connection,
      from: smartWalletPubkey!,
      to: new PublicKey(recipient),
      amount, // Human-readable amount (e.g., 10 for 10 USDC)
    });

    const signature = await signAndSendTransaction({
      instructions,
      transactionOptions: {
        clusterSimulation: "devnet",
      },
    });

    console.log("USDC Transfer:", signature);
  };

  return <button onClick={handlePayment}>Pay {amount} USDC</button>;
}`,
  paymentLink: `// Generate a shareable payment link
function generatePaymentLink({ recipient, amount, token, memo, merchantName }) {
  const baseUrl = window.location.origin;
  const params = new URLSearchParams({
    to: recipient,
    amount: amount.toString(),
    token: token,
  });

  if (memo) params.set("memo", memo);
  if (merchantName) params.set("merchant", merchantName);

  return \`\${baseUrl}/pay/checkout?\${params.toString()}\`;
}

// Usage
const link = generatePaymentLink({
  recipient: "YourWalletAddress...",
  amount: 10,
  token: "USDC",
  memo: "Order #1234",
  merchantName: "My Store",
});

// Result: https://yoursite.com/pay/checkout?to=...&amount=10&token=USDC&memo=Order%20%231234&merchant=My%20Store`,
};

function CodeBlock({
  code,
  language = "typescript",
}: {
  code: string;
  language?: string;
}) {
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <button
        onClick={copyCode}
        className="absolute top-3 right-3 p-2 rounded-lg bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {copied ? (
          <Check className="w-4 h-4 text-emerald-400" />
        ) : (
          <Copy className="w-4 h-4 text-white/60" />
        )}
      </button>
      <pre className="bg-black/50 border border-white/10 rounded-xl p-4 overflow-x-auto">
        <code className="text-sm text-white/80 font-mono">{code}</code>
      </pre>
    </div>
  );
}

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("quickstart");

  return (
    <div className="min-h-screen flex">
      {/* Fixed Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-zinc-950/90 border-r border-white/10 flex flex-col z-50">
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/lazorpay-logo.svg"
              alt="LazorPay"
              width={120}
              height={40}
              className="w-auto h-8"
            />
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="mb-4">
            <Link
              href="/"
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors"
            >
              <Home className="w-4 h-4" />
              <span className="text-sm font-medium">Home</span>
            </Link>
          </div>

          <p className="px-4 text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">
            Documentation
          </p>

          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-colors ${
                  activeTab === tab.id
                    ? "bg-violet-500/10 text-violet-400 border border-violet-500/30"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-8 pt-6 border-t border-white/10">
            <p className="px-4 text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">
              Resources
            </p>
            <a
              href="https://docs.lazorkit.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="text-sm font-medium">LazorKit Docs</span>
            </a>
            <a
              href="https://github.com/user/lazorpay"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors"
            >
              <Code2 className="w-4 h-4" />
              <span className="text-sm font-medium">GitHub</span>
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors"
          >
            <Wallet className="w-4 h-4" />
            Dashboard
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 min-h-screen">
        <div className="max-w-4xl mx-auto px-8 py-12">
          {/* Quick Start Tab */}
              {activeTab === "quickstart" && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-3xl font-light text-white mb-4">
                      Quick Start Guide
                    </h2>
                    <p className="text-white/60">
                      Get started with LazorPay in under 5 minutes. This guide
                      will walk you through setting up passkey-powered payments
                      in your React application.
                    </p>
                  </div>

                  {/* Step 1 */}
                  <div className="glass-card p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
                        1
                      </div>
                      <h3 className="text-lg font-medium text-white">
                        Install Dependencies
                      </h3>
                    </div>
                    <p className="text-white/60 mb-4 text-sm">
                      Install the LazorKit wallet SDK and Solana web3.js library.
                    </p>
                    <CodeBlock code={codeSnippets.install} language="bash" />
                  </div>

                  {/* Step 2 */}
                  <div className="glass-card p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
                        2
                      </div>
                      <h3 className="text-lg font-medium text-white">
                        Wrap Your App with Provider
                      </h3>
                    </div>
                    <p className="text-white/60 mb-4 text-sm">
                      Add the LazorkitProvider to your root layout. This enables
                      passkey authentication and wallet functionality throughout
                      your app.
                    </p>
                    <CodeBlock code={codeSnippets.provider} />
                  </div>

                  {/* Step 3 */}
                  <div className="glass-card p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
                        3
                      </div>
                      <h3 className="text-lg font-medium text-white">
                        Add Connect Button
                      </h3>
                    </div>
                    <p className="text-white/60 mb-4 text-sm">
                      Create a connect button component using the useWallet hook.
                      Users will be prompted to authenticate with their passkey.
                    </p>
                    <CodeBlock code={codeSnippets.connectButton} />
                  </div>

                  {/* Step 4 */}
                  <div className="glass-card p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
                        4
                      </div>
                      <h3 className="text-lg font-medium text-white">
                        Accept Payments
                      </h3>
                    </div>
                    <p className="text-white/60 mb-4 text-sm">
                      Use signAndSendTransaction to process payments. Enable
                      gasless transactions by specifying a feeToken.
                    </p>
                    <CodeBlock code={codeSnippets.payment} />
                  </div>

                  {/* Success */}
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                    <p className="text-emerald-400">
                      That&apos;s it! You now have passkey-powered payments in your
                      app.
                    </p>
                  </div>
                </div>
              )}

              {/* Components Tab */}
              {activeTab === "components" && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-3xl font-light text-white mb-4">
                      Components
                    </h2>
                    <p className="text-white/60">
                      LazorPay provides pre-built React components for common
                      payment flows.
                    </p>
                  </div>

                  {/* LazorPayButton */}
                  <div className="glass-card p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <CreditCard className="w-5 h-5 text-emerald-400" />
                      <h3 className="text-lg font-medium text-white">
                        LazorPayButton
                      </h3>
                    </div>
                    <p className="text-white/60 mb-4 text-sm">
                      A drop-in payment button that opens a modal for payment
                      processing.
                    </p>

                    <h4 className="text-white font-medium mb-2 text-sm">Props</h4>
                    <div className="bg-black/30 rounded-lg overflow-hidden mb-4">
                      <table className="w-full text-sm">
                        <thead className="bg-white/5">
                          <tr>
                            <th className="text-left p-3 text-white/60 font-medium">
                              Prop
                            </th>
                            <th className="text-left p-3 text-white/60 font-medium">
                              Type
                            </th>
                            <th className="text-left p-3 text-white/60 font-medium">
                              Required
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          <tr>
                            <td className="p-3 text-white font-mono">recipient</td>
                            <td className="p-3 text-white/60">string</td>
                            <td className="p-3 text-emerald-400">Yes</td>
                          </tr>
                          <tr>
                            <td className="p-3 text-white font-mono">amount</td>
                            <td className="p-3 text-white/60">number</td>
                            <td className="p-3 text-emerald-400">Yes</td>
                          </tr>
                          <tr>
                            <td className="p-3 text-white font-mono">token</td>
                            <td className="p-3 text-white/60">&quot;SOL&quot; | &quot;USDC&quot;</td>
                            <td className="p-3 text-white/60">No</td>
                          </tr>
                          <tr>
                            <td className="p-3 text-white font-mono">onSuccess</td>
                            <td className="p-3 text-white/60">
                              (result) =&gt; void
                            </td>
                            <td className="p-3 text-white/60">No</td>
                          </tr>
                          <tr>
                            <td className="p-3 text-white font-mono">onError</td>
                            <td className="p-3 text-white/60">(error) =&gt; void</td>
                            <td className="p-3 text-white/60">No</td>
                          </tr>
                          <tr>
                            <td className="p-3 text-white font-mono">variant</td>
                            <td className="p-3 text-white/60">
                              &quot;default&quot; | &quot;outline&quot; | &quot;minimal&quot;
                            </td>
                            <td className="p-3 text-white/60">No</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* ConnectButton */}
                  <div className="glass-card p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Fingerprint className="w-5 h-5 text-emerald-400" />
                      <h3 className="text-lg font-medium text-white">
                        ConnectButton
                      </h3>
                    </div>
                    <p className="text-white/60 mb-4 text-sm">
                      A styled button for wallet connection with built-in state
                      management.
                    </p>

                    <h4 className="text-white font-medium mb-2 text-sm">Props</h4>
                    <div className="bg-black/30 rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-white/5">
                          <tr>
                            <th className="text-left p-3 text-white/60 font-medium">
                              Prop
                            </th>
                            <th className="text-left p-3 text-white/60 font-medium">
                              Type
                            </th>
                            <th className="text-left p-3 text-white/60 font-medium">
                              Default
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          <tr>
                            <td className="p-3 text-white font-mono">variant</td>
                            <td className="p-3 text-white/60">
                              &quot;default&quot; | &quot;outline&quot; | &quot;ghost&quot;
                            </td>
                            <td className="p-3 text-white/60">&quot;default&quot;</td>
                          </tr>
                          <tr>
                            <td className="p-3 text-white font-mono">size</td>
                            <td className="p-3 text-white/60">
                              &quot;sm&quot; | &quot;md&quot; | &quot;lg&quot;
                            </td>
                            <td className="p-3 text-white/60">&quot;md&quot;</td>
                          </tr>
                          <tr>
                            <td className="p-3 text-white font-mono">className</td>
                            <td className="p-3 text-white/60">string</td>
                            <td className="p-3 text-white/60">&quot;&quot;</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* PaymentModal */}
                  <div className="glass-card p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Wallet className="w-5 h-5 text-violet-400" />
                      <h3 className="text-lg font-medium text-white">
                        PaymentModal
                      </h3>
                    </div>
                    <p className="text-white/60 mb-4 text-sm">
                      A complete payment modal with wallet connection, transaction signing,
                      and status handling. Supports both SOL and USDC transfers.
                    </p>

                    <h4 className="text-white font-medium mb-2 text-sm">Props</h4>
                    <div className="bg-black/30 rounded-lg overflow-hidden mb-4">
                      <table className="w-full text-sm">
                        <thead className="bg-white/5">
                          <tr>
                            <th className="text-left p-3 text-white/60 font-medium">
                              Prop
                            </th>
                            <th className="text-left p-3 text-white/60 font-medium">
                              Type
                            </th>
                            <th className="text-left p-3 text-white/60 font-medium">
                              Required
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          <tr>
                            <td className="p-3 text-white font-mono">isOpen</td>
                            <td className="p-3 text-white/60">boolean</td>
                            <td className="p-3 text-violet-400">Yes</td>
                          </tr>
                          <tr>
                            <td className="p-3 text-white font-mono">onClose</td>
                            <td className="p-3 text-white/60">() =&gt; void</td>
                            <td className="p-3 text-violet-400">Yes</td>
                          </tr>
                          <tr>
                            <td className="p-3 text-white font-mono">recipient</td>
                            <td className="p-3 text-white/60">string</td>
                            <td className="p-3 text-violet-400">Yes</td>
                          </tr>
                          <tr>
                            <td className="p-3 text-white font-mono">amount</td>
                            <td className="p-3 text-white/60">number</td>
                            <td className="p-3 text-violet-400">Yes</td>
                          </tr>
                          <tr>
                            <td className="p-3 text-white font-mono">token</td>
                            <td className="p-3 text-white/60">&quot;SOL&quot; | &quot;USDC&quot;</td>
                            <td className="p-3 text-white/60">No (default: SOL)</td>
                          </tr>
                          <tr>
                            <td className="p-3 text-white font-mono">memo</td>
                            <td className="p-3 text-white/60">string</td>
                            <td className="p-3 text-white/60">No</td>
                          </tr>
                          <tr>
                            <td className="p-3 text-white font-mono">merchantName</td>
                            <td className="p-3 text-white/60">string</td>
                            <td className="p-3 text-white/60">No</td>
                          </tr>
                          <tr>
                            <td className="p-3 text-white font-mono">onSuccess</td>
                            <td className="p-3 text-white/60">(result) =&gt; void</td>
                            <td className="p-3 text-white/60">No</td>
                          </tr>
                          <tr>
                            <td className="p-3 text-white font-mono">onError</td>
                            <td className="p-3 text-white/60">(error) =&gt; void</td>
                            <td className="p-3 text-white/60">No</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <h4 className="text-white font-medium mb-2 text-sm">Features</h4>
                    <ul className="space-y-2 text-sm text-white/60">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-violet-400" />
                        Automatic wallet connection flow
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-violet-400" />
                        Passkey-based transaction signing
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-violet-400" />
                        Gasless transactions via paymaster
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-violet-400" />
                        SOL and USDC support
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-violet-400" />
                        Transaction status feedback
                      </li>
                    </ul>
                  </div>

                  {/* CreatePaymentModal */}
                  <div className="glass-card p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <LinkIcon className="w-5 h-5 text-violet-400" />
                      <h3 className="text-lg font-medium text-white">
                        CreatePaymentModal
                      </h3>
                    </div>
                    <p className="text-white/60 mb-4 text-sm">
                      A modal for creating shareable payment links with QR code generation.
                      Perfect for merchants who want to generate payment requests.
                    </p>

                    <h4 className="text-white font-medium mb-2 text-sm">Props</h4>
                    <div className="bg-black/30 rounded-lg overflow-hidden mb-4">
                      <table className="w-full text-sm">
                        <thead className="bg-white/5">
                          <tr>
                            <th className="text-left p-3 text-white/60 font-medium">
                              Prop
                            </th>
                            <th className="text-left p-3 text-white/60 font-medium">
                              Type
                            </th>
                            <th className="text-left p-3 text-white/60 font-medium">
                              Required
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          <tr>
                            <td className="p-3 text-white font-mono">isOpen</td>
                            <td className="p-3 text-white/60">boolean</td>
                            <td className="p-3 text-violet-400">Yes</td>
                          </tr>
                          <tr>
                            <td className="p-3 text-white font-mono">onClose</td>
                            <td className="p-3 text-white/60">() =&gt; void</td>
                            <td className="p-3 text-violet-400">Yes</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <h4 className="text-white font-medium mb-2 text-sm">Features</h4>
                    <ul className="space-y-2 text-sm text-white/60">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-violet-400" />
                        QR code generation for easy sharing
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-violet-400" />
                        One-click link copying
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-violet-400" />
                        Native share API support
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-violet-400" />
                        Pre-filled with connected wallet
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Hooks Tab */}
              {activeTab === "hooks" && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-3xl font-light text-white mb-4">
                      Hooks Reference
                    </h2>
                    <p className="text-white/60">
                      LazorKit provides React hooks for wallet operations.
                    </p>
                  </div>

                  {/* useWallet */}
                  <div className="glass-card p-6">
                    <h3 className="text-lg font-medium text-white mb-4">
                      useWallet()
                    </h3>
                    <p className="text-white/60 mb-4 text-sm">
                      The main hook for interacting with the LazorKit wallet.
                    </p>

                    <h4 className="text-white font-medium mb-2 text-sm">
                      Return Values
                    </h4>
                    <div className="space-y-3">
                      {[
                        {
                          name: "isConnected",
                          type: "boolean",
                          desc: "Whether a wallet is connected",
                        },
                        {
                          name: "isConnecting",
                          type: "boolean",
                          desc: "Connection in progress",
                        },
                        {
                          name: "smartWalletPubkey",
                          type: "PublicKey | null",
                          desc: "The connected smart wallet address",
                        },
                        {
                          name: "connect",
                          type: "() => Promise<void>",
                          desc: "Initiates passkey authentication",
                        },
                        {
                          name: "disconnect",
                          type: "() => void",
                          desc: "Disconnects the wallet",
                        },
                        {
                          name: "signAndSendTransaction",
                          type: "(params) => Promise<string>",
                          desc: "Signs and sends a transaction",
                        },
                        {
                          name: "signMessage",
                          type: "(message) => Promise<Uint8Array>",
                          desc: "Signs a message with the wallet",
                        },
                      ].map((item) => (
                        <div
                          key={item.name}
                          className="flex items-start gap-4 p-3 rounded-lg bg-white/5"
                        >
                          <code className="text-emerald-400 font-mono text-sm whitespace-nowrap">
                            {item.name}
                          </code>
                          <div>
                            <code className="text-white/60 text-xs">
                              {item.type}
                            </code>
                            <p className="text-white/50 text-sm mt-1">
                              {item.desc}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* signAndSendTransaction */}
                  <div className="glass-card p-6">
                    <h3 className="text-lg font-medium text-white mb-4">
                      signAndSendTransaction Options
                    </h3>
                    <p className="text-white/60 mb-4 text-sm">
                      Configuration options for sending transactions.
                    </p>

                    <div className="space-y-3">
                      {[
                        {
                          name: "instructions",
                          type: "TransactionInstruction[]",
                          desc: "Array of transaction instructions to execute",
                        },
                        {
                          name: "transactionOptions.feeToken",
                          type: "string",
                          desc: "Token mint address for gasless fee payment (USDC)",
                        },
                      ].map((item) => (
                        <div
                          key={item.name}
                          className="flex items-start gap-4 p-3 rounded-lg bg-white/5"
                        >
                          <code className="text-emerald-400 font-mono text-sm whitespace-nowrap">
                            {item.name}
                          </code>
                          <div>
                            <code className="text-white/60 text-xs">
                              {item.type}
                            </code>
                            <p className="text-white/50 text-sm mt-1">
                              {item.desc}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* usePaymentLinks */}
                  <div className="glass-card p-6">
                    <h3 className="text-lg font-medium text-white mb-4">
                      usePaymentLinks()
                    </h3>
                    <p className="text-white/60 mb-4 text-sm">
                      A custom hook for managing payment links with localStorage persistence.
                    </p>

                    <h4 className="text-white font-medium mb-2 text-sm">
                      Return Values
                    </h4>
                    <div className="space-y-3">
                      {[
                        {
                          name: "paymentLinks",
                          type: "PaymentLink[]",
                          desc: "Array of saved payment links",
                        },
                        {
                          name: "createPaymentLink",
                          type: "(data) => PaymentLink",
                          desc: "Creates and saves a new payment link",
                        },
                        {
                          name: "deletePaymentLink",
                          type: "(id: string) => void",
                          desc: "Deletes a payment link by ID",
                        },
                        {
                          name: "getPaymentLink",
                          type: "(id: string) => PaymentLink | undefined",
                          desc: "Retrieves a specific payment link",
                        },
                      ].map((item) => (
                        <div
                          key={item.name}
                          className="flex items-start gap-4 p-3 rounded-lg bg-white/5"
                        >
                          <code className="text-violet-400 font-mono text-sm whitespace-nowrap">
                            {item.name}
                          </code>
                          <div>
                            <code className="text-white/60 text-xs">
                              {item.type}
                            </code>
                            <p className="text-white/50 text-sm mt-1">
                              {item.desc}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Utility Functions */}
                  <div className="glass-card p-6">
                    <h3 className="text-lg font-medium text-white mb-4">
                      Token Utilities
                    </h3>
                    <p className="text-white/60 mb-4 text-sm">
                      Helper functions for working with SOL and USDC transfers.
                    </p>

                    <div className="space-y-3">
                      {[
                        {
                          name: "toBaseUnits(amount, token)",
                          type: "number",
                          desc: "Convert human-readable amount to token base units (lamports/micro-USDC)",
                        },
                        {
                          name: "fromBaseUnits(amount, token)",
                          type: "number",
                          desc: "Convert base units back to human-readable amount",
                        },
                        {
                          name: "buildUSDCTransferInstructions({...})",
                          type: "Promise<TransactionInstruction[]>",
                          desc: "Build instructions for USDC transfer (handles ATA creation)",
                        },
                        {
                          name: "getUSDCBalance(connection, wallet)",
                          type: "Promise<number>",
                          desc: "Get USDC balance for a wallet address",
                        },
                      ].map((item) => (
                        <div
                          key={item.name}
                          className="flex items-start gap-4 p-3 rounded-lg bg-white/5"
                        >
                          <code className="text-violet-400 font-mono text-sm whitespace-nowrap">
                            {item.name}
                          </code>
                          <div>
                            <code className="text-white/60 text-xs">
                              {item.type}
                            </code>
                            <p className="text-white/50 text-sm mt-1">
                              {item.desc}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Examples Tab */}
              {activeTab === "examples" && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-3xl font-light text-white mb-4">
                      Code Examples
                    </h2>
                    <p className="text-white/60">
                      Complete examples to help you integrate LazorPay into your
                      application.
                    </p>
                  </div>

                  {/* Full Checkout Example */}
                  <div className="glass-card p-6">
                    <h3 className="text-lg font-medium text-white mb-4">
                      Complete Checkout Flow
                    </h3>
                    <p className="text-white/60 mb-4 text-sm">
                      A full checkout component with connection, payment, and
                      status handling.
                    </p>
                    <CodeBlock code={codeSnippets.fullExample} />
                  </div>

                  {/* USDC Payment Example */}
                  <div className="glass-card p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Coins className="w-5 h-5 text-violet-400" />
                      <h3 className="text-lg font-medium text-white">
                        USDC Payment
                      </h3>
                    </div>
                    <p className="text-white/60 mb-4 text-sm">
                      Transfer USDC tokens with automatic Associated Token Account creation
                      for recipients who don&apos;t have a USDC account yet.
                    </p>
                    <CodeBlock code={codeSnippets.usdcPayment} />
                  </div>

                  {/* Payment Link Generation */}
                  <div className="glass-card p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <LinkIcon className="w-5 h-5 text-violet-400" />
                      <h3 className="text-lg font-medium text-white">
                        Payment Link Generation
                      </h3>
                    </div>
                    <p className="text-white/60 mb-4 text-sm">
                      Create shareable payment links that customers can use to pay you.
                      Links include recipient, amount, token, and optional memo/merchant info.
                    </p>
                    <CodeBlock code={codeSnippets.paymentLink} />
                  </div>

                  {/* Live Examples */}
                  <div className="glass-card p-6">
                    <h3 className="text-lg font-medium text-white mb-4">
                      Try It Live
                    </h3>
                    <p className="text-white/60 mb-6 text-sm">
                      Check out our live demos to see LazorPay in action.
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <Link
                        href="/checkout"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                      >
                        <CreditCard className="w-4 h-4" />
                        Checkout Demo
                      </Link>
                      <Link
                        href="/pay"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        Payment Link Generator
                      </Link>
                    </div>
                  </div>
                </div>
              )}
        </div>
      </main>
    </div>
  );
}
