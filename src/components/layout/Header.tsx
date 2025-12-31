"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { useWallet } from "@lazorkit/wallet";
import { truncateAddress } from "@/lib/utils/format";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/#features", label: "Features" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/docs", label: "Docs" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isConnected, isConnecting, connect, disconnect, smartWalletPubkey } =
    useWallet();

  const handleConnect = async () => {
    try {
      await connect();
    } catch (error) {
      console.error("Failed to connect:", error);
    }
  };

  return (
    <header className="xl:my-8 mt-8 mb-8 px-6">
      <nav className="flex animate-fade-slide-in lg:bg-zinc-950/40 lg:backdrop-blur-xl lg:border-white/10 lg:pl-6 lg:pt-2 lg:pb-2 lg:pr-2 max-w-7xl border-zinc-800 border rounded-3xl mr-auto ml-auto pt-3 pr-4 pb-3 pl-6 gap-x-6 gap-y-6 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="LazorPay"
            width={44}
            height={44}
            className="rounded-lg"
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden gap-8 md:flex items-center">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-white transition-colors xl:text-base text-sm text-zinc-400 tracking-tight"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop Connect Button */}
        {isConnected && smartWalletPubkey ? (
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-zinc-900/30">
              <div className="w-2 h-2 rounded-full bg-violet-400"></div>
              <span className="text-sm text-white tracking-tight font-mono">
                {truncateAddress(smartWalletPubkey.toString())}
              </span>
            </div>
            <button
              onClick={disconnect}
              className="text-sm text-zinc-400 hover:text-white transition-colors tracking-tight"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="hidden md:inline-flex items-center gap-2 transition hover:border-zinc-700 hover:bg-zinc-900 hover:scale-105 transform xl:text-base text-sm text-white tracking-tight border-zinc-800 border rounded-xl pt-3 pr-6 pb-3 pl-6 disabled:opacity-50"
          >
            {isConnecting ? "Connecting..." : "Connect Wallet"}
          </button>
        )}

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg bg-white/5 border border-white/10 text-white"
        >
          {mobileMenuOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-24 left-4 right-4 bg-zinc-950/95 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-6 z-50 animate-fade-slide-in">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 text-base text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors tracking-tight"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 border-t border-white/10 mt-2">
              {isConnected && smartWalletPubkey ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-white/10 bg-zinc-900/30">
                    <div className="w-2 h-2 rounded-full bg-violet-400"></div>
                    <span className="text-sm text-white tracking-tight font-mono">
                      {truncateAddress(smartWalletPubkey.toString())}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      disconnect();
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-center px-4 py-3 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors tracking-tight"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    handleConnect();
                    setMobileMenuOpen(false);
                  }}
                  disabled={isConnecting}
                  className="block w-full text-center px-4 py-3 rounded-xl border border-zinc-800 text-white hover:bg-zinc-900 transition-colors tracking-tight disabled:opacity-50"
                >
                  {isConnecting ? "Connecting..." : "Connect Wallet"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
