/**
 * LocalStorage utilities for LazorPay
 * Handles persistent storage for transactions, payment links, and invoices
 */

// Storage keys
const STORAGE_KEYS = {
  TRANSACTIONS: "lazorpay_transactions",
  PAYMENT_LINKS: "lazorpay_payment_links",
  INVOICES: "lazorpay_invoices",
  SETTINGS: "lazorpay_settings",
} as const;

// Types
export interface StoredTransaction {
  id: string;
  signature: string;
  type: "incoming" | "outgoing";
  amount: number;
  token: "SOL" | "USDC";
  from?: string;
  to?: string;
  timestamp: number; // Unix timestamp
  status: "pending" | "confirmed" | "failed";
  memo?: string;
  walletAddress: string; // The user's wallet that owns this transaction
}

export interface StoredPaymentLink {
  id: string;
  name: string;
  amount: number;
  token: "SOL" | "USDC";
  recipientAddress: string;
  memo?: string;
  merchantName?: string;
  createdAt: number;
  views: number;
  payments: number;
  status: "active" | "inactive";
  url: string;
  walletAddress: string; // The user's wallet that created this link
}

export interface StoredInvoice {
  id: string;
  client: string;
  email?: string;
  amount: number;
  token: "SOL" | "USDC";
  status: "draft" | "pending" | "paid" | "overdue";
  dueDate: number;
  paidDate?: number;
  createdAt: number;
  items: { description: string; amount: number }[];
  walletAddress: string;
  paymentSignature?: string;
}

// Helper to safely parse JSON
function safeJsonParse<T>(json: string | null, fallback: T): T {
  if (!json) return fallback;
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

// Check if localStorage is available
function isLocalStorageAvailable(): boolean {
  try {
    const test = "__storage_test__";
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

// ==================== TRANSACTIONS ====================

export function getTransactions(walletAddress?: string): StoredTransaction[] {
  if (!isLocalStorageAvailable()) return [];

  const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
  const transactions = safeJsonParse<StoredTransaction[]>(data, []);

  if (walletAddress) {
    return transactions.filter((tx) => tx.walletAddress === walletAddress);
  }
  return transactions;
}

export function addTransaction(transaction: Omit<StoredTransaction, "id">): StoredTransaction {
  if (!isLocalStorageAvailable()) {
    return { ...transaction, id: crypto.randomUUID() };
  }

  const transactions = getTransactions();
  const newTransaction: StoredTransaction = {
    ...transaction,
    id: crypto.randomUUID(),
  };

  // Check for duplicate signatures
  const exists = transactions.some((tx) => tx.signature === transaction.signature);
  if (!exists) {
    transactions.unshift(newTransaction); // Add to beginning
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }

  return newTransaction;
}

export function updateTransaction(
  signature: string,
  updates: Partial<StoredTransaction>
): StoredTransaction | null {
  if (!isLocalStorageAvailable()) return null;

  const transactions = getTransactions();
  const index = transactions.findIndex((tx) => tx.signature === signature);

  if (index !== -1) {
    transactions[index] = { ...transactions[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    return transactions[index];
  }

  return null;
}

export function getTransactionBySignature(signature: string): StoredTransaction | null {
  const transactions = getTransactions();
  return transactions.find((tx) => tx.signature === signature) || null;
}

// ==================== PAYMENT LINKS ====================

export function getPaymentLinks(walletAddress?: string): StoredPaymentLink[] {
  if (!isLocalStorageAvailable()) return [];

  const data = localStorage.getItem(STORAGE_KEYS.PAYMENT_LINKS);
  const links = safeJsonParse<StoredPaymentLink[]>(data, []);

  if (walletAddress) {
    return links.filter((link) => link.walletAddress === walletAddress);
  }
  return links;
}

export function addPaymentLink(
  link: Omit<StoredPaymentLink, "id" | "views" | "payments" | "createdAt">,
  customId?: string
): StoredPaymentLink {
  const id = customId || crypto.randomUUID();

  if (!isLocalStorageAvailable()) {
    return {
      ...link,
      id,
      views: 0,
      payments: 0,
      createdAt: Date.now(),
    };
  }

  const links = getPaymentLinks();
  const newLink: StoredPaymentLink = {
    ...link,
    id,
    views: 0,
    payments: 0,
    createdAt: Date.now(),
  };

  links.unshift(newLink);
  localStorage.setItem(STORAGE_KEYS.PAYMENT_LINKS, JSON.stringify(links));

  return newLink;
}

export function updatePaymentLink(
  id: string,
  updates: Partial<StoredPaymentLink>
): StoredPaymentLink | null {
  if (!isLocalStorageAvailable()) return null;

  const links = getPaymentLinks();
  const index = links.findIndex((link) => link.id === id);

  if (index !== -1) {
    links[index] = { ...links[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.PAYMENT_LINKS, JSON.stringify(links));
    return links[index];
  }

  return null;
}

export function deletePaymentLink(id: string): boolean {
  if (!isLocalStorageAvailable()) return false;

  const links = getPaymentLinks();
  const filtered = links.filter((link) => link.id !== id);

  if (filtered.length !== links.length) {
    localStorage.setItem(STORAGE_KEYS.PAYMENT_LINKS, JSON.stringify(filtered));
    return true;
  }

  return false;
}

export function incrementPaymentLinkViews(id: string): void {
  if (!isLocalStorageAvailable()) return;

  const links = getPaymentLinks();
  const index = links.findIndex((link) => link.id === id);

  if (index !== -1) {
    links[index].views += 1;
    localStorage.setItem(STORAGE_KEYS.PAYMENT_LINKS, JSON.stringify(links));
  }
}

export function incrementPaymentLinkPayments(id: string): void {
  if (!isLocalStorageAvailable()) return;

  const links = getPaymentLinks();
  const index = links.findIndex((link) => link.id === id);

  if (index !== -1) {
    links[index].payments += 1;
    localStorage.setItem(STORAGE_KEYS.PAYMENT_LINKS, JSON.stringify(links));
  }
}

// ==================== INVOICES ====================

export function getInvoices(walletAddress?: string): StoredInvoice[] {
  if (!isLocalStorageAvailable()) return [];

  const data = localStorage.getItem(STORAGE_KEYS.INVOICES);
  const invoices = safeJsonParse<StoredInvoice[]>(data, []);

  if (walletAddress) {
    return invoices.filter((inv) => inv.walletAddress === walletAddress);
  }
  return invoices;
}

export function addInvoice(invoice: Omit<StoredInvoice, "id" | "createdAt">): StoredInvoice {
  if (!isLocalStorageAvailable()) {
    return {
      ...invoice,
      id: `INV-${String(Date.now()).slice(-6)}`,
      createdAt: Date.now(),
    };
  }

  const invoices = getInvoices();
  const invoiceNumber = invoices.length + 1;
  const newInvoice: StoredInvoice = {
    ...invoice,
    id: `INV-${String(invoiceNumber).padStart(3, "0")}`,
    createdAt: Date.now(),
  };

  invoices.unshift(newInvoice);
  localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));

  return newInvoice;
}

export function updateInvoice(
  id: string,
  updates: Partial<StoredInvoice>
): StoredInvoice | null {
  if (!isLocalStorageAvailable()) return null;

  const invoices = getInvoices();
  const index = invoices.findIndex((inv) => inv.id === id);

  if (index !== -1) {
    invoices[index] = { ...invoices[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
    return invoices[index];
  }

  return null;
}

export function deleteInvoice(id: string): boolean {
  if (!isLocalStorageAvailable()) return false;

  const invoices = getInvoices();
  const filtered = invoices.filter((inv) => inv.id !== id);

  if (filtered.length !== invoices.length) {
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(filtered));
    return true;
  }

  return false;
}

// ==================== STATS CALCULATION ====================

export interface DashboardStats {
  totalRevenue: number;
  totalTransactions: number;
  avgPayment: number;
  totalPaymentLinks: number;
  totalViews: number;
  totalInvoicesPaid: number;
  pendingAmount: number;
}

export function calculateDashboardStats(walletAddress: string): DashboardStats {
  const transactions = getTransactions(walletAddress);
  const paymentLinks = getPaymentLinks(walletAddress);
  const invoices = getInvoices(walletAddress);

  const incomingTransactions = transactions.filter(
    (tx) => tx.type === "incoming" && tx.status === "confirmed"
  );

  const totalRevenue = incomingTransactions.reduce((sum, tx) => sum + tx.amount, 0);
  const totalTransactions = transactions.filter((tx) => tx.status === "confirmed").length;
  const avgPayment = incomingTransactions.length > 0
    ? totalRevenue / incomingTransactions.length
    : 0;

  const totalViews = paymentLinks.reduce((sum, link) => sum + link.views, 0);

  const paidInvoices = invoices.filter((inv) => inv.status === "paid");
  const pendingInvoices = invoices.filter(
    (inv) => inv.status === "pending" || inv.status === "overdue"
  );
  const pendingAmount = pendingInvoices.reduce((sum, inv) => sum + inv.amount, 0);

  return {
    totalRevenue,
    totalTransactions,
    avgPayment,
    totalPaymentLinks: paymentLinks.length,
    totalViews,
    totalInvoicesPaid: paidInvoices.length,
    pendingAmount,
  };
}

// ==================== CLEAR DATA ====================

export function clearAllData(): void {
  if (!isLocalStorageAvailable()) return;

  localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
  localStorage.removeItem(STORAGE_KEYS.PAYMENT_LINKS);
  localStorage.removeItem(STORAGE_KEYS.INVOICES);
  localStorage.removeItem(STORAGE_KEYS.SETTINGS);
}

export function clearTransactions(walletAddress?: string): void {
  if (!isLocalStorageAvailable()) return;

  if (walletAddress) {
    const transactions = getTransactions();
    const filtered = transactions.filter((tx) => tx.walletAddress !== walletAddress);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(filtered));
  } else {
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
  }
}
