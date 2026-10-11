import { WhatsappIcon } from "@/components/ui/brand-icons";
import { publicUrl, whatsappLink, whatsappMessage } from "@/config/contact";
import { cn } from "@/lib/utils";

/**
 * Small WhatsApp pill (green mark + "WhatsApp") shown where the site used to list
 * a phone number. Opens a chat with `number` and a message naming the page.
 * Plain markup, so it works in server and client components alike.
 */
export function WhatsAppPill({
  number,
  intent = "I’d like to talk to your team.",
  from,
  path,
  tone = "light",
  className,
}: {
  number: string;
  intent?: string;
  /** Human label for where the visitor clicked, e.g. "Footer — Dallas office". */
  from: string;
  path?: string;
  tone?: "light" | "dark";
  className?: string;
}) {
  const href = whatsappLink(number, whatsappMessage({ intent, from: path ? `${from} — ${publicUrl(path)}` : from }));
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center gap-2 rounded-full border py-1 pl-1 pr-3.5 text-sm font-medium transition-colors",
        tone === "dark"
          ? "border-white/15 bg-white/[0.04] text-white/85 hover:border-[#25D366] hover:bg-[#25D366]/15 hover:text-white"
          : "border-mist-200 bg-white text-ink-900 hover:border-[#25D366] hover:bg-[#25D366]/10",
        className,
      )}
    >
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-ink-950">
        <WhatsappIcon className="size-3.5" />
      </span>
      WhatsApp
    </a>
  );
}
