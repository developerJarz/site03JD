import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostList } from "@/components/blog/post-list";
import { PageHero } from "@/components/marketing/page-hero";
import { Section } from "@/components/ui/section";
import { getCategories, getPosts } from "@/lib/data/public";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  return (await getCategories("post")).map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/category/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const cat = (await getCategories("post")).find((c) => c.slug === slug);
  if (!cat) return {};
  return buildMetadata({ title: `${cat.name} Articles`, description: cat.description ?? `Jarz Digital articles about ${cat.name}.`, path: `/blog/category/${slug}` });
}

export default async function CategoryPage({ params }: PageProps<"/blog/category/[slug]">) {
  const { slug } = await params;
  const [categories, posts] = await Promise.all([getCategories("post"), getPosts()]);
  const category = categories.find((c) => c.slug === slug);
  if (!category) notFound();
  const inCategory = posts.filter((p) => p.category?.slug === slug);

  return (
    <>
      <PageHero
        eyebrow="Insights category"
        title={category.name}
        description={category.description}
        crumbs={[
          { name: "Insights", path: "/blog" },
          { name: category.name, path: `/blog/category/${slug}` },
        ]}
      />
      <Section tone="light" aria-label={`${category.name} articles`} className="pt-16 md:pt-20">
        <PostList posts={inCategory} categories={categories.filter((c) => posts.some((p) => p.category?.slug === c.slug))} activeCategory={slug} />
      </Section>
    </>
  );
}
