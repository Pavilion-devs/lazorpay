"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useWallet } from "@lazorkit/wallet";
import {
  Home,
  CreditCard,
  Settings,
  LogOut,
  FileText,
  Link as LinkIcon,
  ChevronRight,
  Wallet,
  X,
} from "lucide-react";
import { ConnectButton } from "@/components/wallet/ConnectButton";

// Sidebar navigation items
const sidebarItems = [
  { icon: Home, label: "Overview", href: "/dashboard" },
  { icon: CreditCard, label: "Transactions", href: "/dashboard/transactions" },
  { icon: LinkIcon, label: "Payment Links", href: "/dashboard/links" },
  { icon: FileText, label: "Invoices", href: "/dashboard/invoices" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

function Sidebar({ disconnect }: { disconnect: () => void }) {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-zinc-950/80 backdrop-blur-xl border-r border-white/10 flex flex-col z-40">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="LazorPay"
            width={40}
            height={40}
            className="rounded-lg"
          />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                isActive
                  ? "bg-violet-500/10 text-violet-400 border border-violet-500/20"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm font-medium tracking-tight">{item.label}</span>
              {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="p-4 border-t border-white/10 space-y-2">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-all duration-300"
        >
          <Home className="w-5 h-5" />
          <span className="text-sm font-medium tracking-tight">Back to Home</span>
        </Link>
        <button
          onClick={disconnect}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300 w-full"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium tracking-tight">Disconnect</span>
        </button>
      </div>
    </aside>
  );
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isConnected, disconnect } = useWallet();

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md mx-auto px-6 text-center">
          <div className="mb-8">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-violet-500/10 flex items-center justify-center">
              <Wallet className="w-10 h-10 text-violet-400" />
            </div>
            <h1 className="text-3xl font-light text-white tracking-tight mb-3">
              Connect Your Wallet
            </h1>
            <p className="text-zinc-400 tracking-tight">
              Connect your passkey wallet to access the dashboard and manage your payments.
            </p>
          </div>
          <ConnectButton className="mx-auto" />
          <Link
            href="/"
            className="inline-flex items-center gap-2 mt-6 text-sm text-zinc-400 hover:text-white transition-colors tracking-tight"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar disconnect={disconnect} />
      <main className="flex-1 ml-64 p-8">{children}</main>
    </div>
  );
}

// Modal component for dashboard
export function Modal({
  isOpen,
  onClose,
  title,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-auto mx-4 rounded-2xl border border-white/10 bg-zinc-950/95 backdrop-blur-xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-light text-white tracking-tight">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>
        {/* Content */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
