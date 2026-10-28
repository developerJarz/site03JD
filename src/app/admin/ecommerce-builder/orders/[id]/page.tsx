import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Building2, Download, FilePen, Globe, Mail, MessageCircle, Phone, Receipt, Tag } from "lucide-react";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { AssigneeSelect, CreateInvoice, DeletePaymentButton, OrderNoteForm, OrderStatusPicker, PaymentForm, RotateLinkButton } from "@/components/admin/ecommerce-builder/controls";
import { Card, PageHeader } from "@/components/admin/ui";
import { QuoteBreakdownView } from "@/components/ecommerce-builder/quote-breakdown";
import { Badge } from "@/components/ui/badge";
import { ButtonLink, buttonClasses } from "@/components/ui/button";
import { whatsappLink } from "@/config/contact";
import { deleteBuilderOrderAction, voidBuilderInvoiceAction } from "@/lib/actions/ecommerce-builder-admin";
import { can } from "@/lib/auth/permissions";
import { requirePermission } from "@/lib/auth/session";
import { connectDB } from "@/lib/db/connect";
import { CONFIRMED_STATUSES, PAYMENT_STATUS_META, paymentStatus, type OrderStatus } from "@/lib/ecommerce-builder/constants";
import { formatMoney } from "@/lib/ecommerce-builder/pricing";
import type { QuoteBreakdown } from "@/lib/ecommerce-builder/types";
import { formatDate, formatDateTime, timeAgo } from "@/lib/utils";
import { BuilderInvoice, BuilderOrder, BuilderQuote } from "@/models/builder";
import { User } from "@/models/User";

export const metadata: Metadata = { title: "E-commerce order" };

export default async function BuilderOrderPage({ params }: PageProps<"/admin/ecommerce-builder/orders/[id]">) {
  const user = await requirePermission("builder:orders");
  const canBilling = can(user.role, "billing:manage");
  const { id } = await params;
  if (!/^[a-f0-9]{24}$/.test(id)) notFound();
  await connectDB();
  const order = await BuilderOrder.findById(id).lean();
  if (!order) notFound();
  const [quote, invoices, staff] = await Promise.all([
    BuilderQuote.findById(order.quote).select("number validUntil pricebookVersion createdAt").lean(),
    BuilderInvoice.find({ order: order._id }).sort({ createdAt: -1 }).lean(),
    User.find({ role: { $in: ["ADMIN", "EDITOR"] }, status: "active" }).select("name").sort({ name: 1 }).lean(),
  ]);
  const b = order.breakdown as QuoteBreakdown;
  const c = order.customer;
  const currency = order.currency ?? "USD";
  const paid = order.amountPaid ?? 0;
  const pay = paymentStatus(order.total, paid);
  const activeInvoice = invoices.some((i) => i.status === "issued");
  const canInvoice = CONFIRMED_STATUSES.includes(order.status as OrderStatus) && !activeInvoice;
  const waDigits = c.phone?.replace(/[^\d+]/g, "") ?? "";

  const facts = [
    { Icon: Mail, label: "Email", value: <a href={`mailto:${c.email}`} className="text-brand-700 hover:underline">{c.email}</a> },
    { Icon: Phone, label: "Phone / WhatsApp", value: <a href={`tel:${waDigits}`} className="text-brand-700 hover:underline">{c.phone}</a> },
    c.businessName && { Icon: Building2, label: "Business", value: c.businessName },
    c.businessCategory && { Icon: Tag, label: "Category", value: c.businessCategory },
    c.domain && { Icon: Globe, label: "Website / domain", value: c.domain },
    { Icon: MessageCircle, label: "Preferred contact", value: c.contactMethod },
  ].filter(Boolean) as { Icon: typeof Mail; label: string; value: React.ReactNode }[];

  return (
    <>
      <PageHeader
        title={`${order.number} · ${c.businessName || c.name}`}
        description={`Submitted ${formatDateTime(order.createdAt)} · quotation ${order.quoteNumber} · pricebook v${order.pricebookVersion}`}
        crumbs={[{ label: "Dashboard", href: "/admin" }, { label: "E-commerce Builder", href: "/admin/ecommerce-builder" }, { label: "Orders", href: "/admin/ecommerce-builder/orders" }, { label: order.number }]}
        actions={
          <>
            {waDigits && (
              <ButtonLink href={whatsappLink(waDigits, `Hi ${(c.name ?? "").split(" ")[0]}, this is Jarz Digital about your e-commerce website request ${order.number}.`)} target="_blank" variant="outline" size="sm">
                WhatsApp
              </ButtonLink>
            )}
            <ButtonLink href={`mailto:${c.email}?subject=${encodeURIComponent(`Your e-commerce website request ${order.number}`)}`} variant="dark" size="sm">
              <Mail className="size-4" aria-hidden /> Email customer
            </ButtonLink>
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <Card title="Order status">
            <OrderStatusPicker id={id} value={order.status} />
            {order.statusHistory.length > 0 && (
              <ol className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-mist-500">
                {order.statusHistory.slice(-6).map((h, i) => (
                  <li key={i}>
                    {h.status?.replace(/_/g, " ")} · {h.byName} · {timeAgo(h.at)}
                  </li>
                ))}
              </ol>
            )}
          </Card>

          <Card title="Saved price snapshot" action={<span className="text-xs text-mist-500">Prices as quoted — later catalog changes don’t affect this order</span>}>
            <QuoteBreakdownView breakdown={b} />
          </Card>

          {b.customDesign && (
            <Card title="Custom design request">
              <dl className="grid gap-4 text-sm sm:grid-cols-[180px_minmax(0,1fr)]">
                <div>
                  <dt className="text-xs text-mist-500">Store type</dt>
                  <dd className="font-medium text-ink-900">{b.customDesign.storeTypeLabel}</dd>
                </div>
                <div className="min-w-0">
                  <dt className="text-xs text-mist-500">Design it like</dt>
                  <dd>
                    <a href={b.customDesign.referenceUrl} target="_blank" rel="noopener noreferrer nofollow" className="break-all text-brand-700 hover:underline">
                      {b.customDesign.referenceUrl}
                    </a>
                  </dd>
                </div>
              </dl>
            </Card>
          )}

          {c.requirements && (
            <Card title="Customer requirements">
              <p className="whitespace-pre-wrap leading-relaxed text-ink-800">{c.requirements}</p>
            </Card>
          )}

          <Card title="Internal notes">
            <OrderNoteForm id={id} />
            {order.notes.length > 0 && (
              <ol className="mt-6 space-y-4 border-l border-mist-200 pl-5">
                {[...order.notes].reverse().map((n) => (
                  <li key={String(n._id)} className="relative">
                    <span aria-hidden className="absolute -left-[25px] top-1.5 size-2 rounded-full bg-brand-500 ring-4 ring-white" />
                    <p className="text-xs text-mist-500">
                      <span className="font-medium text-ink-900">{n.authorName}</span> · {timeAgo(n.createdAt)}
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-mist-700">{n.body}</p>
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Customer">
            <dl className="space-y-4">
              {facts.map(({ Icon, label, value }) => (
                <div key={label} className="flex gap-3">
                  <Icon className="mt-0.5 size-4 shrink-0 text-mist-400" aria-hidden />
                  <div className="min-w-0">
                    <dt className="text-xs text-mist-500">{label}</dt>
                    <dd className="break-words text-sm text-ink-900">{value}</dd>
                  </div>
                </div>
              ))}
            </dl>
            <p className="mt-5 text-xs text-mist-500">Terms accepted {formatDateTime(order.termsAcceptedAt)}</p>
          </Card>

          <Card title="Assigned to">
            <AssigneeSelect id={id} value={order.assignee ? String(order.assignee) : ""} staff={staff.map((s) => ({ id: String(s._id), name: s.name }))} />
          </Card>

          <Card title="Quotation">
            <p className="text-sm text-mist-700">
              <span className="font-medium text-ink-900">{order.quoteNumber}</span>
              {quote && <> · valid until {formatDate(quote.validUntil)}</>}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {quote && (
                <a href={`/api/admin/ecommerce-builder/quotes/${quote._id}/pdf?download`} className={buttonClasses({ variant: "outline", size: "sm" })}>
                  <Download className="size-4" aria-hidden /> Quotation PDF
                </a>
              )}
              {quote && <RotateLinkButton kind="quote" id={String(quote._id)} />}
            </div>
          </Card>

          {canBilling && (
            <Card title="Quotations & invoices studio">
              <p className="text-sm text-mist-600">Turn this order into a fully editable branded quotation or invoice — edit lines, prices, scope and terms before downloading the PDF.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <ButtonLink href={`/admin/billing?fromOrder=${id}&as=quotation`} variant="dark" size="sm">
                  <FilePen className="size-4" aria-hidden /> Editable quotation
                </ButtonLink>
                <ButtonLink href={`/admin/billing?fromOrder=${id}&as=invoice`} variant="outline" size="sm">
                  <Receipt className="size-4" aria-hidden /> Quotation + invoice
                </ButtonLink>
              </div>
            </Card>
          )}

          <Card title="Payments" action={<Badge tone={PAYMENT_STATUS_META[pay].tone} dot>{PAYMENT_STATUS_META[pay].label}</Badge>}>
            <dl className="grid grid-cols-3 gap-2 text-center text-sm">
              <div className="rounded-xl bg-mist-50 p-3">
                <dt className="text-xs text-mist-500">Total</dt>
                <dd className="font-medium tabular-nums text-ink-900">{formatMoney(order.total, currency)}</dd>
              </div>
              <div className="rounded-xl bg-mist-50 p-3">
                <dt className="text-xs text-mist-500">Recorded</dt>
                <dd className="font-medium tabular-nums text-ink-900">{formatMoney(paid, currency)}</dd>
              </div>
              <div className="rounded-xl bg-mist-50 p-3">
                <dt className="text-xs text-mist-500">Balance</dt>
                <dd className="font-medium tabular-nums text-ink-900">{formatMoney(Math.max(0, order.total - paid), currency)}</dd>
              </div>
            </dl>
            {b.custom.length > 0 && <p className="mt-3 text-xs text-amber-800">This order includes {b.custom.length} custom-quote item(s) not in the total.</p>}
            {order.payments.length > 0 && (
              <ul className="mt-4 divide-y divide-mist-100 text-sm">
                {order.payments.map((p) => (
                  <li key={String(p._id)} className="flex items-start justify-between gap-3 py-2.5">
                    <span className="min-w-0">
                      <span className="font-medium text-ink-900">{formatMoney(p.amount, currency)}</span> <span className="text-mist-600">via {p.method}</span>
                      <span className="block text-xs text-mist-500">
                        {formatDate(p.receivedAt)}
                        {p.reference && ` · ${p.reference}`} · recorded by {p.recordedByName}
                      </span>
                      {p.note && <span className="block text-xs text-mist-500">{p.note}</span>}
                    </span>
                    <DeletePaymentButton id={id} paymentId={String(p._id)} />
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-5 border-t border-mist-100 pt-5">
              <PaymentForm id={id} currency={currency} balance={Math.max(0, order.total - paid)} />
            </div>
          </Card>

          <Card title="Invoices">
            {invoices.length > 0 && (
              <ul className="mb-5 space-y-3 text-sm">
                {invoices.map((inv) => (
                  <li key={String(inv._id)} className="rounded-xl border border-mist-200 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-ink-900">{inv.number}</span>
                      <Badge tone={inv.status === "void" ? "neutral" : "info"} dot>
                        {inv.status === "void" ? "Void" : "Issued"}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-mist-500">
                      {formatDate(inv.issuedAt)} · due {inv.dueAt ? formatDate(inv.dueAt) : "—"} · {formatMoney(inv.total, inv.currency ?? currency)}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <a href={`/api/admin/ecommerce-builder/invoices/${inv._id}/pdf?download`} className={buttonClasses({ variant: "outline", size: "sm" })}>
                        <Download className="size-4" aria-hidden /> PDF
                      </a>
                      {inv.status === "issued" && (
                        <>
                          <RotateLinkButton kind="invoice" id={String(inv._id)} />
                          <ConfirmButton action={voidBuilderInvoiceAction.bind(null, String(inv._id))} title={`Void invoice ${inv.number}?`} description="The customer link stops working. You can issue a new invoice afterwards." confirmLabel="Void invoice">
                            Void
                          </ConfirmButton>
                        </>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <CreateInvoice orderId={id} allowed={canInvoice} />
          </Card>

          <section className="rounded-2xl border border-red-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-ink-900">Danger zone</h2>
            <p className="mt-1 text-sm text-mist-500">Delete spam or test orders. Prefer “Cancelled” for real customers.</p>
            <ConfirmButton action={deleteBuilderOrderAction.bind(null, id)} title={`Delete order ${order.number}?`} description="The order, notes and payment records are permanently removed. The quotation is kept." confirmLabel="Delete order" redirectTo="/admin/ecommerce-builder/orders" className="mt-4 border-red-200 text-danger-500 hover:border-danger-500 hover:bg-danger-500 hover:text-white">
              Delete order
            </ConfirmButton>
          </section>
        </div>
      </div>
    </>
  );
}
