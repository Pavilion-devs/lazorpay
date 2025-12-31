"use client";

import { useState } from "react";
import {
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  ExternalLink,
  Copy,
  Check,
  Search,
  Download,
  Inbox,
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useTransactionHistory } from "@/hooks/useTransactionHistory";
import { truncateAddress, formatAmount } from "@/lib/utils/format";
import { StoredTransaction } from "@/lib/utils/storage";

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function TransactionRow({ transaction }: { transaction: StoredTransaction }) {
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
            <span
              className={`text-xs px-2 py-0.5 rounded-full border ${
                transaction.status === "confirmed"
                  ? "bg-violet-500/10 text-violet-400 border-violet-500/20"
                  : transaction.status === "pending"
                  ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                  : "bg-red-500/10 text-red-400 border-red-500/20"
              }`}
            >
              {transaction.status}
            </span>
          </div>
          <div className="text-xs text-zinc-500 tracking-tight mt-1">
            {transaction.type === "incoming"
              ? `From ${truncateAddress(transaction.from || "", 6, 4)}`
              : `To ${truncateAddress(transaction.to || "", 6, 4)}`}
          </div>
          {transaction.memo && (
            <div className="text-xs text-zinc-600 tracking-tight mt-0.5">
              {transaction.memo}
            </div>
          )}
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
          <div className="text-xs text-zinc-500 tracking-tight flex items-center gap-1 justify-end">
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

export default function TransactionsPage() {
  const { transactions, stats, isLoading, getFilteredTransactions } =
    useTransactionHistory();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "incoming" | "outgoing">(
    "all"
  );

  // Filter transactions based on search and type
  const filteredTransactions = getFilteredTransactions(filterType).filter(
    (tx) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        tx.signature.toLowerCase().includes(query) ||
        tx.memo?.toLowerCase().includes(query) ||
        tx.from?.toLowerCase().includes(query) ||
        tx.to?.toLowerCase().includes(query)
      );
    }
  );

  // Calculate summary stats
  const incomingTotal = transactions
    .filter((tx) => tx.type === "incoming" && tx.status === "confirmed")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const outgoingTotal = transactions
    .filter((tx) => tx.type === "outgoing" && tx.status === "confirmed")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const netBalance = incomingTotal - outgoingTotal;

  // Export to CSV
  const exportToCSV = () => {
    if (transactions.length === 0) return;

    const headers = ["Date", "Type", "Amount", "Token", "From/To", "Memo", "Signature", "Status"];
    const rows = transactions.map((tx) => [
      new Date(tx.timestamp).toISOString(),
      tx.type,
      tx.amount.toString(),
      tx.token,
      tx.type === "incoming" ? tx.from : tx.to,
      tx.memo || "",
      tx.signature,
      tx.status,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell || ""}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lazorpay-transactions-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-light text-white tracking-tight">
            Transactions
          </h1>
          <p className="text-zinc-400 tracking-tight mt-1">
            View and manage all your payment transactions
          </p>
        </div>
        <button
          onClick={exportToCSV}
          disabled={transactions.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-zinc-900/50 hover:bg-zinc-900 text-white text-sm font-medium transition-all tracking-tight disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="p-4 rounded-xl border border-white/10 bg-zinc-950/20 backdrop-blur-xl">
          <div className="text-sm text-zinc-400 tracking-tight mb-1">
            Total Received
          </div>
          <div className="text-2xl font-light text-violet-400 tracking-tight">
            +{formatAmount(incomingTotal, 3)} SOL
          </div>
        </div>
        <div className="p-4 rounded-xl border border-white/10 bg-zinc-950/20 backdrop-blur-xl">
          <div className="text-sm text-zinc-400 tracking-tight mb-1">
            Total Sent
          </div>
          <div className="text-2xl font-light text-white tracking-tight">
            -{formatAmount(outgoingTotal, 3)} SOL
          </div>
        </div>
        <div className="p-4 rounded-xl border border-white/10 bg-zinc-950/20 backdrop-blur-xl">
          <div className="text-sm text-zinc-400 tracking-tight mb-1">
            Net Balance
          </div>
          <div
            className={`text-2xl font-light tracking-tight ${
              netBalance >= 0 ? "text-violet-400" : "text-red-400"
            }`}
          >
            {netBalance >= 0 ? "+" : ""}
            {formatAmount(netBalance, 3)} SOL
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="rounded-2xl border border-white/10 bg-zinc-950/20 backdrop-blur-xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-xl font-light text-white tracking-tight">
              All Transactions
            </h2>
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search transactions..."
                  className="pl-10 pr-4 py-2 rounded-lg border border-white/10 bg-zinc-900/50 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-violet-500/50 transition-colors tracking-tight w-56"
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

        {/* List */}
        <div className="p-4 space-y-2">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-violet-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-zinc-400 tracking-tight">
                Loading transactions...
              </p>
            </div>
          ) : filteredTransactions.length > 0 ? (
            filteredTransactions.map((transaction) => (
              <TransactionRow key={transaction.id} transaction={transaction} />
            ))
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-zinc-900/50 flex items-center justify-center">
                <Inbox className="w-8 h-8 text-zinc-600" />
              </div>
              <p className="text-zinc-400 tracking-tight">
                {searchQuery || filterType !== "all"
                  ? "No transactions found"
                  : "No transactions yet"}
              </p>
              <p className="text-sm text-zinc-500 tracking-tight mt-1">
                {searchQuery || filterType !== "all"
                  ? "Try adjusting your search or filter"
                  : "Make a payment to see it appear here"}
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
