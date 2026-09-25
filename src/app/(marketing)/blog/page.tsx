import type { Metadata } from "next";
import { FeaturedPost } from "@/components/blog/post-card";
import { PostList } from "@/components/blog/post-list";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { PageHero } from "@/components/marketing/page-hero";
import { Section } from "@/components/ui/section";
import { getCategories, getPosts } from "@/lib/data/public";
import { pageMetadata } from "@/lib/seo/page";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const meta = await pageMetadata("/blog");
  return { ...meta, alternates: { ...meta.alternates, types: { "application/rss+xml": "/blog/rss.xml" } } };
}

export default async function BlogPage() {
  const [posts, categories] = await Promise.all([getPosts(), getCategories("post")]);
  const featured = posts.find((p) => p.featured) ?? posts[0];
  const rest = posts.filter((p) => p.slug !== featured?.slug);
  const usedCategories = categories.filter((c) => posts.some((p) => p.category?.slug === c.slug));

  return (
    <>
      <PageHero
        eyebrow="The Jarz Digital blog"
        eyebrowInTitle
        title="Guides for growing your business online."
        titleLines={["Guides for growing", "your business online."]}
        description="Local SEO, Google Maps, Google Business Profile and business management — explained by the team that does it every day."
        crumbs={[{ name: "Insights", path: "/blog" }]}
      />
      <Section tone="light" aria-label="Articles" className="pt-16 md:pt-20">
        {featured && (
          <div className="mb-20">
            <FeaturedPost post={featured} />
          </div>
        )}
        <PostList posts={rest} categories={usedCategories} />
      </Section>
      <CtaBanner title="Want us to put this into practice for you?" primary={{ label: "Get a Free Consultation", href: "/contact" }} secondary={{ label: "Explore Local SEO", href: "/services/local-seo" }} />
    </>
  );
}
