/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ExternalLink, Pencil, Plus } from "lucide-react";
import { ListToolbar } from "@/components/admin/list-toolbar";
import { PublishToggle } from "@/components/admin/publish-toggle";
import { EmptyState, PageHeader, Pagination, Table, td, th } from "@/components/admin/ui";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { requirePermission } from "@/lib/auth/session";
import { RESOURCES, isResourceKey } from "@/lib/cms/resources";
import { getPath, listResource, publicUrl } from "@/lib/cms/server";
import type { ColumnDef, ResourceDef } from "@/lib/cms/types";
import { isDbConfigured } from "@/lib/db/connect";
import { formatDate } from "@/lib/utils";

export async function generateMetadata({ params }: PageProps<"/admin/[resource]">): Promise<Metadata> {
  const { resource } = await params;
  return { title: isResourceKey(resource) ? RESOURCES[resource].label : "Not found" };
}

function Cell({ col, row, def }: { col: ColumnDef; row: Record<string, any>; def: ResourceDef }) {
  const v = getPath(row, col.key);
  switch (col.type) {
    case "title":
      return (
        <Link href={`/admin/${def.key}/${row._id}`} className="font-medium text-ink-900 hover:text-brand-700">
          {String(v ?? "Untitled")}
          {row.slug && <span className="block text-xs font-normal text-mist-500">/{row.slug}</span>}
        </Link>
      );
    case "image":
      return v?.src ? (
        <span className="relative block size-11 overflow-hidden rounded-lg bg-mist-100">
          <Image src={v.src} alt="" fill sizes="44px" className="object-cover" />
        </span>
      ) : (
        <span className="block size-11 rounded-lg bg-mist-100" />
      );
    case "status":
      return def.publish ? <PublishToggle resource={def.key} id={row._id} live={v === def.publish.live} /> : null;
    case "date":
      return <span className="whitespace-nowrap text-mist-600">{formatDate(v)}</span>;
    case "relation":
      return <span className="text-mist-700">{v?.name ?? v?.title ?? "—"}</span>;
    case "boolean":
      return v ? <Badge tone={col.key === "needsReview" ? "warning" : "brand"}>{col.key === "needsReview" ? "Review" : "Yes"}</Badge> : <span className="text-mist-400">—</span>;
    case "number":
      return <span className="tabular-nums text-mist-700">{v ?? "—"}</span>;
    default:
      return <span className="text-mist-700">{v ? String(v) : "—"}</span>;
  }
}

export default async function ResourceListPage({ params, searchParams }: PageProps<"/admin/[resource]">) {
  const { resource } = await params;
  if (!isResourceKey(resource)) notFound();
  await requirePermission("content:manage");
  const def = RESOURCES[resource];
  const sp = await searchParams;
  const str = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : undefined);
  const page = Math.max(1, Number(str("page") ?? 1) || 1);
  const filters: Record<string, string> = {};
  for (const f of def.filters ?? []) if (str(f.field)) filters[f.field] = str(f.field)!;
  if (str("state")) filters.state = str("state")!;

  const data = isDbConfigured ? await listResource(resource, { q: str("q"), page, filters }) : { rows: [], total: 0, page: 1, pages: 1, perPage: 20 };
  const makeHref = (p: number) => {
    const next = new URLSearchParams(Object.entries(sp).filter(([, v]) => typeof v === "string") as [string, string][]);
    next.set("page", String(p));
    return `/admin/${resource}?${next}`;
  };

  const toolbarFilters = [
    ...(def.filters ?? []).filter((f) => f.field !== "status").map((f) => ({ param: f.field, label: f.label, options: f.options })),
    ...(def.publish
      ? [
          {
            param: "state",
            label: "Statuses",
            options: [
              { value: "live", label: "Published" },
              { value: "draft", label: "Draft" },
            ],
          },
        ]
      : []),
  ];

  return (
    <>
      <PageHeader
        title={def.label}
        description={def.description}
        crumbs={[{ label: "Dashboard", href: "/admin" }, { label: def.group }, { label: def.label }]}
        actions={
          <ButtonLink href={`/admin/${resource}/new`} variant="dark" size="sm">
            <Plus className="size-4" aria-hidden /> New {def.singular.toLowerCase()}
          </ButtonLink>
        }
      />
      <Suspense>
        <ListToolbar filters={toolbarFilters} placeholder={`Search ${def.label.toLowerCase()}…`} />
      </Suspense>

      {data.rows.length === 0 ? (
        <EmptyState
          title={str("q") ? "No matches" : `No ${def.label.toLowerCase()} yet`}
          description={str("q") ? "Try a different search or clear the filters." : `Create your first ${def.singular.toLowerCase()} to get started.`}
          action={
            <ButtonLink href={`/admin/${resource}/new`} variant="dark" size="sm">
              New {def.singular.toLowerCase()}
            </ButtonLink>
          }
        />
      ) : (
        <>
          <Table>
            <thead>
              <tr>
                {def.columns.map((c) => (
                  <th key={c.key} scope="col" className={th}>
                    {c.label || <span className="sr-only">Image</span>}
                  </th>
                ))}
                <th scope="col" className={th}>
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row) => {
                const url = publicUrl(def, row);
                return (
                  <tr key={row._id} className="transition-colors hover:bg-mist-25">
                    {def.columns.map((c) => (
                      <td key={c.key} className={td}>
                        <Cell col={c} row={row} def={def} />
                      </td>
                    ))}
                    <td className={`${td} text-right`}>
                      <div className="flex justify-end gap-1">
                        {url && (
                          <a href={url} target="_blank" rel="noopener noreferrer" className="rounded-lg p-2 text-mist-400 hover:bg-mist-100 hover:text-ink-900" aria-label="View on site">
                            <ExternalLink className="size-4" />
                          </a>
                        )}
                        <Link href={`/admin/${resource}/${row._id}`} className="rounded-lg p-2 text-mist-400 hover:bg-mist-100 hover:text-ink-900" aria-label={`Edit ${String(row[def.titleField] ?? "")}`}>
                          <Pencil className="size-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
          <Pagination page={data.page} pages={data.pages} total={data.total} makeHref={makeHref} />
        </>
      )}
    </>
  );
}
