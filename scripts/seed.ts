/**
 * Seeds MongoDB with the content migrated from jarzdigital.com.
 *
 *   npm run db:seed            # idempotent upsert by slug (keeps CMS edits to settings)
 *   npm run db:seed -- --reset # wipe CMS content collections first
 *
 * Optionally creates the first admin when SEED_ADMIN_EMAIL and
 * SEED_ADMIN_PASSWORD are set.
 */
import "./_env";
import mongoose, { type Types } from "mongoose";
import {
  categorySeed,
  faqSeed,
  industrySeed,
  pageSeed,
  postSeed,
  projectSeed,
  serviceSeed,
  siteSeed,
  tagSeed,
  teamSeed,
} from "../src/content/seed";
import { hashPassword } from "../src/lib/auth/password";
import { readingTime } from "../src/lib/utils";
import { Category, Faq, Industry, Page, Post, Project, Service, Tag, TeamMember } from "../src/models/content";
import { SiteSettingsModel } from "../src/models/operations";
import { User } from "../src/models/User";

const reset = process.argv.includes("--reset");
const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI is not set. Add it to .env.local (run `npm run db:dev` for a local database).");
  process.exit(1);
}

async function main() {
  await mongoose.connect(uri!, { dbName: process.env.MONGODB_DB ?? "jarzdigital" });
  console.log(`Connected to ${mongoose.connection.name}`);

  if (reset) {
    for (const name of ["Category", "Tag", "Service", "Industry", "Project", "TeamMember", "Testimonial", "Faq", "Post", "Page"]) {
      await mongoose.model(name).deleteMany({});
    }
    console.log("Content collections cleared.");
  }

  // Ensure indexes exist (unique slugs, text indexes, TTLs).
  await Promise.all(mongoose.modelNames().map((n) => mongoose.model(n).syncIndexes()));

  /* Settings — only created once so admin edits are never overwritten. */
  const existingSettings = await SiteSettingsModel.findOne({ key: "site" });
  if (!existingSettings || reset) {
    await SiteSettingsModel.updateOne({ key: "site" }, { $set: { data: siteSeed } }, { upsert: true });
    console.log("✓ site settings");
  } else console.log("• site settings already exist (kept)");

  /* Taxonomy */
  const catIds = new Map<string, Types.ObjectId>();
  for (const c of categorySeed) {
    const doc = await Category.findOneAndUpdate({ slug: c.slug }, { $set: c }, { upsert: true, returnDocument: "after" });
    catIds.set(c.slug, doc._id);
  }
  const tagIds = new Map<string, Types.ObjectId>();
  for (const t of tagSeed) {
    const doc = await Tag.findOneAndUpdate({ slug: t.slug }, { $set: t }, { upsert: true, returnDocument: "after" });
    tagIds.set(t.slug, doc._id);
  }
  console.log(`✓ ${catIds.size} categories, ${tagIds.size} tags`);

  /* Services (two passes so `related` can reference each other) */
  const serviceIds = new Map<string, Types.ObjectId>();
  for (const { relatedSlugs: _r, categorySlug, ...s } of serviceSeed) {
    const doc = await Service.findOneAndUpdate({ slug: s.slug }, { $set: { ...s, category: catIds.get(categorySlug) } }, { upsert: true, returnDocument: "after" });
    serviceIds.set(s.slug, doc._id);
  }
  for (const s of serviceSeed) {
    await Service.updateOne({ slug: s.slug }, { $set: { related: s.relatedSlugs.map((r) => serviceIds.get(r)).filter(Boolean) } });
  }
  console.log(`✓ ${serviceIds.size} services`);

  /* Industries */
  const industryIds = new Map<string, Types.ObjectId>();
  for (const { serviceSlugs, ...i } of industrySeed) {
    const doc = await Industry.findOneAndUpdate(
      { slug: i.slug },
      { $set: { ...i, services: serviceSlugs.map((s) => serviceIds.get(s)).filter(Boolean) } },
      { upsert: true, returnDocument: "after" },
    );
    industryIds.set(i.slug, doc._id);
  }
  console.log(`✓ ${industryIds.size} industries`);

  /* Projects */
  for (const { industrySlug, serviceSlugs, ...p } of projectSeed) {
    await Project.updateOne(
      { slug: p.slug },
      {
        $set: {
          ...p,
          industry: industrySlug ? industryIds.get(industrySlug) : undefined,
          services: serviceSlugs.map((s) => serviceIds.get(s)).filter(Boolean),
        },
      },
      { upsert: true },
    );
  }
  console.log(`✓ ${projectSeed.length} projects`);

  /* Team, FAQs, pages */
  for (const m of teamSeed) await TeamMember.updateOne({ slug: m.slug }, { $set: m }, { upsert: true });
  for (const f of faqSeed) await Faq.updateOne({ question: f.question }, { $set: f }, { upsert: true });
  for (const p of pageSeed) await Page.updateOne({ slug: p.slug }, { $setOnInsert: p }, { upsert: true });
  console.log(`✓ ${teamSeed.length} team members, ${faqSeed.length} FAQs, ${pageSeed.length} pages`);

  /* Blog posts (migrated from the WordPress RSS feed) */
  const newest = [...postSeed].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))[0]?.slug;
  for (const p of postSeed) {
    await Post.updateOne(
      { slug: p.slug },
      {
        $set: {
          title: p.title,
          excerpt: p.excerpt,
          content: p.content,
          coverImage: p.coverImage ? { src: p.coverImage, alt: p.title, width: 1080, height: 720 } : undefined,
          category: catIds.get(p.category),
          tags: p.tags.map((t) => tagIds.get(t)).filter(Boolean),
          authorName: p.authorName,
          status: "published",
          publishedAt: new Date(p.publishedAt),
          readingTime: readingTime(p.content),
          legacyUrl: p.legacyUrl,
          featured: p.slug === newest,
          seo: p.seo ?? {},
        },
      },
      { upsert: true },
    );
  }
  console.log(`✓ ${postSeed.length} blog posts`);

  /* Optional first admin */
  const email = process.env.SEED_ADMIN_EMAIL?.toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (email && password) {
    const exists = await User.findOne({ email });
    if (!exists) {
      await User.create({ name: process.env.SEED_ADMIN_NAME ?? "Jarz Admin", email, passwordHash: await hashPassword(password), role: "ADMIN" });
      console.log(`✓ admin user created: ${email}`);
    } else console.log(`• admin ${email} already exists`);
  }

  await mongoose.disconnect();
  console.log("\nSeed complete.");
}

main().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect();
  process.exit(1);
});
