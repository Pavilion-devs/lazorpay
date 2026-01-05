# Components Reference

LazorPay provides pre-built React components for common payment flows.

## PaymentModal

A complete payment modal with wallet connection, transaction signing, and status handling.

### Usage

```tsx
import { PaymentModal } from "@/components/payment/PaymentModal";

function App() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Pay Now</button>

      <PaymentModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        recipient="WALLET_ADDRESS"
        amount={10}
        token="SOL"
        merchantName="My Store"
        memo="Order #123"
        onSuccess={(result) => console.log(result.signature)}
        onError={(error) => console.error(error)}
      />
    </>
  );
}
```

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `isOpen` | boolean | Yes | Controls modal visibility |
| `onClose` | () => void | Yes | Called when modal should close |
| `recipient` | string | Yes | Recipient wallet address |
| `amount` | number | Yes | Payment amount |
| `token` | "SOL" \| "USDC" | No | Token to transfer (default: SOL) |
| `memo` | string | No | Optional payment memo |
| `merchantName` | string | No | Display name for the merchant |
| `onSuccess` | (result) => void | No | Called on successful payment |
| `onError` | (error) => void | No | Called on payment error |

### Features

- Automatic wallet connection flow
- Passkey-based transaction signing
- Gasless transactions via paymaster
- SOL and USDC support
- Real-time transaction status feedback
- Mobile-responsive design

---

## ConnectButton

A styled button for wallet connection with built-in state management.

### Usage

```tsx
import { ConnectButton } from "@/components/wallet/ConnectButton";

function Header() {
  return (
    <nav>
      <ConnectButton variant="default" size="md" />
    </nav>
  );
}
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | "default" \| "outline" \| "ghost" | "default" | Button style variant |
| `size` | "sm" \| "md" \| "lg" | "md" | Button size |
| `className` | string | "" | Additional CSS classes |

### States

The button automatically handles these states:
- **Disconnected**: Shows "Connect Wallet"
- **Connecting**: Shows loading spinner
- **Connected**: Shows truncated wallet address with disconnect option

---

## CreatePaymentModal

A modal for creating shareable payment links with QR code generation.

### Usage

```tsx
import { CreatePaymentModal } from "@/components/payment/CreatePaymentModal";

function Dashboard() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Create Payment Link</button>

      <CreatePaymentModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
```

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `isOpen` | boolean | Yes | Controls modal visibility |
| `onClose` | () => void | Yes | Called when modal should close |

### Features

- QR code generation for easy sharing
- One-click link copying
- Native share API support (mobile)
- Pre-filled with connected wallet address
- Amount and token selection
- Optional memo field

---

## LazorPayButton

A drop-in payment button that opens a modal for payment processing.

### Usage

```tsx
import { LazorPayButton } from "@/components/payment/LazorPayButton";

function ProductPage({ product }) {
  return (
    <div>
      <h1>{product.name}</h1>
      <p>${product.price}</p>

      <LazorPayButton
        recipient="MERCHANT_WALLET"
        amount={product.price}
        token="USDC"
        merchantName="My Store"
        memo={`Purchase: ${product.name}`}
        onSuccess={(result) => {
          // Redirect to success page
          router.push(`/order/success?tx=${result.signature}`);
        }}
      />
    </div>
  );
}
```

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `recipient` | string | Yes | Recipient wallet address |
| `amount` | number | Yes | Payment amount |
| `token` | "SOL" \| "USDC" | No | Token to transfer |
| `merchantName` | string | No | Display name for merchant |
| `memo` | string | No | Payment memo |
| `onSuccess` | (result) => void | No | Success callback |
| `onError` | (error) => void | No | Error callback |
| `variant` | "default" \| "outline" \| "minimal" | No | Button style |
| `size` | "sm" \| "md" \| "lg" | No | Button size |

---

## Styling

All components use Tailwind CSS and support the following customization approaches:

### 1. className Prop

```tsx
<ConnectButton className="my-custom-class" />
```

### 2. CSS Variables

Components use CSS variables for theming:

```css
:root {
  --lazorpay-primary: #8b5cf6;
  --lazorpay-primary-hover: #7c3aed;
  --lazorpay-success: #10b981;
  --lazorpay-error: #ef4444;
}
```

### 3. Tailwind Config

Extend your Tailwind config to customize the design system:

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: "#8b5cf6",
      },
    },
  },
};
```
