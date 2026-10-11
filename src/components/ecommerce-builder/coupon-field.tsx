"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { calculateQuote } from "@/lib/ecommerce-builder/pricing";
import type { Pricebook, Selection } from "@/lib/ecommerce-builder/types";

export function CouponField({ pricebook, selection, onChange, validationError }: { pricebook: Pricebook; selection: Selection; onChange: (selection: Selection) => void; validationError?: string }) {
  const id = useId();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const message = error || validationError;

  return (
    <form
      className="mt-6 rounded-2xl border border-mist-200 bg-mist-25 p-4 sm:p-5"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        if (!code.trim()) {
          setError("Enter a coupon code first.");
          return;
        }
        const result = calculateQuote(pricebook, { ...selection, couponCode: code });
        if (!result.ok) {
          setError(result.errors[0]);
          return;
        }
        setError("");
        setCode("");
        onChange(result.selection);
      }}
    >
      <label htmlFor={id} className="block text-sm font-medium text-ink-900">Have a coupon code?</label>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <input
          id={id}
          name="couponCode"
          value={code}
          onChange={(event) => { setCode(event.target.value); setError(""); }}
          maxLength={40}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          placeholder="Enter your code"
          aria-invalid={Boolean(message)}
          aria-describedby={`${id}-help${message ? ` ${id}-error` : ""}`}
          className="h-11 min-w-0 flex-1 rounded-xl border border-mist-300 bg-white px-4 text-base text-ink-900 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15"
        />
        <Button type="submit" variant="dark" size="md" disabled={!selection.templateId}>Apply coupon</Button>
      </div>
      <p id={`${id}-help`} className="mt-2 text-xs text-mist-600">{selection.templateId ? "Apply one coupon to your website development total." : "Choose a store design before applying a coupon."}</p>
      {selection.couponCode && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-brand-50 pl-3 text-sm text-brand-800">
          <span role="status">Coupon <strong>{selection.couponCode}</strong>{validationError ? " needs review" : " applied"}</span>
          <Button type="button" variant="ghost" size="md" aria-label={`Remove coupon ${selection.couponCode}`} onClick={() => {
            setError("");
            setCode("");
            onChange({ ...selection, couponCode: undefined });
          }}>Remove</Button>
        </div>
      )}
      {message && <p id={`${id}-error`} role="alert" className="mt-2 text-sm text-red-700">{message}</p>}
    </form>
  );
}
