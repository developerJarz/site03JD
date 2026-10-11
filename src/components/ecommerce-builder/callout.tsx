import { ShoppingBag } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { BUILDER_PATH } from "@/lib/ecommerce-builder/constants";
import { formatMoney } from "@/lib/ecommerce-builder/pricing";
import { getPublishedPricebook } from "@/lib/ecommerce-builder/server";

/** Internal link from related service pages to the e-commerce builder. */
export async function BuilderCallout() {
  const pb = await getPublishedPricebook();
  const from = pb.templates.length ? Math.min(...pb.templates.map((t) => t.price)) : null;
  return (
    <aside aria-labelledby="builder-callout" className="theme-dark rounded-[28px] bg-ink-900 p-6 md:flex md:items-center md:gap-8 md:p-10">
      <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-brand-300">
        <ShoppingBag className="size-7" aria-hidden />
      </span>
      <div className="mt-5 flex-1 md:mt-0">
        <p className="eyebrow text-brand-300">Selling online?</p>
        <h2 id="builder-callout" className="mt-2 font-display text-2xl font-semibold tracking-tight text-white">
          E-commerce website development{from !== null ? ` from ${formatMoney(from, pb.currency)}` : ""}
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/65">Choose a store design, add the admin dashboard features you need and see your price instantly with our e-commerce website builder.</p>
      </div>
      <ButtonLink href={BUILDER_PATH} size="md" arrow className="mt-6 shrink-0 md:mt-0">
        Build your store
      </ButtonLink>
    </aside>
  );
}
