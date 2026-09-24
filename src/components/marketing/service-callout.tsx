import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import type { Service } from "@/types/content";

/** “Need help with this?” box linking an article to the service it’s about. */
export function ServiceCallout({ service }: { service: Service }) {
  return (
    <aside aria-labelledby="service-callout" className="theme-dark mt-14 rounded-[28px] bg-ink-900 p-6 md:p-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-center">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-brand-300">
          <Icon name={service.icon} className="size-6" />
        </span>
        <div className="flex-1">
          <p className="eyebrow text-brand-300">Need help with this?</p>
          <h2 id="service-callout" className="mt-2 font-display text-xl font-semibold tracking-tight text-white">
            {service.title} by Jarz Digital
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-white/60">{service.tagline}</p>
        </div>
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <ButtonLink href={`/services/${service.slug}`} size="md" arrow>
          Explore {service.shortTitle}
        </ButtonLink>
        <ButtonLink href={`/contact?service=${service.slug}`} size="md" variant="outline-light">
          Get a free consultation
        </ButtonLink>
      </div>
    </aside>
  );
}
