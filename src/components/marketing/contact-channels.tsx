import Link from "next/link";
import { ArrowUpRight, Send, ShoppingBag } from "lucide-react";
import { FacebookIcon, WhatsappIcon } from "@/components/ui/brand-icons";
import { publicUrl, whatsappDisplay, whatsappLink, whatsappMessage } from "@/config/contact";
import { cn } from "@/lib/utils";
import type { SiteSettings } from "@/types/content";

/**
 * "Order | Send request | Facebook | WhatsApp" — the four ways to start, as
 * one row of cards. Facebook appears only when a page is set in Settings.
 */
export function ContactChannels({ settings, from, path, tone = "light" }: { settings: Pick<SiteSettings, "contact" | "socials">; from: string; path: string; tone?: "light" | "dark" }) {
  const { contact, socials } = settings;
  const channels = [
    {
      key: "order",
      Icon: ShoppingBag,
      title: "Order",
      text: "Pick a plan for any service and order it in a few clicks.",
      cta: "See plans & prices",
      href: "/pricing",
      accent: "bg-brand-500/15 text-brand-700",
    },
    {
      key: "request",
      Icon: Send,
      title: "Send request",
      text: "Tell us about your project in the form — we reply within 24 hours.",
      cta: "Open the form",
      href: "#contact-form",
      accent: "bg-azure-500/10 text-azure-600",
    },
    ...(socials.facebook
      ? [{ key: "facebook", Icon: FacebookIcon, title: "Facebook", text: "Follow our work or send us a message on Facebook.", cta: "Visit our page", href: socials.facebook, accent: "bg-[#1877F2]/10 text-[#1877F2]" }]
      : []),
    {
      key: "whatsapp",
      Icon: WhatsappIcon,
      title: "WhatsApp",
      text: `Chat with the team directly on ${whatsappDisplay(contact)}.`,
      cta: "Start a chat",
      href: whatsappLink(contact.whatsapp, whatsappMessage({ intent: "I’d like to talk about a project.", from: `${from} — ${publicUrl(path)}` })),
      accent: "bg-[#25D366]/15 text-[#128C4B]",
    },
  ];
  const dark = tone === "dark";

  return (
    <ul className={cn("grid gap-4 sm:grid-cols-2", channels.length === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3")}>
      {channels.map(({ key, Icon, title, text, cta, href, accent }) => {
        const external = href.startsWith("http");
        const cls = cn(
          "group flex h-full flex-col rounded-3xl border p-6 transition-all duration-500 hover:-translate-y-1",
          dark ? "border-white/10 bg-white/[0.04] hover:border-white/30" : "border-mist-200 bg-white hover:border-ink-900 hover:shadow-lift",
        );
        const inner = (
          <>
            <span className={cn("flex size-12 items-center justify-center rounded-2xl", accent)}>
              <Icon className="size-5" aria-hidden />
            </span>
            <span className={cn("mt-6 font-display text-xl font-semibold tracking-tight", dark ? "text-white" : "text-ink-900")}>{title}</span>
            <span className={cn("mt-1.5 flex-1 text-sm leading-relaxed", dark ? "text-white/65" : "text-mist-600")}>{text}</span>
            <span className={cn("mt-5 inline-flex items-center gap-1 text-sm font-medium", dark ? "text-brand-300" : "text-ink-900")}>
              {cta} <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
            </span>
          </>
        );
        return (
          <li key={key}>
            {external ? (
              <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
                {inner}
              </a>
            ) : (
              <Link href={href} className={cls}>
                {inner}
              </Link>
            )}
          </li>
        );
      })}
    </ul>
  );
}
