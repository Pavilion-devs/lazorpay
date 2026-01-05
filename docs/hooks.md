# Hooks Reference

## useWallet

The main hook for interacting with the LazorKit wallet. Provided by `@lazorkit/wallet`.

### Usage

```tsx
import { useWallet } from "@lazorkit/wallet";

function MyComponent() {
  const {
    isConnected,
    isConnecting,
    smartWalletPubkey,
    connect,
    disconnect,
    signAndSendTransaction,
    signMessage,
  } = useWallet();

  // Your component logic
}
```

### Return Values

| Property | Type | Description |
|----------|------|-------------|
| `isConnected` | boolean | Whether a wallet is currently connected |
| `isConnecting` | boolean | Whether a connection is in progress |
| `smartWalletPubkey` | PublicKey \| null | The connected smart wallet address |
| `connect` | () => Promise<void> | Initiates passkey authentication |
| `disconnect` | () => void | Disconnects the wallet |
| `signAndSendTransaction` | (params) => Promise<string> | Signs and sends a transaction |
| `signMessage` | (message) => Promise<Uint8Array> | Signs a message |

### signAndSendTransaction Options

```tsx
const signature = await signAndSendTransaction({
  // Required: Array of transaction instructions
  instructions: [instruction1, instruction2],

  // Optional: Transaction options
  transactionOptions: {
    // Cluster for simulation (recommended)
    clusterSimulation: "devnet", // or "mainnet"

    // Fee token for gasless transactions (optional)
    // When not provided, uses fully gasless mode (Kora covers fees)
    feeToken: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  },
});
```

### Example: Complete Payment Flow

```tsx
import { useWallet } from "@lazorkit/wallet";
import { SystemProgram, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";

function PaymentComponent({ recipient, amount }) {
  const { isConnected, connect, signAndSendTransaction, smartWalletPubkey } = useWallet();
  const [status, setStatus] = useState("idle");

  const handlePayment = async () => {
    // Connect if not connected
    if (!isConnected) {
      await connect();
      return;
    }

    try {
      setStatus("processing");

      const instruction = SystemProgram.transfer({
        fromPubkey: smartWalletPubkey!,
        toPubkey: new PublicKey(recipient),
        lamports: amount * LAMPORTS_PER_SOL,
      });

      const signature = await signAndSendTransaction({
        instructions: [instruction],
        transactionOptions: {
          clusterSimulation: "devnet",
        },
      });

      setStatus("success");
      return signature;
    } catch (error) {
      setStatus("error");
      throw error;
    }
  };

  return (
    <button onClick={handlePayment} disabled={status === "processing"}>
      {status === "processing" ? "Processing..." : `Pay ${amount} SOL`}
    </button>
  );
}
```

---

## usePaymentLinks

A custom hook for managing payment links with localStorage persistence.

### Usage

```tsx
import { usePaymentLinks } from "@/hooks/usePaymentLinks";

function PaymentLinksManager() {
  const { paymentLinks, createPaymentLink, deletePaymentLink, getPaymentLink } = usePaymentLinks();

  const handleCreate = () => {
    const link = createPaymentLink({
      recipient: "WALLET_ADDRESS",
      amount: 10,
      token: "SOL",
      memo: "Payment for services",
      merchantName: "My Store",
    });

    console.log("Created link:", link.id);
  };

  return (
    <div>
      <button onClick={handleCreate}>Create Link</button>

      {paymentLinks.map((link) => (
        <div key={link.id}>
          <span>{link.amount} {link.token}</span>
          <button onClick={() => deletePaymentLink(link.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
```

### Return Values

| Property | Type | Description |
|----------|------|-------------|
| `paymentLinks` | PaymentLink[] | Array of saved payment links |
| `createPaymentLink` | (data) => PaymentLink | Creates and saves a new payment link |
| `deletePaymentLink` | (id: string) => void | Deletes a payment link by ID |
| `getPaymentLink` | (id: string) => PaymentLink \| undefined | Retrieves a specific payment link |

### PaymentLink Type

```typescript
interface PaymentLink {
  id: string;
  recipient: string;
  amount: number;
  token: "SOL" | "USDC";
  memo?: string;
  merchantName?: string;
  createdAt: string;
  url: string;
}
```

---

## Token Utilities

Helper functions for working with SOL and USDC transfers.

### toBaseUnits

Converts human-readable amount to token base units.

```tsx
import { toBaseUnits } from "@/lib/solana/tokens";

// SOL: 1 SOL = 1,000,000,000 lamports
const lamports = toBaseUnits(1, "SOL"); // 1000000000

// USDC: 1 USDC = 1,000,000 micro-USDC
const microUsdc = toBaseUnits(10, "USDC"); // 10000000
```

### fromBaseUnits

Converts base units back to human-readable amount.

```tsx
import { fromBaseUnits } from "@/lib/solana/tokens";

const sol = fromBaseUnits(1000000000, "SOL"); // 1
const usdc = fromBaseUnits(10000000, "USDC"); // 10
```

### buildUSDCTransferInstructions

Builds instructions for USDC transfer, automatically handling ATA creation.

```tsx
import { buildUSDCTransferInstructions } from "@/lib/solana/tokens";

const instructions = await buildUSDCTransferInstructions({
  connection,
  from: senderPubkey,
  to: recipientPubkey,
  amount: 10, // Human-readable amount
});

// Instructions include:
// 1. Create recipient ATA (if needed)
// 2. Transfer USDC
```

### getUSDCBalance

Gets USDC balance for a wallet address.

```tsx
import { getUSDCBalance } from "@/lib/solana/tokens";

const balance = await getUSDCBalance(connection, walletPubkey);
console.log(`Balance: ${balance} USDC`);
```

---

## Storage Utilities

Functions for persisting data to localStorage.

### saveTransaction

Saves a transaction record.

```tsx
import { saveTransaction } from "@/lib/utils/storage";

saveTransaction({
  signature: "tx_signature",
  type: "sent", // or "received"
  amount: 1.5,
  token: "SOL",
  recipient: "ADDRESS",
  walletAddress: "MY_ADDRESS",
  timestamp: new Date().toISOString(),
});
```

### getTransactions

Retrieves transaction history for a wallet.

```tsx
import { getTransactions } from "@/lib/utils/storage";

const transactions = getTransactions("MY_WALLET_ADDRESS");
// Returns array of TransactionRecord objects
```

### TransactionRecord Type

```typescript
interface TransactionRecord {
  signature: string;
  type: "sent" | "received";
  amount: number;
  token: "SOL" | "USDC";
  recipient?: string;
  sender?: string;
  walletAddress: string;
  timestamp: string;
  memo?: string;
}
```
