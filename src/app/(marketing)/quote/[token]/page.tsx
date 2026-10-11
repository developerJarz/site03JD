import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarClock, CheckCircle2, Download, FileText } from "lucide-react";
import { QuoteBreakdownView } from "@/components/ecommerce-builder/quote-breakdown";
import { WhatsAppButton } from "@/components/marketing/whatsapp";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { isDbConfigured } from "@/lib/db/connect";
import { BUILDER_PATH } from "@/lib/ecommerce-builder/constants";
import { findQuoteByToken } from "@/lib/ecommerce-builder/quotes";
import type { QuoteBreakdown } from "@/lib/ecommerce-builder/types";
import { BuilderOrder } from "@/models/builder";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your quotation",
  robots: { index: false, follow: false, nocache: true },
  referrer: "no-referrer",
};

const longDate = (d: Date | string) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

/** Private quotation view. Anyone with the secret link can see it; nobody else. */
export default async function QuotePage({ params }: PageProps<"/quote/[token]">) {
  const { token } = await params;
  if (!isDbConfigured) notFound();
  const quote = await findQuoteByToken(token);
  if (!quote) notFound();
  const b = quote.breakdown as QuoteBreakdown;
  const expired = new Date(quote.validUntil) < new Date();
  const order = quote.order ? await BuilderOrder.findById(quote.order).select("number").lean() : null;
  const c = quote.customer;

  return (
    <>
      {/* Dark header band — the transparent site header expects a dark hero */}
      <section className="theme-dark relative overflow-hidden bg-ink-950 pb-14 pt-36 md:pt-40">
        <div aria-hidden className="absolute inset-0 bg-grid opacity-60 mask-fade-b" />
        <div className="container-page relative max-w-4xl">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="eyebrow flex items-center gap-3 text-brand-300">
                <span aria-hidden className="h-px w-6 bg-current opacity-60" />
                Quotation · Estimate
              </p>
              <h1 className="mt-4 font-display text-display-sm font-semibold tracking-display text-white">{quote.number}</h1>
              <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/65">
                <span className="flex items-center gap-1.5">
                  <FileText className="size-4" aria-hidden /> Issued {longDate(quote.createdAt)}
                </span>
                <span className="flex items-center gap-1.5">
                  <CalendarClock className="size-4" aria-hidden /> {expired ? "Expired" : "Valid until"} {longDate(quote.validUntil)}
                </span>
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <a href={`/quote/${token}/pdf?download`} className="inline-flex h-11 items-center gap-2 rounded-full bg-brand-400 px-5 text-sm font-medium text-ink-950 hover:bg-brand-300">
                <Download className="size-4" aria-hidden /> Download PDF
              </a>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {order ? (
              <Badge tone="success" dot>
                Order {order.number} submitted
              </Badge>
            ) : expired ? (
              <Badge tone="warning" dot>
                Expired — prices may have changed
              </Badge>
            ) : (
              <Badge tone="info" dot>
                Valid estimate
              </Badge>
            )}
            <Badge tone="neutral">Not an invoice · No payment taken</Badge>
          </div>
        </div>
      </section>

      <div className="bg-mist-50 pb-24 pt-10">
        <div className="container-page max-w-4xl">
          <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_280px]">
            <section aria-label="Quotation items" className="rounded-[28px] border border-mist-200 bg-white p-5 sm:p-8">
              <QuoteBreakdownView breakdown={b} />
            </section>
            <aside className="space-y-6">
              <div className="rounded-[28px] border border-mist-200 bg-white p-6 text-sm">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-mist-500">Prepared for</h2>
                {c?.name ? (
                  <dl className="mt-3 space-y-1 text-mist-700">
                    {c.businessName && <dd className="font-medium text-ink-900">{c.businessName}</dd>}
                    <dd>{c.name}</dd>
                    {c.email && <dd className="break-words">{c.email}</dd>}
                    {c.phone && <dd>{c.phone}</dd>}
                    {c.domain && <dd>{c.domain}</dd>}
                  </dl>
                ) : (
                  <p className="mt-3 text-mist-600">Contact details are added when you submit your project request.</p>
                )}
              </div>
              <div className="rounded-[28px] border border-mist-200 bg-white p-6 text-sm">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-mist-500">Next step</h2>
                {order ? (
                  <p className="mt-3 flex items-start gap-2 text-mist-700">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green-600" aria-hidden /> We have your request and will contact you to confirm scope, timeline and price.
                  </p>
                ) : (
                  <>
                    <p className="mt-3 text-mist-700">Ready to go ahead? Submit your request from the builder, or message us with your quotation number.</p>
                    <div className="mt-4 grid gap-2">
                      <ButtonLink href={`${BUILDER_PATH}#order`} size="md" variant="dark">
                        Continue in the builder
                      </ButtonLink>
                      <WhatsAppButton size="md" intent={`I have a question about my e-commerce quotation ${quote.number}.`} from="E-commerce quotation page" path={BUILDER_PATH}>
                        Ask on WhatsApp
                      </WhatsAppButton>
                    </div>
                  </>
                )}
              </div>
            </aside>
          </div>

          {(quote.terms?.paymentTerms || quote.terms?.disclaimer) && (
            <section aria-label="Terms" className="mt-6 space-y-4 rounded-[28px] border border-mist-200 bg-white p-6 text-sm leading-relaxed text-mist-600 sm:p-8">
              {quote.terms?.paymentTerms && (
                <div>
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-mist-500">Payment terms</h2>
                  <p className="mt-2 whitespace-pre-line">{quote.terms.paymentTerms}</p>
                </div>
              )}
              {quote.terms?.disclaimer && (
                <div>
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-mist-500">Project scope</h2>
                  <p className="mt-2 whitespace-pre-line">{quote.terms.disclaimer}</p>
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    </>
  );
}
