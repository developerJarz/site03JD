import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ScrollProgress } from "@/components/animations";
import { FadeIn, TextReveal } from "@/components/animations/text-reveal";
import { PostCard, PostMeta } from "@/components/blog/post-card";
import { ShareButtons } from "@/components/blog/share-buttons";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { JsonLd } from "@/components/marketing/json-ld";
import { Breadcrumbs } from "@/components/marketing/page-hero";
import { ViewTracker } from "@/components/marketing/view-tracker";
import { Section, SectionHeader } from "@/components/ui/section";
import { ServiceCallout } from "@/components/marketing/service-callout";
import { officeForPost, serviceForPost } from "@/lib/content/links";
import { getPostBySlug, getPosts, getRelatedPosts, getServices, getSiteSettings } from "@/lib/data/public";
import { locationOffices, officePath } from "@/lib/seo/locations";
import { sanitizeRichText, withHeadingAnchors } from "@/lib/security/sanitize";
import { abs, articleSchema, buildMetadata, postModifiedAt } from "@/lib/seo";
import { formatDate } from "@/lib/utils";
import { TeamAvatar } from "@/components/sections/team-grid";

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  return (await getPosts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};
  return buildMetadata({
    title: post.seo.title || post.title,
    description: post.seo.description || post.excerpt,
    path: `/blog/${post.slug}`,
    image: post.coverImage?.src,
    seo: post.seo,
    type: "article",
    publishedTime: post.publishedAt,
    modifiedTime: postModifiedAt(post),
  });
}

export default async function PostPage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();
  const [related, services, settings] = await Promise.all([getRelatedPosts(post), getServices(), getSiteSettings()]);
  const service = serviceForPost(post, services);
  const office = officeForPost(post, locationOffices(settings));
  const { html, toc } = withHeadingAnchors(sanitizeRichText(post.content));
  const url = abs(`/blog/${post.slug}`);
  const author = post.authorMember;
  // Show "Updated" only for real edits made at least a day after publishing.
  const edited = post.contentUpdatedAt && post.publishedAt && Date.parse(post.contentUpdatedAt) - Date.parse(post.publishedAt) > 86_400_000 ? post.contentUpdatedAt : null;

  return (
    <>
      <JsonLd data={articleSchema(post)} />
      <ViewTracker type="post" slug={post.slug} />
      <ScrollProgress />

      <header className="theme-dark relative overflow-hidden bg-ink-950 pb-16 pt-36 md:pt-44">
        <div aria-hidden className="absolute inset-0 bg-grid opacity-60 mask-fade-b" />
        <div aria-hidden className="absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-[radial-gradient(closest-side,rgb(0_175_185/0.2),transparent)] blur-2xl" />
        <div className="container-page relative">
          <Breadcrumbs
            items={[
              { name: "Insights", path: "/blog" },
              ...(post.category ? [{ name: post.category.name, path: `/blog/category/${post.category.slug}` }] : []),
              { name: post.title, path: `/blog/${post.slug}` },
            ]}
            className="mb-10 max-w-3xl"
          />
          <TextReveal lines={[post.title]} className="max-w-4xl font-display text-[clamp(2.1rem,1.4rem+2.8vw,3.75rem)] font-semibold leading-[1.05] tracking-[-0.035em] text-white" />
          <FadeIn delay={0.25}>
            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-white/65">{post.excerpt}</p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              {author ? (
                <TeamAvatar member={author} size={40} />
              ) : (
                <span className="flex size-10 items-center justify-center rounded-full bg-brand-500 font-display text-sm font-bold text-ink-950" aria-hidden>
                  JD
                </span>
              )}
              <div>
                <p className="text-sm font-medium text-white">
                  {author ? (
                    <Link href={`/team/${author.slug}`} rel="author" className="hover:text-brand-300">
                      {author.name}
                    </Link>
                  ) : (
                    post.authorName
                  )}
                  {author?.role && <span className="font-normal text-white/55"> · {author.role}</span>}
                </p>
                <PostMeta post={post} className="text-white/60" />
                {edited && (
                  <p className="mt-1 text-sm text-white/60">
                    Updated <time dateTime={edited}>{formatDate(edited)}</time>
                  </p>
                )}
              </div>
            </div>
          </FadeIn>
        </div>
      </header>

      {post.coverImage && (
        <div className="bg-gradient-to-b from-ink-950 from-50% to-white to-50%">
          <div className="container-page">
            <div className="relative aspect-[3/2] overflow-hidden rounded-[28px] bg-mist-100 md:aspect-[2/1]">
              <Image src={post.coverImage.src} alt={post.coverImage.alt} fill loading="eager" fetchPriority="high" sizes="(min-width: 1320px) 1240px, 100vw" className="object-cover" />
            </div>
          </div>
        </div>
      )}

      <div className="bg-white py-16 md:py-24">
        <div className="container-page grid gap-12 lg:grid-cols-12">
          <aside className="order-last lg:order-first lg:col-span-3">
            <div className="space-y-10 lg:sticky lg:top-28">
              {toc.length > 1 && (
                <nav aria-label="On this page" className="hidden lg:block">
                  <p className="eyebrow text-mist-500">On this page</p>
                  <ol className="mt-4 space-y-2.5 border-l border-mist-200 text-sm">
                    {toc.map((h) => (
                      <li key={h.id} className={h.level === 3 ? "pl-7" : "pl-4"}>
                        <a href={`#${h.id}`} className="-ml-px block border-l border-transparent pl-0 text-mist-600 transition-colors hover:text-ink-900">
                          {h.text}
                        </a>
                      </li>
                    ))}
                  </ol>
                </nav>
              )}
              <div>
                <p className="eyebrow text-mist-500">Share</p>
                <div className="mt-4">
                  <ShareButtons url={url} title={post.title} />
                </div>
              </div>
            </div>
          </aside>

          <article className="lg:col-span-8 lg:col-start-5">
            <div className="prose-jarz" dangerouslySetInnerHTML={{ __html: html }} />
            {post.tags.length > 0 && (
              <ul className="mt-14 flex flex-wrap gap-2 border-t border-mist-200 pt-8" aria-label="Tags">
                {post.tags.map((t) => (
                  <li key={t.slug}>
                    <Link href={`/blog/tag/${t.slug}`} className="inline-flex rounded-full bg-mist-50 px-3.5 py-1.5 text-sm text-mist-700 transition-colors hover:bg-ink-900 hover:text-white">
                      #{t.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            {author && (
              <aside aria-label="About the author" className="mt-12 flex gap-5 rounded-3xl border border-mist-200 p-6 md:p-8">
                <TeamAvatar member={author} size={64} />
                <div>
                  <p className="eyebrow text-mist-600">Written by</p>
                  <p className="mt-2 font-display text-lg font-semibold tracking-tight text-ink-900">
                    <Link href={`/team/${author.slug}`} rel="author" className="hover:text-brand-700">
                      {author.name}
                    </Link>
                  </p>
                  {author.role && <p className="text-sm text-mist-600">{author.role}</p>}
                  {author.bio && <p className="mt-3 leading-relaxed text-mist-700">{author.bio}</p>}
                </div>
              </aside>
            )}
            {service && <ServiceCallout service={service} office={office && { city: office.city, href: officePath(office) }} />}
          </article>
        </div>
      </div>

      {related.length > 0 && (
        <Section tone="mist" aria-labelledby="related-heading">
          <SectionHeader eyebrow="Keep reading" title={<span id="related-heading">Related insights.</span>} />
          <ul className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <li key={p.slug}>
                <PostCard post={p} />
              </li>
            ))}
          </ul>
        </Section>
      )}

      <CtaBanner
        title="Want help ranking your business?"
        primary={{ label: "Get a Free Consultation", href: service ? `/contact?service=${service.slug}` : "/contact" }}
        secondary={{ label: `Explore ${service?.shortTitle ?? "Local SEO"}`, href: `/services/${service?.slug ?? "local-seo"}` }}
      />
    </>
  );
}
