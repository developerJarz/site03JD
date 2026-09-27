import Link from "next/link";
import { Check } from "lucide-react";
import { WhatsAppButton } from "@/components/marketing/whatsapp";
import { cn } from "@/lib/utils";
import type { PricingPlan } from "@/types/content";

/**
 * Plan cards. "Get started" opens WhatsApp with the plan, price and service
 * already written; "or send a request" keeps the contact form.
 */
export async function PricingPlans({ plans, serviceSlug, serviceTitle, note, from, path }: { plans: PricingPlan[]; serviceSlug: string; serviceTitle: string; note?: string; from: string; path: string }) {
  if (!plans.length) return null;
  const cols = plans.length === 1 ? "max-w-xl" : plans.length === 2 ? "md:grid-cols-2 max-w-4xl" : "lg:grid-cols-3";
  return (
    <div>
      <div className={cn("mx-auto grid gap-5", cols)}>
        {plans.map((plan) => (
          <article
            key={plan.name}
            className={cn(
              "relative flex flex-col rounded-[28px] border p-8",
              plan.highlighted ? "theme-dark border-transparent bg-ink-900 shadow-lift" : "border-mist-200 bg-white",
            )}
          >
            {plan.highlighted && (
              <span className="absolute -top-3 left-8 rounded-full bg-brand-400 px-3 py-1 text-xs font-semibold text-ink-950">{plans.length > 1 ? "Most popular" : "Recommended"}</span>
            )}
            <h3 className={cn("font-display text-xl font-semibold tracking-tight", plan.highlighted ? "text-white" : "text-ink-900")}>{plan.name}</h3>
            {plan.audience && <p className={cn("mt-1 text-sm", plan.highlighted ? "text-white/55" : "text-mist-500")}>{plan.audience}</p>}
            <p className="mt-6 flex items-baseline gap-1.5">
              <span className={cn("font-display text-5xl font-semibold tracking-tight", plan.highlighted ? "text-white" : "text-ink-900")}>{plan.price}</span>
              {plan.period && <span className={cn("text-sm", plan.highlighted ? "text-white/55" : "text-mist-500")}>{plan.period}</span>}
            </p>
            {plan.description && <p className={cn("mt-4 text-sm leading-relaxed", plan.highlighted ? "text-white/65" : "text-mist-600")}>{plan.description}</p>}
            <ul className={cn("mt-7 flex-1 space-y-3 border-t pt-7", plan.highlighted ? "border-white/10" : "border-mist-100")}>
              {plan.features.map((f) => (
                <li key={f} className={cn("flex items-start gap-3 text-sm", plan.highlighted ? "text-white/80" : "text-mist-700")}>
                  <Check className={cn("mt-0.5 size-4 shrink-0", plan.highlighted ? "text-brand-300" : "text-brand-600")} aria-hidden />
                  {f}
                </li>
              ))}
            </ul>
            <WhatsAppButton
              size="md"
              tone={plan.highlighted ? "green" : "outline"}
              className="mt-8 w-full"
              intent={`I’d like to order the ${plan.name} plan (${plan.price}${plan.period ? ` ${plan.period}` : ""}) for ${serviceTitle}.`}
              from={from}
              path={path}
            >
              Get started
            </WhatsAppButton>
            <Link
              href={`/contact?service=${serviceSlug}&plan=${encodeURIComponent(plan.name)}#contact-form`}
              className={cn("mt-3 text-center text-sm underline-offset-4 hover:underline", plan.highlighted ? "text-white/65" : "text-mist-600")}
            >
              or send a request
            </Link>
          </article>
        ))}
      </div>
      {note && <p className="mx-auto mt-8 max-w-2xl text-center text-sm text-mist-500">{note}</p>}
    </div>
  );
}
