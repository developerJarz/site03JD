/**
 * Migrated Jarz Digital content.
 *
 * Used in two places:
 *  1. `npm run db:seed` writes it into MongoDB (the CMS becomes the source of truth).
 *  2. The data layer falls back to it when MONGODB_URI is not configured,
 *     so the marketing site can be previewed and built without a database.
 */
import postsJson from "./posts.json";
import { industrySeed as industries } from "./industries";
import { pageSeed } from "./pages";
import { categorySeed, faqSeed, tagSeed, teamSeed } from "./people";
import { projectSeed as projects } from "./projects";
import { withSeo } from "./seo";
import { serviceSeed as services } from "./services";
import { beforeAfterShowcase, brandFacts, growthProcess, siteSeed } from "./site";

export interface SeedPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  publishedAt: string;
  legacyUrl: string;
  authorName: string;
  category: string;
  tags: string[];
  coverImage: string | null;
  wordCount: number;
  seo?: { title?: string; description?: string };
}

export const postSeed = withSeo(postsJson as SeedPost[], "posts");
const serviceSeed = withSeo(services, "services");
const projectSeed = withSeo(projects, "projects");
const industrySeed = withSeo(industries, "industries");

export {
  beforeAfterShowcase,
  brandFacts,
  growthProcess,
  categorySeed,
  faqSeed,
  industrySeed,
  pageSeed,
  projectSeed,
  serviceSeed,
  siteSeed,
  tagSeed,
  teamSeed,
};
