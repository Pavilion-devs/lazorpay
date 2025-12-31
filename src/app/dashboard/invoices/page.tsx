"use client";

import { useState } from "react";
import {
  Plus,
  FileText,
  Send,
  Check,
  Clock,
  X,
  Download,
  Eye,
  Mail,
  Trash2,
  Inbox,
} from "lucide-react";
import { DashboardLayout, Modal } from "@/components/dashboard/DashboardLayout";
import { formatAmount } from "@/lib/utils/format";
import { useInvoices } from "@/hooks/useInvoices";
import { StoredInvoice } from "@/lib/utils/storage";

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getStatusColor(status: string) {
  switch (status) {
    case "paid":
      return "bg-violet-500/10 text-violet-400 border-violet-500/20";
    case "pending":
      return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
    case "overdue":
      return "bg-red-500/10 text-red-400 border-red-500/20";
    case "draft":
      return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
    default:
      return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case "paid":
      return <Check className="w-3 h-3" />;
    case "pending":
      return <Clock className="w-3 h-3" />;
    case "overdue":
      return <X className="w-3 h-3" />;
    case "draft":
      return <FileText className="w-3 h-3" />;
    default:
      return <FileText className="w-3 h-3" />;
  }
}

function InvoiceRow({
  invoice,
  onSend,
  onDelete,
  onMarkPaid,
}: {
  invoice: StoredInvoice;
  onSend: (id: string) => void;
  onDelete: (id: string) => void;
  onMarkPaid: (id: string) => void;
}) {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg border border-white/5 bg-zinc-900/20 hover:bg-zinc-900/40 hover:border-white/10 transition-all duration-300">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-zinc-800/50 flex items-center justify-center">
          <FileText className="w-5 h-5 text-zinc-400" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-white tracking-tight font-medium">
              {invoice.id}
            </span>
            <span
              className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${getStatusColor(
                invoice.status
              )}`}
            >
              {getStatusIcon(invoice.status)}
              {invoice.status}
            </span>
          </div>
          <div className="text-xs text-zinc-500 tracking-tight mt-1">
            {invoice.client}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-right">
          <div className="text-sm font-medium text-white tracking-tight">
            {formatAmount(invoice.amount, 4)} {invoice.token}
          </div>
          <div className="text-xs text-zinc-500 tracking-tight">
            {invoice.status === "paid" && invoice.paidDate
              ? `Paid ${formatDate(invoice.paidDate)}`
              : `Due ${formatDate(invoice.dueDate)}`}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {invoice.status === "draft" && (
            <button
              onClick={() => onSend(invoice.id)}
              className="p-2 rounded-lg hover:bg-white/5 transition-colors"
              title="Send Invoice"
            >
              <Send className="w-4 h-4 text-zinc-500 hover:text-violet-400" />
            </button>
          )}
          {(invoice.status === "pending" || invoice.status === "overdue") && (
            <button
              onClick={() => onMarkPaid(invoice.id)}
              className="p-2 rounded-lg hover:bg-white/5 transition-colors"
              title="Mark as Paid"
            >
              <Check className="w-4 h-4 text-zinc-500 hover:text-violet-400" />
            </button>
          )}
          <button
            onClick={() => onDelete(invoice.id)}
            className="p-2 rounded-lg hover:bg-red-500/10 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4 text-zinc-500 hover:text-red-400" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Create Invoice Modal
function CreateInvoiceModal({
  isOpen,
  onClose,
  onCreate,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: {
    client: string;
    email?: string;
    amount: number;
    token: "SOL" | "USDC";
    dueDate: number;
    items: { description: string; amount: number }[];
    status: "draft" | "pending";
  }) => void;
}) {
  const [client, setClient] = useState("");
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [token, setToken] = useState<"SOL" | "USDC">("SOL");
  const [dueDays, setDueDays] = useState("7");
  const [description, setDescription] = useState("");
  const [sendImmediately, setSendImmediately] = useState(false);

  const handleSubmit = () => {
    if (!client || !amount || parseFloat(amount) <= 0) return;

    const dueDate = Date.now() + parseInt(dueDays) * 24 * 60 * 60 * 1000;

    onCreate({
      client,
      email: email || undefined,
      amount: parseFloat(amount),
      token,
      dueDate,
      items: [{ description: description || "Services", amount: parseFloat(amount) }],
      status: sendImmediately ? "pending" : "draft",
    });

    // Reset form
    setClient("");
    setEmail("");
    setAmount("");
    setDescription("");
    setDueDays("7");
    setSendImmediately(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Invoice">
      <div className="space-y-5">
        {/* Client Name */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Client Name *
          </label>
          <input
            type="text"
            value={client}
            onChange={(e) => setClient(e.target.value)}
            placeholder="Client or Company Name"
            className="w-full px-4 py-3 rounded-xl border border-white/10 bg-zinc-900/50 text-white placeholder:text-zinc-500 focus:outline-none focus:border-violet-500/50 transition-colors tracking-tight text-sm"
          />
        </div>

        {/* Client Email */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Client Email <span className="text-zinc-500">(optional)</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="client@email.com"
            className="w-full px-4 py-3 rounded-xl border border-white/10 bg-zinc-900/50 text-white placeholder:text-zinc-500 focus:outline-none focus:border-violet-500/50 transition-colors tracking-tight text-sm"
          />
        </div>

        {/* Amount and Token */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Amount *
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.001"
              min="0"
              className="w-full px-4 py-3 rounded-xl border border-white/10 bg-zinc-900/50 text-white placeholder:text-zinc-500 focus:outline-none focus:border-violet-500/50 transition-colors tracking-tight text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Token
            </label>
            <select
              value={token}
              onChange={(e) => setToken(e.target.value as "SOL" | "USDC")}
              className="w-full px-4 py-3 rounded-xl border border-white/10 bg-zinc-900/50 text-white focus:outline-none focus:border-violet-500/50 transition-colors tracking-tight text-sm cursor-pointer"
            >
              <option value="SOL">SOL</option>
              <option value="USDC">USDC</option>
            </select>
          </div>
        </div>

        {/* Due Date */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Due in
          </label>
          <select
            value={dueDays}
            onChange={(e) => setDueDays(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-white/10 bg-zinc-900/50 text-white focus:outline-none focus:border-violet-500/50 transition-colors tracking-tight text-sm cursor-pointer"
          >
            <option value="7">7 days</option>
            <option value="14">14 days</option>
            <option value="30">30 days</option>
            <option value="60">60 days</option>
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Description <span className="text-zinc-500">(optional)</span>
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Services rendered"
            className="w-full px-4 py-3 rounded-xl border border-white/10 bg-zinc-900/50 text-white placeholder:text-zinc-500 focus:outline-none focus:border-violet-500/50 transition-colors tracking-tight text-sm"
          />
        </div>

        {/* Send Immediately */}
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={sendImmediately}
            onChange={(e) => setSendImmediately(e.target.checked)}
            className="w-4 h-4 rounded border-white/20 bg-zinc-900 text-violet-500 focus:ring-violet-500"
          />
          <span className="text-sm text-zinc-400">Send immediately (mark as pending)</span>
        </label>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={!client || !amount || parseFloat(amount) <= 0}
          className={`w-full py-3 px-6 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
            client && amount && parseFloat(amount) > 0
              ? "bg-violet-600 hover:bg-violet-500 text-white"
              : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
          }`}
        >
          <FileText className="w-5 h-5" />
          Create Invoice
        </button>
      </div>
    </Modal>
  );
}

export default function InvoicesPage() {
  const {
    invoices,
    isLoading,
    createInvoice,
    sendInvoice,
    markAsPaid,
    removeInvoice,
    getStats,
    getFilteredInvoices,
  } = useInvoices();

  const [filterStatus, setFilterStatus] = useState<
    "all" | "paid" | "pending" | "overdue" | "draft"
  >("all");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const stats = getStats();
  const filteredInvoices = getFilteredInvoices(filterStatus);

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this invoice?")) {
      removeInvoice(id);
    }
  };

  const handleSend = (id: string) => {
    sendInvoice(id);
  };

  const handleMarkPaid = (id: string) => {
    markAsPaid(id);
  };

  const handleCreate = (data: {
    client: string;
    email?: string;
    amount: number;
    token: "SOL" | "USDC";
    dueDate: number;
    items: { description: string; amount: number }[];
    status: "draft" | "pending";
  }) => {
    createInvoice(data);
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-light text-white tracking-tight">
            Invoices
          </h1>
          <p className="text-zinc-400 tracking-tight mt-1">
            Create and manage invoices for your clients
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-violet-600/90 hover:bg-violet-600 text-white text-sm font-medium transition-all hover:scale-105 transform tracking-tight shadow-lg"
        >
          <Plus className="w-4 h-4" />
          Create Invoice
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <div className="p-4 rounded-xl border border-white/10 bg-zinc-950/20 backdrop-blur-xl">
          <div className="text-sm text-zinc-400 tracking-tight mb-1">
            Total Invoices
          </div>
          <div className="text-2xl font-light text-white tracking-tight">
            {stats.total}
          </div>
        </div>
        <div className="p-4 rounded-xl border border-white/10 bg-zinc-950/20 backdrop-blur-xl">
          <div className="text-sm text-zinc-400 tracking-tight mb-1">Paid</div>
          <div className="text-2xl font-light text-violet-400 tracking-tight">
            {formatAmount(stats.paidAmount, 2)} SOL
          </div>
        </div>
        <div className="p-4 rounded-xl border border-white/10 bg-zinc-950/20 backdrop-blur-xl">
          <div className="text-sm text-zinc-400 tracking-tight mb-1">
            Pending
          </div>
          <div className="text-2xl font-light text-yellow-400 tracking-tight">
            {formatAmount(stats.pendingAmount, 2)} SOL
          </div>
        </div>
        <div className="p-4 rounded-xl border border-white/10 bg-zinc-950/20 backdrop-blur-xl">
          <div className="text-sm text-zinc-400 tracking-tight mb-1">
            Overdue
          </div>
          <div className="text-2xl font-light text-red-400 tracking-tight">
            {stats.overdueCount}
          </div>
        </div>
      </div>

      {/* Invoices List */}
      <div className="rounded-2xl border border-white/10 bg-zinc-950/20 backdrop-blur-xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-xl font-light text-white tracking-tight">
              All Invoices
            </h2>
            <div className="flex items-center rounded-lg border border-white/10 bg-zinc-900/50 p-1">
              {(["all", "paid", "pending", "overdue", "draft"] as const).map(
                (status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors tracking-tight ${
                      filterStatus === status
                        ? "bg-violet-500/20 text-violet-400"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        {/* List */}
        <div className="p-4 space-y-2">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-violet-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-zinc-400 tracking-tight">
                Loading invoices...
              </p>
            </div>
          ) : filteredInvoices.length > 0 ? (
            filteredInvoices.map((invoice) => (
              <InvoiceRow
                key={invoice.id}
                invoice={invoice}
                onSend={handleSend}
                onDelete={handleDelete}
                onMarkPaid={handleMarkPaid}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-zinc-900/50 flex items-center justify-center">
                <Inbox className="w-8 h-8 text-zinc-600" />
              </div>
              <p className="text-zinc-400 tracking-tight">
                {filterStatus !== "all"
                  ? `No ${filterStatus} invoices`
                  : "No invoices yet"}
              </p>
              <p className="text-sm text-zinc-500 tracking-tight mt-1">
                {filterStatus !== "all"
                  ? "Try a different filter"
                  : "Create your first invoice to get started"}
              </p>
              {filterStatus === "all" && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="mt-4 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-violet-600/90 hover:bg-violet-600 text-white text-sm font-medium transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Create Invoice
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create Invoice Modal */}
      <CreateInvoiceModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreate}
      />
    </DashboardLayout>
  );
}
