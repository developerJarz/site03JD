import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/marketing/page-hero";
import { formatDate } from "@/lib/utils";
import { getPageBySlug, getPublishedPageSlugs } from "@/lib/data/public";
import { sanitizeRichText } from "@/lib/security/sanitize";
import { buildMetadata } from "@/lib/seo";

/** Free-form CMS pages (privacy policy, terms, landing pages) managed in Admin → Pages. */
export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  return (await getPublishedPageSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPageBySlug(slug);
  if (!page) return {};
  return buildMetadata({ title: page.title, description: page.intro ?? page.title, path: `/${page.slug}`, seo: page.seo });
}

export default async function CmsPage({ params }: PageProps<"/[slug]">) {
  const { slug } = await params;
  const page = await getPageBySlug(slug);
  if (!page) notFound();
  return (
    <>
      <PageHero title={page.title} description={page.intro} crumbs={[{ name: page.title, path: `/${page.slug}` }]} />
      <div className="bg-white py-16 md:py-24">
        <div className="container-page">
          {page.updatedAt && <p className="mb-8 text-sm text-mist-500">Last updated {formatDate(page.updatedAt)}</p>}
          <div className="prose-jarz" dangerouslySetInnerHTML={{ __html: sanitizeRichText(page.content) }} />
        </div>
      </div>
    </>
  );
}
