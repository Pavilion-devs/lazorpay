import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LazorPayProvider } from "@/lib/lazorkit/provider";
import Background from "@/components/Background";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LazorPay - Passkey-Powered Payments for Solana",
  description:
    "Accept crypto payments with zero gas fees using passkey authentication. No seed phrases, just biometrics. Built with LazorKit SDK.",
  keywords: [
    "Solana",
    "payments",
    "passkey",
    "USDC",
    "crypto",
    "LazorKit",
    "gasless",
    "web3",
  ],
  authors: [{ name: "LazorPay" }],
  openGraph: {
    title: "LazorPay - Passkey-Powered Payments for Solana",
    description:
      "Accept crypto payments with zero gas fees using passkey authentication.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white min-h-screen`}
      >
        <LazorPayProvider>
          <Background />

          {/* Floating decorative elements */}
          <div className="bg-zinc-600 opacity-20 w-2 h-2 rounded-full absolute top-20 left-10"></div>
          <div className="absolute top-40 right-20 w-1 h-1 bg-zinc-500 rounded-full opacity-30"></div>
          <div className="absolute top-80 left-1/4 w-1.5 h-1.5 bg-zinc-600 rounded-full opacity-25"></div>

          {/* Main content */}
          <div className="relative z-10">{children}</div>
        </LazorPayProvider>
      </body>
    </html>
  );
}
