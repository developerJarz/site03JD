"use client";

import { usePathname } from "next/navigation";
import { WhatsappIcon } from "@/components/ui/brand-icons";
import { publicUrl, whatsappLink, whatsappMessage } from "@/config/contact";

/**
 * Floating WhatsApp button, bottom-right on every public page. The prefilled
 * message carries the page the visitor was on. Client-side only for the path;
 * no dependencies beyond the icon.
 */
export function WhatsAppFloat({ number }: { number: string }) {
  const pathname = usePathname();
  const href = whatsappLink(number, whatsappMessage({ intent: "I’d like to talk to your team about my project.", from: publicUrl(pathname) }));
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Chat with Jarz Digital on WhatsApp (${number})`}
      className="group fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-[65] flex h-14 items-center gap-0 rounded-full bg-[#25D366] pl-4 pr-4 text-ink-950 shadow-[0_18px_40px_-12px_rgb(0_0_0/0.45)] transition-[gap,padding,transform] duration-300 ease-[var(--ease-out-expo)] hover:-translate-y-0.5 hover:gap-2.5 hover:pr-5 focus-visible:gap-2.5 focus-visible:pr-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-900 md:right-6"
    >
      <WhatsappIcon className="size-6 shrink-0" />
      <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-semibold transition-[max-width] duration-300 ease-[var(--ease-out-expo)] group-hover:max-w-40 group-focus-visible:max-w-40">
        Chat on WhatsApp
      </span>
    </a>
  );
}
