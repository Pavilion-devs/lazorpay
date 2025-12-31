"use client";

import { useState } from "react";
import {
  Plus,
  Link as LinkIcon,
  Copy,
  Check,
  ExternalLink,
  Trash2,
  QrCode,
  Inbox,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { CreatePaymentModal } from "@/components/dashboard/CreatePaymentModal";
import { Modal } from "@/components/dashboard/DashboardLayout";
import { usePaymentLinks } from "@/hooks/usePaymentLinks";
import { formatAmount } from "@/lib/utils/format";
import { StoredPaymentLink } from "@/lib/utils/storage";

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function PaymentLinkCard({
  link,
  onDelete,
  onShowQR,
}: {
  link: StoredPaymentLink;
  onDelete: (id: string) => void;
  onShowQR: (link: StoredPaymentLink) => void;
}) {
  const [copied, setCopied] = useState(false);

  const copyLink = () => {
    navigator.clipboard.writeText(link.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-5 rounded-xl border border-white/10 bg-zinc-950/20 backdrop-blur-xl hover:border-white/20 hover:bg-zinc-900/30 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
            <LinkIcon className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h3 className="text-white font-medium tracking-tight">{link.name}</h3>
            <p className="text-xs text-zinc-500 tracking-tight">
              Created {formatDate(link.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              link.status === "active"
                ? "bg-violet-500/10 text-violet-400 border border-violet-500/20"
                : "bg-zinc-700/30 text-zinc-400 border border-zinc-700/50"
            }`}
          >
            {link.status}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="text-2xl font-light text-white tracking-tight">
          {link.amount > 0
            ? `${formatAmount(link.amount, 4)} ${link.token}`
            : "Any amount"}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4 p-3 rounded-lg bg-zinc-900/30 border border-white/5">
        <div>
          <div className="text-xs text-zinc-500 tracking-tight">Views</div>
          <div className="text-lg text-white tracking-tight">{link.views}</div>
        </div>
        <div>
          <div className="text-xs text-zinc-500 tracking-tight">Payments</div>
          <div className="text-lg text-violet-400 tracking-tight">
            {link.payments}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={copyLink}
          className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-sm transition-colors"
        >
          {copied ? (
            <Check className="w-4 h-4 text-violet-400" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
          {copied ? "Copied!" : "Copy Link"}
        </button>
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
        <button
          onClick={() => onShowQR(link)}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors"
        >
          <QrCode className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(link.id)}
          className="p-2 rounded-lg bg-white/5 hover:bg-red-500/10 hover:text-red-400 text-zinc-400 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function PaymentLinksPage() {
  const { paymentLinks, isLoading, removePaymentLink, getStats } =
    usePaymentLinks();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [qrModalLink, setQrModalLink] = useState<StoredPaymentLink | null>(null);

  const stats = getStats();

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this payment link?")) {
      removePaymentLink(id);
    }
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-light text-white tracking-tight">
            Payment Links
          </h1>
          <p className="text-zinc-400 tracking-tight mt-1">
            Create and manage shareable payment links
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-violet-600/90 hover:bg-violet-600 text-white text-sm font-medium transition-all hover:scale-105 transform tracking-tight shadow-lg"
        >
          <Plus className="w-4 h-4" />
          Create New Link
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="p-4 rounded-xl border border-white/10 bg-zinc-950/20 backdrop-blur-xl">
          <div className="text-sm text-zinc-400 tracking-tight mb-1">
            Total Links
          </div>
          <div className="text-2xl font-light text-white tracking-tight">
            {stats.totalLinks}
          </div>
        </div>
        <div className="p-4 rounded-xl border border-white/10 bg-zinc-950/20 backdrop-blur-xl">
          <div className="text-sm text-zinc-400 tracking-tight mb-1">
            Total Views
          </div>
          <div className="text-2xl font-light text-white tracking-tight">
            {stats.totalViews}
          </div>
        </div>
        <div className="p-4 rounded-xl border border-white/10 bg-zinc-950/20 backdrop-blur-xl">
          <div className="text-sm text-zinc-400 tracking-tight mb-1">
            Total Payments
          </div>
          <div className="text-2xl font-light text-violet-400 tracking-tight">
            {stats.totalPayments}
          </div>
        </div>
      </div>

      {/* Payment Links Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-violet-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-400 tracking-tight">Loading payment links...</p>
        </div>
      ) : paymentLinks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paymentLinks.map((link) => (
            <PaymentLinkCard
              key={link.id}
              link={link}
              onDelete={handleDelete}
              onShowQR={setQrModalLink}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-zinc-950/20 backdrop-blur-xl p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-zinc-900/50 flex items-center justify-center">
            <Inbox className="w-8 h-8 text-zinc-600" />
          </div>
          <h3 className="text-lg text-white tracking-tight mb-2">
            No payment links yet
          </h3>
          <p className="text-zinc-400 tracking-tight mb-6">
            Create your first payment link to start receiving payments
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-violet-600/90 hover:bg-violet-600 text-white text-sm font-medium transition-all"
          >
            <Plus className="w-4 h-4" />
            Create Payment Link
          </button>
        </div>
      )}

      {/* Create Payment Modal */}
      <CreatePaymentModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      {/* QR Code Modal */}
      <Modal
        isOpen={!!qrModalLink}
        onClose={() => setQrModalLink(null)}
        title="Payment Link QR Code"
      >
        {qrModalLink && (
          <div className="text-center">
            <p className="text-zinc-400 tracking-tight mb-4">
              Scan this QR code to pay
            </p>
            <div className="inline-block bg-white p-4 rounded-xl mb-4">
              <QRCodeSVG value={qrModalLink.url} size={200} level="H" />
            </div>
            <div className="text-sm text-zinc-400 tracking-tight mb-2">
              {qrModalLink.name}
            </div>
            <div className="text-2xl font-light text-white tracking-tight">
              {qrModalLink.amount > 0
                ? `${formatAmount(qrModalLink.amount, 4)} ${qrModalLink.token}`
                : "Any amount"}
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
