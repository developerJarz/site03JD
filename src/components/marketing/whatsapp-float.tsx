"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, X } from "lucide-react";
import { FacebookIcon, WhatsappIcon } from "@/components/ui/brand-icons";
import { publicUrl, whatsappForPath, whatsappLink, whatsappMessage } from "@/config/contact";
import { cn } from "@/lib/utils";

const FACEBOOK_URL = "https://www.facebook.com/people/Jarz-Digital/61563196033794/";

/**
 * Floating chat button with multi-channel support (WhatsApp & Facebook).
 * On hover (desktop) or tap (mobile), reveals direct chat buttons for WhatsApp and Facebook.
 */
export function WhatsAppFloat({ number: main, intlPaths }: { number: string; intlPaths: string[] }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const number = whatsappForPath(pathname, main, intlPaths);
  const waHref = whatsappLink(
    number,
    whatsappMessage({
      intent: "I’d like to talk to your team about my project.",
      from: publicUrl(pathname),
    }),
  );

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [open]);

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      className="group fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-[65] flex flex-col items-end md:right-6"
    >
      {/* Pop-up channel buttons */}
      <div
        className={cn(
          "mb-3 flex flex-col items-end gap-2.5 transition-all duration-300 ease-[var(--ease-out-expo)]",
          open
            ? "pointer-events-auto translate-y-0 opacity-100 scale-100"
            : "pointer-events-none translate-y-3 opacity-0 scale-95",
        )}
      >
        {/* Facebook button */}
        <a
          href={FACEBOOK_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with Jarz Digital on Facebook"
          className="flex h-12 items-center gap-3 rounded-full bg-[#1877F2] pl-2.5 pr-4 text-white shadow-[0_12px_28px_-6px_rgba(24,119,242,0.5)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#166fe5] hover:shadow-[0_16px_32px_-4px_rgba(24,119,242,0.65)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1877F2]"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white text-[#1877F2] shadow-sm">
            <FacebookIcon className="size-4.5" />
          </span>
          <span className="whitespace-nowrap text-sm font-semibold tracking-tight">Facebook</span>
        </a>

        {/* WhatsApp button */}
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Chat with Jarz Digital on WhatsApp (${number})`}
          className="flex h-12 items-center gap-3 rounded-full bg-[#25D366] pl-2.5 pr-4 text-ink-950 shadow-[0_12px_28px_-6px_rgba(37,211,102,0.5)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#20bd5a] hover:shadow-[0_16px_32px_-4px_rgba(37,211,102,0.65)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366]"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white text-[#25D366] shadow-sm">
            <WhatsappIcon className="size-5" />
          </span>
          <span className="whitespace-nowrap text-sm font-semibold tracking-tight">WhatsApp</span>
        </a>
      </div>

      {/* Main floating Chat trigger button */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={open ? "Close chat channels" : "Open chat options (WhatsApp & Facebook)"}
        aria-expanded={open}
        className={cn(
          "relative flex size-14 items-center justify-center rounded-full shadow-[0_16px_36px_-8px_rgba(0,175,185,0.6)] transition-all duration-300 hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500",
          open
            ? "bg-ink-900 text-white shadow-lift"
            : "bg-gradient-to-tr from-brand-600 via-brand-500 to-brand-400 text-ink-950 hover:shadow-[0_20px_42px_-6px_rgba(0,175,185,0.75)]",
        )}
      >
        {/* Pulsing online status indicator when closed */}
        {!open && (
          <span className="absolute right-0.5 top-0.5 flex size-3.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-3.5 rounded-full border-2 border-white bg-emerald-500 shadow-sm" />
          </span>
        )}

        {open ? (
          <X className="size-6 transition-transform duration-200 animate-in spin-in-90" strokeWidth={2.5} />
        ) : (
          <MessageCircle className="size-6.5 transition-transform duration-200" strokeWidth={2.2} />
        )}
      </button>
    </div>
  );
}
