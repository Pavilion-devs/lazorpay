import type { Metadata } from "next";
import { LazorkitProvider } from "@lazorkit/wallet";
import "./globals.css";

export const metadata: Metadata = {
  title: "LazorPay Checkout Example",
  description: "Passkey-powered checkout with LazorKit",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-zinc-950 text-white min-h-screen">
        <LazorkitProvider
          rpcUrl={process.env.NEXT_PUBLIC_RPC_URL || "https://api.devnet.solana.com"}
          portalUrl={process.env.NEXT_PUBLIC_PORTAL_URL || "https://portal.lazor.sh"}
          paymasterConfig={{
            paymasterUrl: process.env.NEXT_PUBLIC_PAYMASTER_URL || "https://kora.devnet.lazorkit.com",
          }}
        >
          {children}
        </LazorkitProvider>
      </body>
    </html>
  );
}

