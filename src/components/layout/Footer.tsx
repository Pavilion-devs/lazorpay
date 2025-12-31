"use client";

import Link from "next/link";
import Image from "next/image";

function XIcon() {
  return (
    <svg
      width="17"
      height="16"
      viewBox="0 0 25 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ color: "rgb(255, 255, 255)" }}
    >
      <path
        d="M14.0324 10.0936L21.3178 1.625H19.5914L13.2655 8.9782L8.21307 1.625H2.38567L10.026 12.7443L2.38567 21.625H4.11216L10.7924 13.8598L16.1282 21.625H21.9556L14.032 10.0936H14.0324ZM11.6678 12.8423L10.8936 11.7351L4.73424 2.92468H7.38603L12.3567 10.0349L13.1309 11.1422L19.5922 20.3844H16.9404L11.6678 12.8427V12.8423Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="animate-fade-slide-in animate-on-scroll xl:mb-12 border-zinc-800 mb-12 relative">
      <div className="max-w-7xl mr-auto ml-auto px-6">
        <div className="overflow-hidden border border-white/10 bg-zinc-950/20 backdrop-blur-xl rounded-3xl hover:bg-zinc-950/30 hover:border-white/20 transition-all duration-700">
          <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-white/10 animate-fade-slide-in animate-on-scroll">
            {/* Left: Logo and description */}
            <div className="md:col-span-5 p-8">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <Image
                  src="/logo.png"
                  alt="LazorPay"
                  width={60}
                  height={60}
                  className="rounded-lg"
                />
              </Link>
              <p className="text-zinc-400 text-sm tracking-tight max-w-sm">
                Passkey-powered payments for Solana. Accept crypto with zero gas
                fees, no seed phrases required. Built with LazorKit SDK.
              </p>
            </div>

            {/* Middle: Links */}
            <div className="flex md:col-span-4 md:p-8 md:bg-zinc-950/30 md:backdrop-blur-xl pt-6 pr-6 pb-6 pl-6 items-start">
              <ul className="space-y-4">
                <li>
                  <Link
                    href="/checkout"
                    className="text-lg text-zinc-400 hover:text-white transition-colors tracking-tight"
                  >
                    Demo
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pay"
                    className="text-lg text-zinc-400 hover:text-white transition-colors tracking-tight"
                  >
                    Payment Links
                  </Link>
                </li>
                <li>
                  <Link
                    href="/docs"
                    className="text-lg text-zinc-400 hover:text-white transition-colors tracking-tight"
                  >
                    Documentation
                  </Link>
                </li>
                <li>
                  <a
                    href="https://docs.lazorkit.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lg text-zinc-400 hover:text-white transition-colors tracking-tight"
                  >
                    LazorKit Docs
                  </a>
                </li>
              </ul>
            </div>

            {/* Right: Contact + Social + Copyright */}
            <div className="md:col-span-3 md:p-8 md:bg-zinc-950/30 md:backdrop-blur-xl px-6 py-6">
              <a
                href="https://github.com/lazor-kit/lazor-kit"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white text-xl sm:text-2xl tracking-tight hover:opacity-90"
              >
                GitHub
              </a>
              <div className="mt-6 flex items-center gap-4">
                <a
                  href="https://twitter.com/lazorkit"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-black/20 backdrop-blur-sm text-zinc-500 hover:text-white hover:bg-black/30 transition-colors"
                >
                  <XIcon />
                </a>
                <a
                  href="https://t.me/lazorkit"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Telegram"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-black/20 backdrop-blur-sm text-zinc-500 hover:text-white hover:bg-black/30 transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                  </svg>
                </a>
                <a
                  href="https://github.com/lazor-kit/lazor-kit"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-black/20 backdrop-blur-sm text-zinc-500 hover:text-white hover:bg-black/30 transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                </a>
              </div>
              <p className="mt-8 text-sm text-zinc-500 tracking-tight">
                © <span className="tracking-tight">{currentYear}</span> LazorPay
              </p>
              <p className="mt-2 text-xs text-zinc-600 tracking-tight">
                Built for the LazorKit SDK Bounty
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
