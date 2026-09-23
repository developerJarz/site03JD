/**
 * Migrated Jarz Digital content.
 *
 * Used in two places:
 *  1. `npm run db:seed` writes it into MongoDB (the CMS becomes the source of truth).
 *  2. The data layer falls back to it when MONGODB_URI is not configured,
 *     so the marketing site can be previewed and built without a database.
 */
import postsJson from "./posts.json";
import { industrySeed } from "./industries";
import { pageSeed } from "./pages";
import { categorySeed, faqSeed, tagSeed, teamSeed } from "./people";
import { projectSeed } from "./projects";
import { serviceSeed } from "./services";
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
}

export const postSeed = postsJson as SeedPost[];

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
