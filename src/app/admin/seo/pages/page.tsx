/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, Table, td, th } from "@/components/admin/ui";
import { Badge } from "@/components/ui/badge";
import { requirePermission } from "@/lib/auth/session";
import { RESOURCES } from "@/lib/cms/resources";
import { MODELS, publicUrl } from "@/lib/cms/server";
import { connectDB } from "@/lib/db/connect";

export const metadata: Metadata = { title: "Page SEO" };

const KEYS = ["services", "projects", "industries", "posts", "pages"] as const;

export default async function PageSeoPage() {
  await requirePermission("seo:page");
  await connectDB();
  const groups = await Promise.all(
    KEYS.map(async (k) => {
      const def = RESOURCES[k];
      const docs = await MODELS[k].find().select(`${def.titleField} slug seo excerpt summary intro needsReview`).sort(def.defaultSort).lean<any[]>();
      return { k, def, docs };
    }),
  );

  return (
    <>
      <PageHeader
        title="Page SEO"
        description="Check titles, descriptions and indexing for every public page. Open a page to edit its SEO section."
        crumbs={[{ label: "Dashboard", href: "/admin" }, { label: "SEO", href: "/admin/seo" }, { label: "Pages" }]}
      />
      <div className="space-y-8">
        {groups.map(({ k, def, docs }) => (
          <section key={k}>
            <h2 className="mb-3 text-sm font-semibold text-ink-900">
              {def.label} <span className="font-normal text-mist-500">({docs.length})</span>
            </h2>
            <Table>
              <thead>
                <tr>
                  <th scope="col" className={th}>Page</th>
                  <th scope="col" className={th}>Meta title</th>
                  <th scope="col" className={th}>Meta description</th>
                  <th scope="col" className={th}>Indexing</th>
                </tr>
              </thead>
              <tbody>
                {docs.map((d) => {
                  const title: string | undefined = d.seo?.title;
                  const desc: string | undefined = d.seo?.description || d.excerpt || d.summary || d.intro;
                  return (
                    <tr key={String(d._id)} className="hover:bg-mist-25">
                      <td className={td}>
                        <Link href={`/admin/${k}/${d._id}`} className="font-medium text-ink-900 hover:text-brand-700">
                          {d[def.titleField]}
                        </Link>
                        <span className="block text-xs text-mist-500">{publicUrl(def, d)}</span>
                      </td>
                      <td className={td}>{title ? <Badge tone={title.length > 60 ? "warning" : "success"}>{title.length} chars</Badge> : <Badge tone="neutral">Auto</Badge>}</td>
                      <td className={td}>
                        {!desc ? (
                          <Badge tone="danger">Missing</Badge>
                        ) : d.seo?.description ? (
                          <Badge tone={desc.length > 160 ? "warning" : "success"}>Custom · {desc.length}</Badge>
                        ) : (
                          <Badge tone="neutral">From summary</Badge>
                        )}
                      </td>
                      <td className={td}>
                        {d.seo?.noindex ? <Badge tone="warning">noindex</Badge> : <Badge tone="success">Indexed</Badge>}
                        {d.needsReview && (
                          <Badge tone="warning" className="ml-1">
                            Needs review
                          </Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </section>
        ))}
      </div>
    </>
  );
}
