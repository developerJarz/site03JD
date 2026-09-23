import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Building2, Calendar, Globe, Mail, MessageSquare, Phone, Wallet } from "lucide-react";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { NoteForm, StatusPicker } from "@/components/admin/ops-controls";
import { Card, PageHeader } from "@/components/admin/ui";
import { ButtonLink } from "@/components/ui/button";
import { deleteLeadAction } from "@/lib/actions/admin";
import { requirePermission } from "@/lib/auth/session";
import { connectDB } from "@/lib/db/connect";
import { formatDateTime, timeAgo } from "@/lib/utils";
import { Lead } from "@/models/operations";

export const metadata: Metadata = { title: "Lead" };

export default async function LeadDetailPage({ params }: PageProps<"/admin/leads/[id]">) {
  await requirePermission("leads:manage");
  const { id } = await params;
  if (!/^[a-f0-9]{24}$/.test(id)) notFound();
  await connectDB();
  const lead = await Lead.findById(id).lean();
  if (!lead) notFound();

  const facts = [
    { Icon: Mail, label: "Email", value: <a href={`mailto:${lead.email}`} className="text-brand-700 hover:underline">{lead.email}</a> },
    lead.phone && { Icon: Phone, label: "Phone", value: <a href={`tel:${lead.phone}`} className="text-brand-700 hover:underline">{lead.phone}</a> },
    lead.company && { Icon: Building2, label: "Company", value: lead.company },
    lead.budget && { Icon: Wallet, label: "Budget", value: lead.budget },
    lead.timeline && { Icon: Calendar, label: "Timeline", value: lead.timeline },
    { Icon: Globe, label: "Source", value: `${lead.source ?? "contact-form"}${lead.pagePath ? ` (${lead.pagePath})` : ""}` },
  ].filter(Boolean) as { Icon: typeof Mail; label: string; value: React.ReactNode }[];

  return (
    <>
      <PageHeader
        title={lead.name}
        description={`Received ${formatDateTime(lead.createdAt)}`}
        crumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Leads", href: "/admin/leads" }, { label: lead.name }]}
        actions={
          <>
            <ButtonLink href={`mailto:${lead.email}?subject=${encodeURIComponent("Re: your inquiry to Jarz Digital")}`} variant="dark" size="sm">
              <Mail className="size-4" aria-hidden /> Reply by email
            </ButtonLink>
            <ConfirmButton action={deleteLeadAction.bind(null, id)} title="Delete this lead?" description="The lead and its notes will be permanently removed." confirmLabel="Delete lead" redirectTo="/admin/leads">
              Delete
            </ConfirmButton>
          </>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <Card title="Pipeline status">
            <StatusPicker id={id} value={lead.status} kind="lead" />
          </Card>
          <Card title={lead.serviceName ? `Inquiry — ${lead.serviceName}` : "Inquiry"}>
            {lead.projectType && <p className="mb-3 text-sm text-mist-500">Project type: {lead.projectType}</p>}
            <p className="whitespace-pre-wrap leading-relaxed text-ink-800">{lead.message}</p>
          </Card>
          <Card title="Internal notes">
            <NoteForm id={id} />
            {lead.notes.length > 0 && (
              <ol className="mt-6 space-y-4 border-l border-mist-200 pl-5">
                {[...lead.notes].reverse().map((n) => (
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
        <Card title="Contact details">
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
          {lead.user && (
            <p className="mt-6 flex items-center gap-2 rounded-xl bg-mist-50 px-3 py-2 text-xs text-mist-600">
              <MessageSquare className="size-3.5" aria-hidden /> Submitted while signed in to a client account.
            </p>
          )}
        </Card>
      </div>
    </>
  );
}
