"use client";

import { useState } from "react";
import Script from "next/script";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { AIAssistantWidget } from "@/components/AIAssistantWidget";
import { formatRupees } from "@/lib/utils";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export default function CheckoutPage() {
  const { data: session } = useSession();
  const { items, subtotal, clear } = useCart();
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", city: "Chennai", pincode: "" });
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placed, setPlaced] = useState(false);

  const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  async function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    setPlacing(true);
    setError(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountPaise: Math.round(subtotal * 100) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not start checkout.");

      const razorpay = new window.Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        order_id: data.orderId,
        name: "Madarasi Studio",
        description: `${items.length} item(s)`,
        prefill: { name: form.name, email: form.email, contact: form.phone },
        theme: { color: "#5C6B3E" },
        handler: () => {
          clear();
          setPlaced(true);
        },
      });
      razorpay.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start checkout.");
    } finally {
      setPlacing(false);
    }
  }

  if (placed) {
    return (
      <div className="container-page py-24 text-center">
        <h1 className="font-display text-2xl text-pine">Order placed</h1>
        <p className="mt-2 text-pine/60">We'll email a confirmation and start on your personalisation.</p>
        <Link href="/shop" className="mt-6 inline-block text-olive hover:underline">
          Keep browsing
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-page py-24 text-center">
        <h1 className="font-display text-2xl text-pine">Nothing to check out yet</h1>
        <Link href="/shop" className="mt-4 inline-block text-olive hover:underline">
          Browse the shop
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page py-12">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <h1 className="font-display text-3xl text-pine">Checkout</h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1.2fr_1fr]">
        <form onSubmit={placeOrder} className="space-y-4">
          {!session && (
            <p className="rounded-md border border-mist bg-cloud/40 p-3 text-sm text-pine/60">
              <Link href="/auth/signin" className="text-olive hover:underline">
                Sign in
              </Link>{" "}
              to save this address for next time, or continue as a guest below.
            </p>
          )}

          <Field label="Full name" value={form.name} onChange={update("name")} required />
          <Field label="Email" type="email" value={form.email} onChange={update("email")} required />
          <Field label="Phone" type="tel" value={form.phone} onChange={update("phone")} required />
          <Field label="Delivery address" value={form.address} onChange={update("address")} required />
          <div className="grid grid-cols-2 gap-4">
            <Field label="City" value={form.city} onChange={update("city")} required />
            <Field label="Pincode" value={form.pincode} onChange={update("pincode")} required />
          </div>

          {error && <p className="text-sm text-rust">{error}</p>}

          <button
            type="submit"
            disabled={placing}
            className="w-full rounded-md bg-olive px-5 py-3 text-sm font-medium text-ivory transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {placing ? "Starting checkout…" : `Pay ${formatRupees(subtotal)}`}
          </button>
          <p className="text-xs text-pine/40">
            Payment is handled by Razorpay. Add RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET to enable live
            payments — see the README.
          </p>
        </form>

        <div className="space-y-6">
          <div className="rounded-xl border border-mist bg-cloud/40 p-5">
            <h2 className="font-display text-lg text-pine">Order summary</h2>
            <div className="mt-4 space-y-3">
              {items.map((item) => (
                <div key={`${item.slug}-${item.color}`} className="flex justify-between text-sm">
                  <span className="text-pine/70">
                    {item.name} × {item.quantity}
                  </span>
                  <span className="text-pine">{formatRupees(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-between border-t border-mist pt-3 text-pine">
              <span>Subtotal</span>
              <span>{formatRupees(subtotal)}</span>
            </div>
          </div>

          <div>
            <h2 className="mb-2 font-display text-lg text-pine">Finishing touches</h2>
            <p className="mb-3 text-sm text-pine/60">
              Ask for a gift-wrap idea, a card message, or one last personalisation check before you pay.
            </p>
            <AIAssistantWidget variant="inline" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block text-sm text-pine/60">
      {label}
      <input
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        className="mt-1 w-full rounded-md border border-mist bg-cloud px-3 py-2 text-sm text-pine focus:border-olive"
      />
    </label>
  );
}
