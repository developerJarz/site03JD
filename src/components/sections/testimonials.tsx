import Image from "next/image";
import { Star } from "lucide-react";
import { Stagger, StaggerItem } from "@/components/animations";
import { initials } from "@/lib/utils";
import type { Testimonial } from "@/types/content";

/**
 * Client testimonials. Rendered only when published testimonials exist in
 * the CMS — the original site published none, so nothing is invented here.
 */
export function Testimonials({ items }: { items: Testimonial[] }) {
  if (!items.length) return null;
  return (
    <Stagger className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {items.map((t) => (
        <StaggerItem key={t._id} as="article" className="flex flex-col rounded-[28px] border border-mist-200 bg-white p-8">
          {t.rating ? (
            <p className="flex gap-0.5 text-brand-500" aria-label={`${t.rating} out of 5 stars`}>
              {Array.from({ length: t.rating }).map((_, i) => (
                <Star key={i} className="size-4 fill-current" aria-hidden />
              ))}
            </p>
          ) : null}
          <blockquote className="mt-6 flex-1 font-display text-xl leading-snug tracking-tight text-ink-900">“{t.quote}”</blockquote>
          <footer className="mt-8 flex items-center gap-3">
            {t.avatar ? (
              <Image src={t.avatar.src} alt="" width={44} height={44} className="size-11 rounded-full object-cover" />
            ) : (
              <span className="flex size-11 items-center justify-center rounded-full bg-mist-100 text-sm font-semibold text-mist-700" aria-hidden>
                {initials(t.author)}
              </span>
            )}
            <span>
              <span className="block text-sm font-semibold text-ink-900">{t.author}</span>
              <span className="block text-sm text-mist-500">{[t.role, t.company].filter(Boolean).join(", ")}</span>
            </span>
          </footer>
        </StaggerItem>
      ))}
    </Stagger>
  );
}
