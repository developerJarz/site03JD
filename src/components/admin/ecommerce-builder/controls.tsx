"use client";

import { useRouter } from "next/navigation";
import { Copy, Link2, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { controlClass } from "@/components/ui/form";
import { useToast } from "@/components/ui/toast";
import {
  addBuilderOrderNoteAction,
  assignBuilderOrderAction,
  createBuilderInvoiceAction,
  deleteBuilderPaymentAction,
  publishPricingAction,
  recordBuilderPaymentAction,
  rotateInvoiceLinkAction,
  rotateQuoteLinkAction,
  updateBuilderOrderStatusAction,
} from "@/lib/actions/ecommerce-builder-admin";
import type { ActionResult } from "@/lib/actions/types";
import { ORDER_STATUS_META, PAYMENT_METHODS, type OrderStatus } from "@/lib/ecommerce-builder/constants";
import { cn } from "@/lib/utils";

function useRun() {
  const [pending, start] = useTransition();
  const toast = useToast();
  const router = useRouter();
  const run = <T,>(fn: () => Promise<ActionResult<T>>, after?: (res: ActionResult<T>) => void) =>
    start(async () => {
      const res = await fn();
      if (res.ok) {
        toast.success(res.message ?? "Saved");
        after?.(res);
        router.refresh();
      } else toast.error(res.error);
    });
  return { pending, run };
}

/** Shows a one-time customer link with a copy button. */
function OneTimeLink({ path }: { path: string }) {
  const toast = useToast();
  const url = typeof window !== "undefined" ? new URL(path, window.location.origin).toString() : path;
  return (
    <div className="mt-3 rounded-xl border border-amber-200 bg-warning-50 p-3 text-xs text-amber-900">
      <p className="font-medium">Copy this link now — it is shown only once.</p>
      <div className="mt-2 flex gap-2">
        <input readOnly value={url} onFocus={(e) => e.currentTarget.select()} className="h-9 min-w-0 flex-1 rounded-lg border border-amber-200 bg-white px-2 font-mono text-[0.7rem]" aria-label="Customer link" />
        <button
          type="button"
          onClick={() => navigator.clipboard?.writeText(url).then(() => toast.success("Link copied"), () => toast.error("Copy failed — select the link and copy it manually."))}
          className="flex h-9 items-center gap-1.5 rounded-lg bg-ink-900 px-3 text-white"
        >
          <Copy className="size-3.5" aria-hidden /> Copy
        </button>
      </div>
    </div>
  );
}

export function PublishPricing({ disabled }: { disabled?: boolean }) {
  const { pending, run } = useRun();
  const [note, setNote] = useState("");
  return (
    <div className="space-y-2">
      <label htmlFor="publish-note" className="sr-only">
        Change note
      </label>
      <input id="publish-note" value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} placeholder="What changed? (optional, e.g. “POS price to $90”)" className={controlClass(false, "h-10 text-sm")} />
      <Button variant="dark" size="sm" loading={pending} disabled={disabled} onClick={() => run(() => publishPricingAction(note), () => setNote(""))}>
        Publish pricing
      </Button>
    </div>
  );
}

export function OrderStatusPicker({ id, value }: { id: string; value: string }) {
  const { pending, run } = useRun();
  return (
    <div role="radiogroup" aria-label="Order status" className={cn("flex flex-wrap gap-1.5", pending && "opacity-60")}>
      {(Object.entries(ORDER_STATUS_META) as [OrderStatus, (typeof ORDER_STATUS_META)[OrderStatus]][]).map(([key, meta]) => (
        <button
          key={key}
          type="button"
          role="radio"
          aria-checked={value === key}
          disabled={pending}
          onClick={() => value !== key && run(() => updateBuilderOrderStatusAction(id, key))}
          className={cn("rounded-full border px-3 py-1.5 text-xs font-medium transition-colors", value === key ? "border-ink-900 bg-ink-900 text-white" : "border-mist-200 bg-white text-mist-600 hover:border-mist-400")}
        >
          {meta.label}
        </button>
      ))}
    </div>
  );
}

export function OrderNoteForm({ id }: { id: string }) {
  const { pending, run } = useRun();
  const [body, setBody] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        run(() => addBuilderOrderNoteAction(id, body), () => setBody(""));
      }}
      className="space-y-2"
    >
      <label htmlFor="order-note" className="sr-only">
        Internal note
      </label>
      <textarea id="order-note" value={body} onChange={(e) => setBody(e.target.value)} rows={3} maxLength={2000} placeholder="Add an internal note (only visible to staff)…" className="w-full rounded-xl border border-mist-200 px-3 py-2 text-sm outline-none focus:border-brand-500" />
      <div className="flex justify-end">
        <Button type="submit" size="sm" variant="dark" loading={pending} disabled={!body.trim()}>
          Add note
        </Button>
      </div>
    </form>
  );
}

export function AssigneeSelect({ id, value, staff }: { id: string; value: string; staff: { id: string; name: string }[] }) {
  const { pending, run } = useRun();
  return (
    <select value={value} disabled={pending} onChange={(e) => run(() => assignBuilderOrderAction(id, e.target.value))} aria-label="Assigned to" className={controlClass(false, "h-10 text-sm")}>
      <option value="">Unassigned</option>
      {staff.map((s) => (
        <option key={s.id} value={s.id}>
          {s.name}
        </option>
      ))}
    </select>
  );
}

export function PaymentForm({ id, currency, balance }: { id: string; currency: string; balance: number }) {
  const { pending, run } = useRun();
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<string>(PAYMENT_METHODS[0]);
  const [reference, setReference] = useState("");
  const [note, setNote] = useState("");
  const [receivedAt, setReceivedAt] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        run(
          () => recordBuilderPaymentAction(id, { amount: Math.round(Number(amount) * 100), method, reference, note, receivedAt }),
          () => {
            setAmount("");
            setReference("");
            setNote("");
          },
        );
      }}
      className="grid gap-3 sm:grid-cols-2"
    >
      <div>
        <label htmlFor="pay-amount" className="mb-1 block text-xs font-medium text-mist-600">
          Amount received ({currency})
        </label>
        <input id="pay-amount" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))} placeholder={balance > 0 ? (balance / 100).toFixed(2) : "0.00"} className={controlClass(false, "h-10 text-sm")} />
      </div>
      <div>
        <label htmlFor="pay-method" className="mb-1 block text-xs font-medium text-mist-600">
          Method
        </label>
        <select id="pay-method" value={method} onChange={(e) => setMethod(e.target.value)} className={controlClass(false, "h-10 text-sm")}>
          {PAYMENT_METHODS.map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="pay-ref" className="mb-1 block text-xs font-medium text-mist-600">
          Transaction ID / reference
        </label>
        <input id="pay-ref" value={reference} onChange={(e) => setReference(e.target.value)} maxLength={120} className={controlClass(false, "h-10 text-sm")} />
      </div>
      <div>
        <label htmlFor="pay-date" className="mb-1 block text-xs font-medium text-mist-600">
          Received on
        </label>
        <input id="pay-date" type="date" value={receivedAt} onChange={(e) => setReceivedAt(e.target.value)} className={controlClass(false, "h-10 text-sm")} />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="pay-note" className="mb-1 block text-xs font-medium text-mist-600">
          Note
        </label>
        <input id="pay-note" value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} className={controlClass(false, "h-10 text-sm")} />
      </div>
      <div className="flex items-center justify-between gap-3 sm:col-span-2">
        <p className="text-xs text-mist-500">Record only payments you have confirmed in your bank or wallet.</p>
        <Button type="submit" size="sm" variant="dark" loading={pending} disabled={!(Number(amount) > 0)}>
          Record payment
        </Button>
      </div>
    </form>
  );
}

export function DeletePaymentButton({ id, paymentId }: { id: string; paymentId: string }) {
  const { pending, run } = useRun();
  const [confirm, setConfirm] = useState(false);
  return confirm ? (
    <span className="flex items-center gap-1">
      <Button size="sm" variant="danger" loading={pending} onClick={() => run(() => deleteBuilderPaymentAction(id, paymentId))}>
        Remove
      </Button>
      <Button size="sm" variant="ghost" onClick={() => setConfirm(false)}>
        Cancel
      </Button>
    </span>
  ) : (
    <button type="button" onClick={() => setConfirm(true)} className="rounded-lg p-1.5 text-mist-400 hover:bg-mist-100 hover:text-danger-500" aria-label="Remove payment">
      <Trash2 className="size-4" />
    </button>
  );
}

export function CreateInvoice({ orderId, allowed }: { orderId: string; allowed: boolean }) {
  const { pending, run } = useRun();
  const [days, setDays] = useState("7");
  const [link, setLink] = useState<string | null>(null);
  return (
    <div>
      <div className="flex flex-wrap items-end gap-2">
        <div>
          <label htmlFor="inv-days" className="mb-1 block text-xs font-medium text-mist-600">
            Due in (days)
          </label>
          <input id="inv-days" type="number" min={0} max={90} value={days} onChange={(e) => setDays(e.target.value)} className={controlClass(false, "h-10 w-24 text-sm")} />
        </div>
        <Button size="sm" variant="dark" loading={pending} disabled={!allowed} onClick={() => run(() => createBuilderInvoiceAction(orderId, Number(days)), (res) => res.ok && res.data && setLink(res.data.url))}>
          Issue invoice
        </Button>
      </div>
      {!allowed && <p className="mt-2 text-xs text-mist-500">Available once the order is confirmed and has no active invoice.</p>}
      {link && <OneTimeLink path={link} />}
    </div>
  );
}

export function RotateLinkButton({ kind, id }: { kind: "quote" | "invoice"; id: string }) {
  const { pending, run } = useRun();
  const [link, setLink] = useState<string | null>(null);
  return (
    <div>
      <Button
        size="sm"
        variant="outline"
        loading={pending}
        onClick={() =>
          kind === "quote"
            ? run(() => rotateQuoteLinkAction(id), (res) => res.ok && res.data && setLink(res.data.url))
            : run(() => rotateInvoiceLinkAction(id), (res) => res.ok && res.data && setLink(res.data.url))
        }
      >
        <Link2 className="size-4" aria-hidden /> New customer link
      </Button>
      {link && <OneTimeLink path={link} />}
    </div>
  );
}
