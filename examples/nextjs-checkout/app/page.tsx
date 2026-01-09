"use client";

import { Checkout } from "../components/Checkout";

// Demo merchant wallet (replace with your own)
const MERCHANT_WALLET = "hij78MKbJSSs15qvkHWTDCtnmba2c1W4r1V22g5sD8w";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">LazorPay Checkout</h1>
          <p className="text-zinc-400">
            Pay with passkeys - no wallet extension needed
          </p>
        </div>

        <Checkout
          recipient={MERCHANT_WALLET}
          amount={0.01}
          token="SOL"
          merchantName="Demo Store"
        />

        <p className="text-center text-zinc-500 text-sm mt-8">
          Powered by{" "}
          <a
            href="https://docs.lazorkit.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-violet-400 hover:underline"
          >
            LazorKit
          </a>
        </p>
      </div>
    </main>
  );
}

