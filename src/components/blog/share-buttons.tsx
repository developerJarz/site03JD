"use client";

import { Check, Link2, Mail } from "lucide-react";
import { useState } from "react";
import { FacebookIcon, LinkedinIcon, XIcon } from "@/components/ui/brand-icons";

export function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  const links = [
    { label: "Share on LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`, Icon: LinkedinIcon },
    { label: "Share on X", href: `https://twitter.com/intent/tweet?url=${u}&text=${t}`, Icon: XIcon },
    { label: "Share on Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${u}`, Icon: FacebookIcon },
  ];
  const btn = "flex size-10 items-center justify-center rounded-full border border-mist-200 text-mist-600 transition-colors hover:border-ink-900 hover:text-ink-900";

  return (
    <div className="flex flex-wrap items-center gap-2">
      {links.map(({ label, href, Icon }) => (
        <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className={btn}>
          <Icon className="size-4" />
        </a>
      ))}
      <a href={`mailto:?subject=${t}&body=${u}`} aria-label="Share by email" className={btn}>
        <Mail className="size-4" aria-hidden />
      </a>
      <button
        type="button"
        className={btn}
        aria-label={copied ? "Link copied" : "Copy link"}
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          } catch {
            /* clipboard unavailable */
          }
        }}
      >
        {copied ? <Check className="size-4 text-success-500" aria-hidden /> : <Link2 className="size-4" aria-hidden />}
      </button>
    </div>
  );
}
