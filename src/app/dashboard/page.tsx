"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useWallet } from "@lazorkit/wallet";
import {
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Wallet,
  TrendingUp,
  BarChart3,
  Clock,
  ExternalLink,
  Copy,
  Check,
  Search,
  Home,
  CreditCard,
  Settings,
  LogOut,
  FileText,
  Link as LinkIcon,
  ChevronRight,
} from "lucide-react";
import { ConnectButton } from "@/components/wallet/ConnectButton";
import { truncateAddress, formatAmount } from "@/lib/utils/format";

// Mock transaction data
const mockTransactions = [
  {
    id: "1",
    type: "incoming" as const,
    amount: 0.05,
    token: "SOL",
    from: "9WzD...k8Lm",
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    signature: "5KjT...mN2p",
    status: "confirmed",
  },
  {
    id: "2",
    type: "incoming" as const,
    amount: 0.12,
    token: "SOL",
    from: "3xYm...pQ7r",
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    signature: "7Lkp...wS9q",
    status: "confirmed",
  },
  {
    id: "3",
    type: "outgoing" as const,
    amount: 0.02,
    token: "SOL",
    to: "hij78M...sD8w",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    signature: "9Mnb...cX4t",
    status: "confirmed",
  },
  {
    id: "4",
    type: "incoming" as const,
    amount: 0.25,
    token: "SOL",
    from: "7YtR...kL9m",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    signature: "2Pqw...nK8v",
    status: "confirmed",
  },
  {
    id: "5",
    type: "incoming" as const,
    amount: 0.08,
    token: "SOL",
    from: "4WkN...jP2s",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
    signature: "6Rty...mL3x",
    status: "confirmed",
  },
];

// Stats calculation
const totalRevenue = mockTransactions
  .filter((tx) => tx.type === "incoming")
  .reduce((acc, tx) => acc + tx.amount, 0);
const totalTransactions = mockTransactions.length;
const avgPayment = totalRevenue / mockTransactions.filter((tx) => tx.type === "incoming").length;

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// Sidebar navigation items
const sidebarItems = [
  { icon: Home, label: "Overview", href: "/dashboard", active: true },
  { icon: CreditCard, label: "Transactions", href: "/dashboard/transactions" },
  { icon: LinkIcon, label: "Payment Links", href: "/dashboard/links" },
  { icon: FileText, label: "Invoices", href: "/dashboard/invoices" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

function StatCard({
  title,
  value,
  subValue,
  icon: Icon,
  trend,
}: {
  title: string;
  value: string;
  subValue?: string;
  icon: React.ElementType;
  trend?: { value: string; positive: boolean };
}) {
  return (
    <div className="group overflow-hidden transition-all duration-500 hover:border-white/20 hover:bg-zinc-900/30 hover:shadow-xl bg-zinc-950/20 backdrop-blur-xl border border-white/10 rounded-xl p-6 relative">
      <div
        className="pointer-events-none opacity-40 absolute top-0 right-0 bottom-0 left-0"
        style={{
          background:
            "radial-gradient(260px 200px at 20% 10%, rgba(255,255,255,0.06), transparent 60%), radial-gradient(420px 320px at 110% 120%, rgba(63,63,70,0.35), transparent 60%)",
        }}
      />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-zinc-400 tracking-tight">{title}</span>
          <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
            <Icon className="w-5 h-5 text-violet-400" />
          </div>
        </div>
        <div className="text-3xl font-light text-white tracking-tight">{value}</div>
        {subValue && (
          <div className="text-sm text-zinc-500 tracking-tight mt-1">{subValue}</div>
        )}
        {trend && (
          <div
            className={`inline-flex items-center gap-1 mt-3 text-xs tracking-tight ${
              trend.positive ? "text-violet-400" : "text-zinc-400"
            }`}
          >
            {trend.positive ? (
              <ArrowUpRight className="w-3 h-3" />
            ) : (
              <ArrowDownRight className="w-3 h-3" />
            )}
            {trend.value}
          </div>
        )}
      </div>
    </div>
  );
}

function TransactionRow({
  transaction,
}: {
  transaction: (typeof mockTransactions)[0];
}) {
  const [copied, setCopied] = useState(false);

  const copySignature = () => {
    navigator.clipboard.writeText(transaction.signature);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center justify-between p-4 rounded-lg border border-white/5 bg-zinc-900/20 hover:bg-zinc-900/40 hover:border-white/10 transition-all duration-300">
      <div className="flex items-center gap-4">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            transaction.type === "incoming"
              ? "bg-violet-500/10"
              : "bg-zinc-700/30"
          }`}
        >
          {transaction.type === "incoming" ? (
            <ArrowDownRight className="w-5 h-5 text-violet-400" />
          ) : (
            <ArrowUpRight className="w-5 h-5 text-zinc-400" />
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-white tracking-tight">
              {transaction.type === "incoming" ? "Received" : "Sent"}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
              {transaction.status}
            </span>
          </div>
          <div className="text-xs text-zinc-500 tracking-tight mt-1">
            {transaction.type === "incoming"
              ? `From ${transaction.from}`
              : `To ${transaction.to}`}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-right">
          <div
            className={`text-sm font-medium tracking-tight ${
              transaction.type === "incoming" ? "text-violet-400" : "text-white"
            }`}
          >
            {transaction.type === "incoming" ? "+" : "-"}
            {formatAmount(transaction.amount, 4)} {transaction.token}
          </div>
          <div className="text-xs text-zinc-500 tracking-tight flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatTimeAgo(transaction.timestamp)}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={copySignature}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
            title="Copy signature"
          >
            {copied ? (
              <Check className="w-4 h-4 text-violet-400" />
            ) : (
              <Copy className="w-4 h-4 text-zinc-500" />
            )}
          </button>
          <a
            href={`https://explorer.solana.com/tx/${transaction.signature}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
            title="View on Explorer"
          >
            <ExternalLink className="w-4 h-4 text-zinc-500" />
          </a>
        </div>
      </div>
    </div>
  );
}

function Sidebar({ disconnect }: { disconnect: () => void }) {
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
        {sidebarItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
              item.active
                ? "bg-violet-500/10 text-violet-400 border border-violet-500/20"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-sm font-medium tracking-tight">{item.label}</span>
            {item.active && <ChevronRight className="w-4 h-4 ml-auto" />}
          </Link>
        ))}
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

export default function DashboardPage() {
  const { isConnected, smartWalletPubkey, disconnect } = useWallet();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "incoming" | "outgoing">("all");

  const filteredTransactions = mockTransactions.filter((tx) => {
    if (filterType !== "all" && tx.type !== filterType) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        tx.signature.toLowerCase().includes(query) ||
        (tx.type === "incoming" && tx.from?.toLowerCase().includes(query)) ||
        (tx.type === "outgoing" && tx.to?.toLowerCase().includes(query))
      );
    }
    return true;
  });

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
      {/* Sidebar */}
      <Sidebar disconnect={disconnect} />

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-light text-white tracking-tight">Dashboard</h1>
            <p className="text-zinc-400 tracking-tight mt-1">
              Manage your payments and track transactions
            </p>
          </div>
          <Link
            href="/pay"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-violet-600/90 hover:bg-violet-600 text-white text-sm font-medium transition-all hover:scale-105 transform tracking-tight shadow-lg"
          >
            <Plus className="w-4 h-4" />
            Create Payment Link
          </Link>
        </div>

        {/* Wallet Info */}
        <div className="mb-8 p-4 rounded-xl border border-white/10 bg-zinc-950/20 backdrop-blur-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="LazorPay"
              width={40}
              height={40}
              className="rounded-lg"
            />
            <div>
              <div className="text-sm text-zinc-400 tracking-tight">Connected Wallet</div>
              <div className="text-white font-mono tracking-tight">
                {smartWalletPubkey && truncateAddress(smartWalletPubkey.toString(), 8, 8)}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-violet-400"></div>
            <span className="text-sm text-violet-400 tracking-tight">Devnet</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Total Revenue"
            value={`${formatAmount(totalRevenue, 3)} SOL`}
            subValue={`~$${(totalRevenue * 100).toFixed(2)} USD`}
            icon={Wallet}
            trend={{ value: "+12.5% from last week", positive: true }}
          />
          <StatCard
            title="Transactions"
            value={totalTransactions.toString()}
            subValue="All time"
            icon={BarChart3}
            trend={{ value: "+3 this week", positive: true }}
          />
          <StatCard
            title="Avg. Payment"
            value={`${formatAmount(avgPayment, 4)} SOL`}
            subValue="Per transaction"
            icon={TrendingUp}
          />
        </div>

        {/* Transactions Section */}
        <div className="rounded-2xl border border-white/10 bg-zinc-950/20 backdrop-blur-xl overflow-hidden">
          {/* Transactions Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-xl font-light text-white tracking-tight">
                Recent Transactions
              </h2>
              <div className="flex items-center gap-3">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="pl-10 pr-4 py-2 rounded-lg border border-white/10 bg-zinc-900/50 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-violet-500/50 transition-colors tracking-tight w-48"
                  />
                </div>
                {/* Filter */}
                <div className="flex items-center rounded-lg border border-white/10 bg-zinc-900/50 p-1">
                  {(["all", "incoming", "outgoing"] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setFilterType(type)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors tracking-tight ${
                        filterType === type
                          ? "bg-violet-500/20 text-violet-400"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Transactions List */}
          <div className="p-4 space-y-2">
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((transaction) => (
                <TransactionRow key={transaction.id} transaction={transaction} />
              ))
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-zinc-900/50 flex items-center justify-center">
                  <Search className="w-8 h-8 text-zinc-600" />
                </div>
                <p className="text-zinc-400 tracking-tight">No transactions found</p>
                <p className="text-sm text-zinc-500 tracking-tight mt-1">
                  Try adjusting your search or filter
                </p>
              </div>
            )}
          </div>

          {/* View All Link */}
          {filteredTransactions.length > 0 && (
            <div className="p-4 border-t border-white/10 text-center">
              <button className="text-sm text-violet-400 hover:text-violet-300 transition-colors tracking-tight inline-flex items-center gap-1">
                View all transactions
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
