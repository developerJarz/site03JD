import { WhatsappIcon } from "@/components/ui/brand-icons";
import { buttonClasses, type ButtonSize } from "@/components/ui/button";
import { publicUrl, whatsappLink, whatsappMessage } from "@/config/contact";
import { getSiteSettings } from "@/lib/data/public";
import { cn } from "@/lib/utils";

/**
 * Button that opens WhatsApp with a prefilled message naming what the visitor
 * wants and which page they were on, e.g.
 *   "Hi Jarz Digital! I'm interested in Local SEO (Growth plan).
 *    Sent from: Local SEO service page — https://www.jarzdigital.com/services/local-seo"
 * Plain HTML (no client JavaScript); click tracking is handled by <Analytics>.
 */
export async function WhatsAppButton({
  number,
  intent,
  from,
  path,
  children = "Chat on WhatsApp",
  size = "lg",
  tone = "green",
  showNumber,
  className,
}: {
  /** Defaults to the WhatsApp number in Settings. */
  number?: string;
  /** What the visitor wants, as a sentence: "I'm interested in Local SEO." */
  intent: string;
  /** Human label for the section/page, e.g. "Local SEO service page". */
  from: string;
  /** Page path, appended as a full URL so the team can open it. */
  path?: string;
  children?: React.ReactNode;
  size?: ButtonSize;
  tone?: "green" | "outline-light" | "outline";
  /** Show the number on the button — pass the number as it should be displayed. */
  showNumber?: boolean | string;
  className?: string;
}) {
  number ??= (await getSiteSettings()).contact.whatsapp;
  const href = whatsappLink(number, whatsappMessage({ intent, from: path ? `${from} — ${publicUrl(path)}` : from }));
  const toneClass =
    tone === "green"
      ? "bg-[#25D366] text-ink-950 hover:bg-[#1fbd59] shadow-[inset_0_1px_0_rgb(255_255_255/0.35)]"
      : tone === "outline-light"
        ? "border border-white/20 text-white hover:border-white hover:bg-white hover:text-ink-900"
        : "border border-mist-300 text-ink-900 hover:border-ink-900 hover:bg-ink-900 hover:text-white";
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cn(buttonClasses({ size, variant: "ghost" }), toneClass, className)}>
      <WhatsappIcon className="size-[1.15em] shrink-0" />
      <span>{children}</span>
      {showNumber && <span className="font-normal opacity-75">{typeof showNumber === "string" ? showNumber : number}</span>}
    </a>
  );
}
