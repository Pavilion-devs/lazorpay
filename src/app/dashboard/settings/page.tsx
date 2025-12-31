"use client";

import { useState } from "react";
import Image from "next/image";
import { useWallet } from "@lazorkit/wallet";
import {
  User,
  Wallet,
  Bell,
  Shield,
  Globe,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { truncateAddress } from "@/lib/utils/format";

function SettingsSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-zinc-950/20 backdrop-blur-xl overflow-hidden">
      <div className="p-6 border-b border-white/10">
        <h2 className="text-lg font-medium text-white tracking-tight">{title}</h2>
        <p className="text-sm text-zinc-400 tracking-tight mt-1">{description}</p>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function SettingsRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-white/5 last:border-0">
      <div>
        <div className="text-sm text-white tracking-tight">{label}</div>
        {description && (
          <div className="text-xs text-zinc-500 tracking-tight mt-0.5">
            {description}
          </div>
        )}
      </div>
      {children}
    </div>
  );
}

function Toggle({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={`relative w-11 h-6 rounded-full transition-colors ${
        enabled ? "bg-violet-600" : "bg-zinc-700"
      }`}
    >
      <div
        className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
          enabled ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

export default function SettingsPage() {
  const { smartWalletPubkey } = useWallet();
  const [copied, setCopied] = useState(false);

  // Settings state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);

  const copyAddress = () => {
    if (smartWalletPubkey) {
      navigator.clipboard.writeText(smartWalletPubkey.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-light text-white tracking-tight">
          Settings
        </h1>
        <p className="text-zinc-400 tracking-tight mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="space-y-6">
        {/* Profile Section */}
        <SettingsSection
          title="Profile"
          description="Your account information and wallet details"
        >
          <div className="flex items-center gap-4 pb-6 border-b border-white/5">
            <div className="w-16 h-16 rounded-xl bg-violet-500/10 flex items-center justify-center">
              <User className="w-8 h-8 text-violet-400" />
            </div>
            <div>
              <div className="text-lg text-white tracking-tight">
                Passkey Wallet
              </div>
              <div className="text-sm text-zinc-400 tracking-tight">
                Authenticated via WebAuthn
              </div>
            </div>
          </div>

          <SettingsRow label="Wallet Address" description="Your Solana wallet address">
            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-300 font-mono tracking-tight">
                {smartWalletPubkey && truncateAddress(smartWalletPubkey.toString(), 8, 8)}
              </span>
              <button
                onClick={copyAddress}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-violet-400" />
                ) : (
                  <Copy className="w-4 h-4 text-zinc-500" />
                )}
              </button>
              <a
                href={`https://explorer.solana.com/address/${smartWalletPubkey}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <ExternalLink className="w-4 h-4 text-zinc-500" />
              </a>
            </div>
          </SettingsRow>

          <SettingsRow label="Network" description="Current Solana network">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-violet-400"></div>
              <span className="text-sm text-violet-400 tracking-tight">Devnet</span>
            </div>
          </SettingsRow>
        </SettingsSection>

        {/* Notifications Section */}
        <SettingsSection
          title="Notifications"
          description="Configure how you receive notifications"
        >
          <SettingsRow
            label="Email Notifications"
            description="Receive payment confirmations via email"
          >
            <Toggle
              enabled={emailNotifications}
              onToggle={() => setEmailNotifications(!emailNotifications)}
            />
          </SettingsRow>

          <SettingsRow
            label="Push Notifications"
            description="Get instant notifications in your browser"
          >
            <Toggle
              enabled={pushNotifications}
              onToggle={() => setPushNotifications(!pushNotifications)}
            />
          </SettingsRow>

          <SettingsRow
            label="Marketing Emails"
            description="Receive updates about new features and promotions"
          >
            <Toggle
              enabled={marketingEmails}
              onToggle={() => setMarketingEmails(!marketingEmails)}
            />
          </SettingsRow>
        </SettingsSection>

        {/* Security Section */}
        <SettingsSection
          title="Security"
          description="Manage your account security settings"
        >
          <SettingsRow
            label="Passkey Authentication"
            description="Your wallet is secured with WebAuthn passkeys"
          >
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20">
              <Shield className="w-4 h-4 text-violet-400" />
              <span className="text-sm text-violet-400 tracking-tight">Enabled</span>
            </div>
          </SettingsRow>

          <SettingsRow
            label="Two-Factor Authentication"
            description="Add an extra layer of security"
          >
            <Toggle
              enabled={twoFactorEnabled}
              onToggle={() => setTwoFactorEnabled(!twoFactorEnabled)}
            />
          </SettingsRow>

          <SettingsRow
            label="Active Sessions"
            description="Manage devices that have access to your account"
          >
            <button className="flex items-center gap-1 text-sm text-violet-400 hover:text-violet-300 transition-colors">
              View all
              <ChevronRight className="w-4 h-4" />
            </button>
          </SettingsRow>
        </SettingsSection>

        {/* Preferences Section */}
        <SettingsSection
          title="Preferences"
          description="Customize your experience"
        >
          <SettingsRow label="Language" description="Select your preferred language">
            <select className="px-3 py-2 rounded-lg border border-white/10 bg-zinc-900/50 text-sm text-white focus:outline-none focus:border-violet-500/50 transition-colors tracking-tight cursor-pointer">
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </SettingsRow>

          <SettingsRow label="Currency Display" description="Preferred currency for displaying values">
            <select className="px-3 py-2 rounded-lg border border-white/10 bg-zinc-900/50 text-sm text-white focus:outline-none focus:border-violet-500/50 transition-colors tracking-tight cursor-pointer">
              <option value="usd">USD ($)</option>
              <option value="eur">EUR</option>
              <option value="gbp">GBP</option>
              <option value="sol">SOL</option>
            </select>
          </SettingsRow>

          <SettingsRow label="Timezone" description="Your local timezone">
            <select className="px-3 py-2 rounded-lg border border-white/10 bg-zinc-900/50 text-sm text-white focus:outline-none focus:border-violet-500/50 transition-colors tracking-tight cursor-pointer">
              <option value="utc">UTC</option>
              <option value="est">Eastern Time</option>
              <option value="pst">Pacific Time</option>
              <option value="gmt">GMT</option>
            </select>
          </SettingsRow>
        </SettingsSection>

        {/* Danger Zone */}
        <SettingsSection
          title="Danger Zone"
          description="Irreversible actions for your account"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-white tracking-tight">Delete Account</div>
              <div className="text-xs text-zinc-500 tracking-tight mt-0.5">
                Permanently delete your account and all associated data
              </div>
            </div>
            <button className="px-4 py-2 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-colors tracking-tight">
              Delete Account
            </button>
          </div>
        </SettingsSection>
      </div>
    </DashboardLayout>
  );
}
