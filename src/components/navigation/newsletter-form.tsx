"use client";

import { ArrowRight, Check, Loader2 } from "lucide-react";
import { useState } from "react";

export function NewsletterForm() {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setState("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.get("email"), website: form.get("website") }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      setState("done");
      setMessage("You're subscribed. Thank you!");
    } catch (err) {
      setState("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (state === "done") {
    return (
      <p className="mt-4 flex items-center gap-2 text-sm text-brand-300" role="status">
        <Check className="size-4" aria-hidden /> {message}
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-4" noValidate>
      <div className="flex rounded-full border border-white/15 bg-white/[0.04] p-1 transition-colors focus-within:border-brand-400">
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@company.com"
          className="min-w-0 flex-1 bg-transparent px-4 text-sm text-white outline-none placeholder:text-white/35"
        />
        <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
        <button
          type="submit"
          disabled={state === "loading"}
          className="flex size-10 items-center justify-center rounded-full bg-brand-400 text-ink-950 transition-colors hover:bg-brand-300 disabled:opacity-60"
          aria-label="Subscribe"
        >
          {state === "loading" ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
        </button>
      </div>
      {state === "error" && (
        <p className="mt-2 text-sm text-red-300" role="alert">
          {message}
        </p>
      )}
    </form>
  );
}
