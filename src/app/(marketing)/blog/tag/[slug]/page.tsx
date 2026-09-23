import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostList } from "@/components/blog/post-list";
import { PageHero } from "@/components/marketing/page-hero";
import { Section } from "@/components/ui/section";
import { getCategories, getPosts, getTags } from "@/lib/data/public";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  return (await getTags()).map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/tag/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const tag = (await getTags()).find((t) => t.slug === slug);
  if (!tag) return {};
  return buildMetadata({ title: `Articles tagged “${tag.name}”`, description: `Jarz Digital insights about ${tag.name}.`, path: `/blog/tag/${slug}`, noindex: true });
}

export default async function TagPage({ params }: PageProps<"/blog/tag/[slug]">) {
  const { slug } = await params;
  const [tags, posts, categories] = await Promise.all([getTags(), getPosts(), getCategories("post")]);
  const tag = tags.find((t) => t.slug === slug);
  if (!tag) notFound();
  const tagged = posts.filter((p) => p.tags.some((t) => t.slug === slug));

  return (
    <>
      <PageHero
        eyebrow="Tag"
        title={`#${tag.name}`}
        description={`${tagged.length} article${tagged.length === 1 ? "" : "s"} tagged ${tag.name}.`}
        crumbs={[
          { name: "Insights", path: "/blog" },
          { name: tag.name, path: `/blog/tag/${slug}` },
        ]}
      />
      <Section tone="light" aria-label={`Articles tagged ${tag.name}`} className="pt-16 md:pt-20">
        <PostList posts={tagged} categories={categories.filter((c) => posts.some((p) => p.category?.slug === c.slug))} />
      </Section>
    </>
  );
}
