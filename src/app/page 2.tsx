"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Fingerprint,
  Zap,
  CreditCard,
  Shield,
  Eye,
  Check,
  Send,
  Copy,
  Lock,
  ShieldCheck,
  Plus,
  Mail,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

function GlowButton({
  children,
  href = "#",
}: {
  children: React.ReactNode;
  href?: string;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const getBoxShadow = () => {
    if (isPressed) {
      return "0 0 0.6em .25em var(--glow-color), 0 0 2.5em 2em var(--glow-spread-color), inset 0 0 .5em .25em var(--glow-color)";
    }
    if (isHovered) {
      return "0 0 1em .25em var(--glow-color), 0 0 4em 2em var(--glow-spread-color), inset 0 0 .75em .25em var(--glow-color)";
    }
    return "0 0 1em .25em var(--glow-color), 0 0 4em 1em var(--glow-spread-color), inset 0 0 .75em .25em var(--glow-color)";
  };

  return (
    <Link
      href={href}
      className="tracking-tight"
      style={
        {
          "--glow-color": "rgb(217, 176, 255)",
          "--glow-spread-color": "rgba(191, 123, 255, 0.781)",
          "--enhanced-glow-color": "rgb(231, 206, 255)",
          "--btn-color": "rgb(100, 61, 136)",
          border: ".25em solid var(--glow-color)",
          padding: "1em 3em",
          color: isHovered ? "var(--btn-color)" : "var(--glow-color)",
          fontSize: "15px",
          fontWeight: "bold",
          backgroundColor: isHovered
            ? "var(--glow-color)"
            : "var(--btn-color)",
          borderRadius: "1em",
          boxShadow: getBoxShadow(),
          textShadow: "0 0 .5em var(--glow-color)",
          position: "relative",
          textDecoration: "none",
          display: "inline-flex",
          alignItems: "center",
          gap: "0.5rem",
        } as React.CSSProperties
      }
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
    >
      {children}
    </Link>
  );
}

function FeatureCard({
  step,
  title,
  description,
  children,
}: {
  step: number;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <div className="absolute -top-6 left-6 flex text-lg text-zinc-300 tracking-tight bg-white/10 backdrop-blur-sm w-12 h-12 border-white/20 border rounded-full shadow-2xl items-center justify-center z-30 font-medium">
        {step}
      </div>
      <div className="group overflow-hidden transition-all duration-500 hover:border-white/20 hover:bg-zinc-900/30 hover:shadow-xl hover:scale-105 bg-zinc-950/20 backdrop-blur-xl border border-white/10 rounded-xl p-8 relative min-h-[400px] flex flex-col transform">
        <div
          className="pointer-events-none opacity-40 absolute top-0 right-0 bottom-0 left-0"
          style={{
            background:
              "radial-gradient(260px 200px at 20% 10%, rgba(255,255,255,0.06), transparent 60%), radial-gradient(420px 320px at 110% 120%, rgba(63,63,70,0.35), transparent 60%)",
          }}
        ></div>

        <div className="z-10 mt-6 relative flex-1">{children}</div>

        <div className="z-10 mt-auto">
          <h4 className="xl:text-xl xl:tracking-wide text-lg text-white tracking-tight">
            {title}
          </h4>
          <p className="mt-2 text-sm text-zinc-400 tracking-tight">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  useEffect(() => {
    // Intersection Observer for scroll animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -10% 0px" }
    );

    document.querySelectorAll(".animate-on-scroll").forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <Header />

      {/* Hero Section */}
      <section className="relative">
        <div className="lg:px-8 lg:pt-16 max-w-7xl mr-auto ml-auto pt-16 pr-6 pb-16 pl-6">
          <div className="text-center">
            <div className="inline-flex text-xs text-zinc-300 tracking-tight bg-zinc-900/30 border-zinc-800/50 border rounded-full pt-1 pr-3 pb-1 pl-3 backdrop-blur-xl gap-x-2 gap-y-2 items-center animate-fade-slide-in">
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-violet-400"></span>
              Built with LazorKit SDK
            </div>
            <h1 className="sm:text-7xl lg:text-8xl animate-fade-slide-in text-5xl font-light text-white tracking-tighter mt-8">
              Pay with a Tap,
              <br />
              <span className="bg-clip-text font-light text-transparent tracking-tighter bg-gradient-to-r from-zinc-300 via-white to-zinc-300">
                Zero Friction.
              </span>
            </h1>
            <p className="animate-fade-slide-in text-lg text-zinc-400 tracking-tight max-w-2xl mt-6 mr-auto ml-auto">
              Accept Solana payments with passkey authentication. No seed
              phrases, no gas fees, no complexity—just biometrics.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center animate-fade-slide-in mt-10 gap-x-4 gap-y-4 items-center">
              <GlowButton href="/checkout">Try Live Demo</GlowButton>
            </div>
          </div>

          {/* Dashboard mockup */}
          <div className="mt-16 relative">
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-zinc-800/50 via-zinc-700/50 to-zinc-800/50 blur-2xl"></div>
            <div className="hover:shadow-3xl transition-all duration-700 hover:bg-zinc-950/30 hover:border-white/20 bg-zinc-950/20 border-white/10 border rounded-xl animate-fade-slide-in animate-on-scroll pt-4 pr-4 pb-4 pl-4 relative shadow-2xl backdrop-blur-xl">
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                {/* Left: Payment Form */}
                <aside className="lg:col-span-5 rounded-lg border border-white/10 bg-zinc-900/20 backdrop-blur-xl p-4 hover:bg-zinc-900/30 hover:border-white/20 transition-all duration-500 animate-fade-slide-in animate-on-scroll">
                  <div className="flex items-center gap-2 text-zinc-400 text-xs mb-3">
                    <Fingerprint className="w-4 h-4" />
                    <span className="tracking-tight">Passkey Authentication</span>
                  </div>
                  <h3 className="text-2xl text-white font-light tracking-tighter">
                    Send Payment
                  </h3>
                  <p className="mt-1 text-sm text-zinc-400 tracking-tight">
                    Pay with biometrics, no wallet setup needed
                  </p>

                  <div className="mt-4 space-y-3">
                    <div className="rounded-md border border-white/10 bg-zinc-950/20 backdrop-blur-sm p-3">
                      <label className="text-xs text-zinc-400 tracking-tight">
                        Amount
                      </label>
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="text"
                          value="0.05"
                          readOnly
                          className="flex-1 bg-transparent text-2xl text-white font-light tracking-tight outline-none"
                        />
                        <span className="text-zinc-400">SOL</span>
                      </div>
                    </div>

                    <div className="rounded-md border border-white/10 bg-zinc-950/20 backdrop-blur-sm p-3">
                      <label className="text-xs text-zinc-400 tracking-tight">
                        Recipient
                      </label>
                      <input
                        type="text"
                        value="hij78M...sD8w"
                        readOnly
                        className="mt-1 w-full bg-transparent text-sm text-white tracking-tight outline-none"
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-md border border-violet-500/30 bg-violet-500/10 backdrop-blur-sm">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-violet-400" />
                        <span className="text-sm text-violet-300 tracking-tight">
                          Network Fee
                        </span>
                      </div>
                      <span className="text-sm text-violet-400 font-medium tracking-tight">
                        Sponsored
                      </span>
                    </div>

                    <button className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-white/90 backdrop-blur-sm px-4 py-3 text-sm text-black transition hover:bg-white hover:scale-105 transform tracking-tight shadow-lg font-medium">
                      <Fingerprint className="w-4 h-4" />
                      Authenticate & Pay
                    </button>
                  </div>
                </aside>

                {/* Right: Payment Preview */}
                <section className="lg:col-span-7 hover:bg-zinc-900/30 hover:border-white/20 transition-all duration-500 bg-zinc-900/20 border-white/10 border rounded-lg pt-4 pr-4 pb-4 pl-4 backdrop-blur-xl animate-fade-slide-in animate-on-scroll">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-white tracking-tight">
                        Payment Status
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/10 backdrop-blur-sm px-2 py-1 text-xs text-violet-400 border border-violet-500/20 tracking-tight">
                        <Eye className="w-3 h-3" /> Live
                      </span>
                    </div>
                  </div>

                  {/* Transaction Card */}
                  <div className="text-black bg-white/95 backdrop-blur-sm border-zinc-200 border rounded-xl mt-4 pt-6 pr-6 pb-6 pl-6 shadow-xl">
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-2xl font-light tracking-tighter">
                          Payment Request
                        </h2>
                        <div className="mt-1 text-sm text-zinc-600 tracking-tight">
                          #PAY-2024-001
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="inline-flex items-center gap-2 rounded-md bg-zinc-900 px-2 py-1">
                          <span className="h-5 w-5 rounded-md bg-gradient-to-tr from-violet-500 to-fuchsia-500 inline-flex items-center justify-center">
                            <Zap className="w-3 h-3 text-white" />
                          </span>
                          <span className="text-sm text-white tracking-tight">
                            LazorPay
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-zinc-500 tracking-tight">From</div>
                        <div className="tracking-tight">Your Wallet</div>
                        <div className="text-zinc-600 tracking-tight">
                          Passkey Protected
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-zinc-500 tracking-tight">To</div>
                        <div className="tracking-tight">Merchant</div>
                        <div className="text-zinc-600 tracking-tight">
                          hij78MKb...sD8w
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 rounded-lg border border-zinc-200 p-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-zinc-500 tracking-tight">
                          Amount
                        </span>
                        <span className="text-zinc-900 tracking-tight font-medium">
                          0.05 SOL
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm mt-2">
                        <span className="text-zinc-500 tracking-tight">
                          Network Fee
                        </span>
                        <span className="text-violet-600 tracking-tight font-medium">
                          $0.00 (Sponsored)
                        </span>
                      </div>
                      <div className="h-px bg-zinc-200 my-3"></div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-zinc-700 tracking-tight font-medium">
                          Total
                        </span>
                        <span className="text-zinc-900 tracking-tight font-bold">
                          0.05 SOL
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between rounded-lg border border-white/10 bg-zinc-900/30 backdrop-blur-sm px-4 py-3 hover:bg-zinc-900/40 transition-colors duration-300">
                    <div className="flex items-center gap-2 text-sm text-zinc-300 tracking-tight">
                      <ShieldCheck className="w-4 h-4" />
                      Gasless payments powered by LazorKit
                    </div>
                    <Link
                      href="/checkout"
                      className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-black/20 backdrop-blur-sm px-3 py-2 text-sm text-white transition hover:bg-black/30 hover:scale-105 transform tracking-tight"
                    >
                      <Eye className="w-4 h-4" />
                      Try it
                    </Link>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-zinc-800 relative" id="features">
        <div className="lg:px-8 lg:bg-zinc-950/20 lg:backdrop-blur-xl lg:border-white/10 lg:mt-16 lg:mb-16 lg:pb-8 lg:pt-8 lg:gap-y-0 hover:bg-zinc-950/30 hover:border-white/20 transition-all duration-700 animate-fade-slide-in animate-on-scroll max-w-7xl border-zinc-800 border rounded-3xl mt-16 mr-auto mb-16 ml-auto pt-8 pr-6 pb-8 pl-6 gap-x-y-0 gap-y-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 lg:mt-0 mt-0 gap-x-8 gap-y-8">
            {/* Header Row */}
            <div className="col-span-1 flex flex-col md:col-span-2 lg:col-span-3 lg:pt-0 lg:mt-0 lg:pb-0 border-zinc-800 mt-0 mb-8 pt-0 pb-0 gap-x-4 gap-y-4">
              <div className="flex items-start justify-between">
                <h3 className="text-4xl text-white sm:text-5xl font-light tracking-tighter animate-on-scroll">
                  How LazorPay Works
                </h3>
                <Link
                  href="/checkout"
                  className="inline-flex items-center gap-2 text-sm hover:text-white transition-colors tracking-tight text-violet-400"
                >
                  Try demo
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
              <p className="text-lg text-zinc-400 max-w-2xl tracking-tight">
                Accept crypto payments in seconds. Customers pay with a
                fingerprint, you receive funds instantly—no wallets or gas fees
                required.
              </p>
            </div>

            {/* Step 1 */}
            <FeatureCard
              step={1}
              title="Connect with passkey"
              description="Users authenticate with Face ID, Touch ID, or Windows Hello. No seed phrases or browser extensions needed."
            >
              <div className="rounded-lg border border-white/10 bg-black/20 backdrop-blur-sm p-4 hover:bg-black/30 transition-colors duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-xs text-zinc-500 tracking-tight">
                    Authentication
                  </div>
                  <div className="w-2 h-2 rounded-full bg-violet-400"></div>
                </div>
                <div className="space-y-3">
                  <div className="h-12 rounded border border-white/20 bg-white/5 backdrop-blur-sm flex items-center justify-center text-xs text-zinc-300 tracking-tight hover:bg-white/10 transition-colors duration-300">
                    <Fingerprint className="w-5 h-5 mr-2 text-violet-400" />
                    Touch to authenticate
                  </div>
                  <div className="h-8 rounded border border-white/10 bg-zinc-900/40 backdrop-blur-sm flex items-center px-3 hover:bg-zinc-900/50 transition-colors duration-300">
                    <div className="text-xs text-zinc-400 tracking-tight">
                      Wallet: Creating...
                    </div>
                  </div>
                </div>
              </div>
            </FeatureCard>

            {/* Step 2 */}
            <FeatureCard
              step={2}
              title="Sign transaction"
              description="One-tap biometric approval. The transaction is signed securely using WebAuthn—no private keys exposed."
            >
              <div className="rounded-lg border border-white/10 bg-black/20 backdrop-blur-sm p-4 hover:bg-black/30 transition-colors duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-xs text-zinc-500 tracking-tight">
                    Transaction
                  </div>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                    <div className="w-2 h-2 rounded-full bg-violet-400"></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded border border-white/10 bg-zinc-900/40 backdrop-blur-sm hover:bg-zinc-900/50 transition-colors duration-300">
                    <Shield className="w-4 h-4 text-zinc-400" />
                    <div className="text-xs text-zinc-300 tracking-tight">
                      Signing with passkey
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded border border-white/20 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors duration-300">
                    <Eye className="w-4 h-4 text-violet-400" />
                    <div className="text-xs tracking-tight text-violet-300">
                      Gas fee sponsored
                    </div>
                  </div>
                </div>
              </div>
            </FeatureCard>

            {/* Step 3 */}
            <FeatureCard
              step={3}
              title="Payment complete"
              description="Instant confirmation on Solana. Funds arrive in your wallet immediately with zero fees for the user."
            >
              <div className="rounded-lg border border-white/10 bg-black/20 backdrop-blur-sm p-4 hover:bg-black/30 transition-colors duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-xs text-zinc-500 tracking-tight">
                    Status
                  </div>
                  <div className="px-2 py-1 rounded-full border border-violet-500/30 bg-violet-500/10 backdrop-blur-sm">
                    <div className="text-xs tracking-tight text-violet-400">
                      Success
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded border border-violet-700/30 bg-violet-500/10 backdrop-blur-sm hover:bg-violet-500/20 transition-colors duration-300">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-4 h-4 text-violet-400" />
                      <div className="text-xs tracking-tight text-violet-300">
                        SOL transfer
                      </div>
                    </div>
                    <div className="text-xs text-white tracking-tight">
                      0.05 SOL
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-zinc-400 tracking-tight">
                    <span>Gas fee</span>
                    <span className="text-violet-400">$0.00</span>
                  </div>
                  <div className="h-px bg-white/10"></div>
                  <div className="flex items-center justify-between text-xs text-white tracking-tight">
                    <span>Confirmed</span>
                    <span>&lt; 1 second</span>
                  </div>
                </div>
              </div>
            </FeatureCard>
          </div>
        </div>
      </section>

      {/* Preview Section */}
      <section className="border-zinc-800 relative" id="preview">
        <div className="lg:px-8 lg:bg-zinc-950/20 lg:backdrop-blur-xl lg:border-white/10 lg:mt-16 lg:mb-16 lg:pb-8 lg:pt-8 lg:gap-y-0 hover:bg-zinc-950/30 transition-all duration-700 max-w-7xl border-zinc-800 border rounded-3xl mt-16 mr-auto mb-16 ml-auto pt-8 pr-6 pb-8 pl-6 gap-x-y-0 gap-y-0 animate-fade-slide-in animate-on-scroll">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-12 gap-x-16 gap-y-16 items-center">
            <div className="lg:col-span-5">
              <h2 className="text-4xl text-white sm:text-5xl font-light tracking-tighter">
                Seamless payment experience
              </h2>
              <p className="mt-4 text-lg text-zinc-400 tracking-tight">
                Generate payment links, embed buttons, and track transactions in
                real-time. Your customers get the simplest checkout possible.
              </p>
              <ul className="mt-8 space-y-3 text-sm text-zinc-300">
                <li className="flex items-start gap-3 tracking-tight">
                  <Check className="mt-0.5 h-4 w-4 text-violet-400" />
                  No wallet setup required for payers
                </li>
                <li className="flex items-start gap-3 tracking-tight">
                  <Check className="mt-0.5 h-4 w-4 text-violet-400" />
                  Gasless transactions (fees sponsored)
                </li>
                <li className="flex items-start gap-3 tracking-tight">
                  <Check className="mt-0.5 h-4 w-4 text-violet-400" />
                  Shareable payment links with QR codes
                </li>
              </ul>
              <div className="mt-8 flex items-center gap-3">
                <Link
                  href="/checkout"
                  className="inline-flex items-center gap-2 rounded-md bg-white/90 backdrop-blur-sm px-4 py-2 text-sm text-black transition hover:bg-white hover:scale-105 transform tracking-tight shadow-lg"
                >
                  <Eye className="w-4 h-4" />
                  Try demo
                </Link>
                <Link
                  href="/pay"
                  className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-black/20 backdrop-blur-sm px-4 py-2 text-sm text-white transition hover:bg-black/30 hover:scale-105 transform tracking-tight"
                >
                  <Plus className="w-4 h-4" />
                  Create payment link
                </Link>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="relative rounded-xl border border-white/10 bg-zinc-950/20 backdrop-blur-xl p-6 hover:border-white/20 hover:bg-zinc-950/30 hover:shadow-2xl transition-all duration-700 animate-fade-slide-in animate-on-scroll">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                  <div className="lg:col-span-2">
                    <div className="rounded-lg border border-white/10 bg-zinc-900/20 backdrop-blur-sm p-4 hover:bg-zinc-900/30 transition-colors duration-500">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-sm text-white tracking-tight">
                          Payment to
                        </div>
                        <div className="text-xs text-zinc-500 tracking-tight">
                          PAY-2024-001
                        </div>
                      </div>
                      <div className="text-sm">
                        <div className="text-white tracking-tight">
                          Demo Merchant
                        </div>
                        <div className="text-zinc-400 tracking-tight">
                          merchant@example.com
                        </div>
                      </div>
                      <div className="mt-4 rounded-md bg-black/20 backdrop-blur-sm border border-white/10 p-4 hover:border-white/20 transition-colors duration-300">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-zinc-400 tracking-tight">
                            Amount
                          </span>
                          <span className="text-white tracking-tight">
                            0.05 SOL
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm mt-2">
                          <span className="text-zinc-400 tracking-tight">
                            Fee
                          </span>
                          <span className="text-violet-400 tracking-tight">
                            $0.00
                          </span>
                        </div>
                        <div className="mt-3 h-px w-full bg-white/10"></div>
                        <div className="mt-3 flex items-center justify-between text-sm">
                          <span className="text-white tracking-tight">
                            Total
                          </span>
                          <span className="text-white tracking-tight font-medium">
                            0.05 SOL
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="rounded-lg border border-white/10 bg-zinc-900/20 backdrop-blur-sm p-4 hover:bg-zinc-900/30 hover:scale-105 transition-all duration-500">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-sm text-white tracking-tight">
                          Share link
                        </div>
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 backdrop-blur-sm px-2 py-1 text-xs text-blue-400 border border-blue-500/20 tracking-tight">
                          <Eye className="w-3 h-3" /> Live
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 mb-4 tracking-tight">
                        Send to anyone, anywhere.
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <button className="inline-flex items-center justify-center gap-1 rounded-md bg-white/90 backdrop-blur-sm px-3 py-2 text-xs text-black transition hover:bg-white hover:scale-105 transform tracking-tight shadow-lg">
                          <Send className="w-3 h-3" /> Send
                        </button>
                        <button className="inline-flex items-center justify-center gap-1 rounded-md border border-white/10 bg-black/20 backdrop-blur-sm px-3 py-2 text-xs text-white transition hover:bg-black/30 hover:scale-105 transform tracking-tight">
                          <Copy className="w-3 h-3" /> Copy
                        </button>
                      </div>
                    </div>

                    <div className="rounded-lg border border-white/10 bg-zinc-900/20 backdrop-blur-sm p-4 hover:bg-zinc-900/30 hover:scale-105 transition-all duration-500">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-sm text-white tracking-tight">
                          Pay now
                        </div>
                        <Fingerprint className="w-4 h-4 text-zinc-400" />
                      </div>
                      <div className="text-sm">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-zinc-300 tracking-tight">
                            Passkey ready
                          </span>
                          <span className="text-white tracking-tight">
                            0.05 SOL
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-zinc-500 mb-4 tracking-tight">
                          <ShieldCheck className="w-3 h-3" />
                          Secured by LazorKit
                        </div>
                        <button className="inline-flex w-full items-center justify-center gap-2 rounded-md px-3 py-2 text-xs text-white transition hover:scale-105 transform tracking-tight bg-violet-600/90 backdrop-blur-sm hover:bg-violet-600 shadow-lg">
                          <Lock className="w-3 h-3" /> Pay securely
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
