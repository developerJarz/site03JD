import { ICON_OPTIONS } from "@/components/ui/icon";
import { PROJECT_CATEGORIES } from "@/types/content";
import type { FieldDef, ResourceDef, ResourceKey } from "./types";

/**
 * CMS resource registry. Adding a content type = add a model + an entry here.
 * Client-safe: no server imports.
 */

const seo: FieldDef = { name: "seo", label: "SEO", type: "seo" };
const slug = (from = "title"): FieldDef => ({ name: "slug", label: "Slug", type: "slug", from, required: true, help: "URL path segment. Generated from the title — edit if needed." });
const order: FieldDef = { name: "order", label: "Display order", type: "number", min: 0, help: "Lower numbers appear first.", width: "half" };
const titled = (label: string): FieldDef => ({
  name: label.toLowerCase(),
  label,
  type: "repeater",
  itemLabel: "title",
  fields: [
    { name: "title", label: "Title", type: "text", required: true, max: 160 },
    { name: "description", label: "Description", type: "textarea", rows: 2, max: 600 },
  ],
});

export const RESOURCES: Record<ResourceKey, ResourceDef> = {
  posts: {
    key: "posts",
    label: "Blog posts",
    singular: "Blog post",
    group: "Content",
    description: "Articles for the Insights section.",
    titleField: "title",
    publicPath: "/blog/:slug",
    publish: { field: "status", draft: "draft", live: "published" },
    searchFields: ["title", "excerpt", "slug"],
    defaultSort: { updatedAt: -1 },
    filters: [
      {
        field: "status",
        label: "Status",
        options: [
          { value: "published", label: "Published" },
          { value: "draft", label: "Draft" },
        ],
      },
    ],
    columns: [
      { key: "coverImage", label: "", type: "image" },
      { key: "title", label: "Title", type: "title" },
      { key: "category", label: "Category", type: "relation" },
      { key: "status", label: "Status", type: "status" },
      { key: "views", label: "Views", type: "number" },
      { key: "publishedAt", label: "Published", type: "date" },
    ],
    sections: [
      {
        title: "Article",
        fields: [
          { name: "title", label: "Title", type: "text", required: true, max: 200 },
          slug(),
          { name: "excerpt", label: "Excerpt", type: "textarea", rows: 3, max: 500, help: "Shown on cards and as the default meta description." },
          { name: "content", label: "Content", type: "richtext" },
        ],
      },
      {
        title: "Publishing",
        aside: true,
        fields: [
          { name: "publishedAt", label: "Publish date", type: "date", help: "Set a future date to schedule." },
          { name: "featured", label: "Featured article", type: "boolean" },
          { name: "authorName", label: "Author display name", type: "text", max: 120 },
        ],
      },
      {
        title: "Organisation",
        aside: true,
        fields: [
          { name: "category", label: "Category", type: "relation", resource: "categories", where: { kind: "post" } },
          { name: "tags", label: "Tags", type: "relation", resource: "tags", multiple: true },
        ],
      },
      { title: "Featured image", aside: true, fields: [{ name: "coverImage", label: "Featured image", type: "image" }] },
      { title: "SEO", fields: [seo] },
    ],
  },

  pages: {
    key: "pages",
    label: "Pages",
    singular: "Page",
    group: "Content",
    description: "Free-form pages such as the privacy policy and terms.",
    titleField: "title",
    publicPath: "/:slug",
    publish: { field: "status", draft: "draft", live: "published" },
    searchFields: ["title", "slug"],
    defaultSort: { updatedAt: -1 },
    columns: [
      { key: "title", label: "Title", type: "title" },
      { key: "slug", label: "URL", type: "text" },
      { key: "needsReview", label: "Needs review", type: "boolean" },
      { key: "status", label: "Status", type: "status" },
      { key: "updatedAt", label: "Updated", type: "date" },
    ],
    sections: [
      {
        title: "Page",
        fields: [
          { name: "title", label: "Title", type: "text", required: true, max: 160 },
          slug(),
          { name: "intro", label: "Intro", type: "textarea", rows: 2, max: 600 },
          { name: "content", label: "Content", type: "richtext" },
        ],
      },
      { title: "Review", aside: true, fields: [{ name: "needsReview", label: "Needs review", type: "boolean", help: "Flag content that still needs to be checked." }] },
      { title: "SEO", fields: [seo] },
    ],
  },

  categories: {
    key: "categories",
    label: "Categories",
    singular: "Category",
    group: "Content",
    description: "Blog and service categories.",
    titleField: "name",
    searchFields: ["name", "slug"],
    defaultSort: { kind: 1, name: 1 },
    filters: [
      {
        field: "kind",
        label: "Type",
        options: [
          { value: "post", label: "Blog" },
          { value: "service", label: "Service" },
        ],
      },
    ],
    columns: [
      { key: "name", label: "Name", type: "title" },
      { key: "slug", label: "Slug", type: "text" },
      { key: "kind", label: "Type", type: "text" },
      { key: "updatedAt", label: "Updated", type: "date" },
    ],
    sections: [
      {
        title: "Category",
        fields: [
          { name: "name", label: "Name", type: "text", required: true, max: 80 },
          slug("name"),
          {
            name: "kind",
            label: "Used for",
            type: "select",
            required: true,
            options: [
              { value: "post", label: "Blog posts" },
              { value: "service", label: "Services" },
            ],
          },
          { name: "description", label: "Description", type: "textarea", rows: 2, max: 400 },
        ],
      },
    ],
  },

  tags: {
    key: "tags",
    label: "Tags",
    singular: "Tag",
    group: "Content",
    description: "Blog post tags.",
    titleField: "name",
    searchFields: ["name", "slug"],
    defaultSort: { name: 1 },
    columns: [
      { key: "name", label: "Name", type: "title" },
      { key: "slug", label: "Slug", type: "text" },
      { key: "updatedAt", label: "Updated", type: "date" },
    ],
    sections: [
      {
        title: "Tag",
        fields: [
          { name: "name", label: "Name", type: "text", required: true, max: 60 },
          slug("name"),
        ],
      },
    ],
  },

  services: {
    key: "services",
    label: "Services",
    singular: "Service",
    group: "Services",
    description: "Service pages, pricing plans and FAQs.",
    titleField: "title",
    publicPath: "/services/:slug",
    publish: { field: "published", draft: false, live: true },
    searchFields: ["title", "tagline", "slug"],
    defaultSort: { order: 1 },
    columns: [
      { key: "title", label: "Service", type: "title" },
      { key: "category", label: "Category", type: "relation" },
      { key: "startingPrice", label: "From", type: "text" },
      { key: "order", label: "Order", type: "number" },
      { key: "published", label: "Status", type: "status" },
    ],
    sections: [
      {
        title: "Basics",
        fields: [
          { name: "title", label: "Title", type: "text", required: true, max: 120 },
          slug(),
          { name: "shortTitle", label: "Short title", type: "text", max: 60, help: "Used in navigation and compact lists.", width: "half" },
          { name: "icon", label: "Icon", type: "icon", options: ICON_OPTIONS, width: "half" },
          { name: "tagline", label: "Tagline", type: "text", max: 160 },
          { name: "summary", label: "Summary", type: "textarea", rows: 3, max: 600 },
        ],
      },
      {
        title: "Hero & overview",
        fields: [
          { name: "heroTitle", label: "Hero headline", type: "text", max: 160 },
          { name: "heroSubtitle", label: "Hero description", type: "textarea", rows: 3, max: 600 },
          { name: "overview", label: "Overview", type: "textarea", rows: 5 },
        ],
      },
      { title: "Problems we solve", fields: [titled("Problems")] },
      {
        title: "What's included",
        fields: [
          {
            name: "included",
            label: "Included groups",
            type: "repeater",
            itemLabel: "title",
            fields: [
              { name: "title", label: "Title", type: "text", required: true },
              { name: "description", label: "Description", type: "textarea", rows: 2 },
              { name: "items", label: "Items", type: "list" },
            ],
          },
        ],
      },
      { title: "Process", fields: [titled("Process")] },
      {
        title: "Benefits & capabilities",
        fields: [
          { name: "benefits", label: "Benefits", type: "list" },
          { name: "capabilities", label: "Technology & capabilities", type: "list" },
        ],
      },
      {
        title: "Pricing",
        fields: [
          { name: "startingPrice", label: "Starting price", type: "text", max: 30, placeholder: "$40", width: "half" },
          { name: "planNote", label: "Plan footnote", type: "text", max: 300, width: "half" },
          {
            name: "plans",
            label: "Plans",
            type: "repeater",
            itemLabel: "name",
            fields: [
              { name: "name", label: "Plan name", type: "text", required: true, width: "half" },
              { name: "audience", label: "Best for", type: "text", width: "half" },
              { name: "price", label: "Price", type: "text", required: true, width: "half", placeholder: "$150" },
              { name: "period", label: "Period", type: "text", width: "half", placeholder: "/month" },
              { name: "description", label: "Description", type: "textarea", rows: 2 },
              { name: "features", label: "Features", type: "list" },
              { name: "highlighted", label: "Highlight this plan", type: "boolean" },
            ],
          },
        ],
      },
      {
        title: "FAQs",
        fields: [
          {
            name: "faqs",
            label: "Questions",
            type: "repeater",
            itemLabel: "question",
            fields: [
              { name: "question", label: "Question", type: "text", required: true },
              { name: "answer", label: "Answer", type: "textarea", rows: 3, required: true },
            ],
          },
        ],
      },
      {
        title: "Settings",
        aside: true,
        fields: [
          { name: "category", label: "Category", type: "relation", resource: "categories", where: { kind: "service" } },
          { name: "related", label: "Related services", type: "relation", resource: "services", multiple: true },
          { name: "featured", label: "Featured", type: "boolean" },
          order,
        ],
      },
      { title: "Image", aside: true, fields: [{ name: "image", label: "Service image", type: "image" }] },
      { title: "SEO", fields: [seo] },
    ],
  },

  projects: {
    key: "projects",
    label: "Projects",
    singular: "Project",
    group: "Portfolio",
    description: "Portfolio case studies.",
    titleField: "title",
    publicPath: "/work/:slug",
    publish: { field: "published", draft: false, live: true },
    searchFields: ["title", "client", "summary", "slug"],
    defaultSort: { featured: -1, order: 1 },
    columns: [
      { key: "coverImage", label: "", type: "image" },
      { key: "client", label: "Client", type: "title" },
      { key: "industry", label: "Industry", type: "relation" },
      { key: "featured", label: "Featured", type: "boolean" },
      { key: "needsReview", label: "Needs review", type: "boolean" },
      { key: "views", label: "Views", type: "number" },
      { key: "published", label: "Status", type: "status" },
    ],
    sections: [
      {
        title: "Project",
        fields: [
          { name: "title", label: "Title", type: "text", required: true, max: 140 },
          slug(),
          { name: "client", label: "Client", type: "text", required: true, max: 120, width: "half" },
          { name: "location", label: "Location", type: "text", max: 120, width: "half" },
          { name: "summary", label: "Summary", type: "textarea", rows: 3, max: 600 },
          { name: "description", label: "Description", type: "richtext" },
        ],
      },
      {
        title: "Details",
        fields: [
          { name: "technologies", label: "Technologies & platforms", type: "list" },
          {
            name: "results",
            label: "Results (only verified figures)",
            type: "repeater",
            itemLabel: "label",
            fields: [
              { name: "value", label: "Value", type: "text", required: true, width: "half", placeholder: "3x" },
              { name: "label", label: "Label", type: "text", required: true, width: "half", placeholder: "More calls from Google" },
            ],
          },
          { name: "websiteUrl", label: "Live website", type: "url", width: "half" },
          { name: "year", label: "Year", type: "number", min: 2000, max: 2100, width: "half" },
        ],
      },
      { title: "Gallery", fields: [{ name: "gallery", label: "Gallery images", type: "gallery" }] },
      {
        title: "Classification",
        aside: true,
        fields: [
          { name: "categories", label: "Categories", type: "select", multiple: true, options: PROJECT_CATEGORIES.map((c) => ({ value: c.value, label: c.label })) },
          { name: "industry", label: "Industry", type: "relation", resource: "industries" },
          { name: "services", label: "Services", type: "relation", resource: "services", multiple: true },
          { name: "featured", label: "Featured on homepage", type: "boolean" },
          { name: "needsReview", label: "Needs review", type: "boolean" },
          order,
        ],
      },
      { title: "Cover image", aside: true, fields: [{ name: "coverImage", label: "Cover image", type: "image", required: true }] },
      { title: "Before & after", aside: true, fields: [{ name: "beforeAfter", label: "Before / after image", type: "image" }] },
      { title: "SEO", fields: [seo] },
    ],
  },

  industries: {
    key: "industries",
    label: "Industries",
    singular: "Industry",
    group: "Portfolio",
    description: "Industry landing pages.",
    titleField: "name",
    publicPath: "/industries/:slug",
    publish: { field: "published", draft: false, live: true },
    searchFields: ["name", "headline", "slug"],
    defaultSort: { order: 1 },
    columns: [
      { key: "name", label: "Industry", type: "title" },
      { key: "headline", label: "Headline", type: "text" },
      { key: "needsReview", label: "Needs review", type: "boolean" },
      { key: "published", label: "Status", type: "status" },
    ],
    sections: [
      {
        title: "Industry",
        fields: [
          { name: "name", label: "Name", type: "text", required: true, max: 80, width: "half" },
          { name: "icon", label: "Icon", type: "icon", options: ICON_OPTIONS, width: "half" },
          slug("name"),
          { name: "headline", label: "Headline", type: "text", max: 160 },
          { name: "intro", label: "Introduction", type: "textarea", rows: 3, max: 800 },
        ],
      },
      { title: "Challenges", fields: [titled("Challenges")] },
      { title: "Solutions", fields: [titled("Solutions")] },
      {
        title: "Settings",
        aside: true,
        fields: [
          { name: "services", label: "Relevant services", type: "relation", resource: "services", multiple: true },
          { name: "needsReview", label: "Needs review", type: "boolean" },
          order,
        ],
      },
      { title: "SEO", fields: [seo] },
    ],
  },

  team: {
    key: "team",
    label: "Team",
    singular: "Team member",
    group: "People",
    description: "Team members shown on the website.",
    titleField: "name",
    publicPath: "/team/:slug",
    publish: { field: "published", draft: false, live: true },
    searchFields: ["name", "role", "slug"],
    defaultSort: { order: 1 },
    columns: [
      { key: "photo", label: "", type: "image" },
      { key: "name", label: "Name", type: "title" },
      { key: "role", label: "Role", type: "text" },
      { key: "region", label: "Region", type: "text" },
      { key: "published", label: "Status", type: "status" },
    ],
    sections: [
      {
        title: "Profile",
        fields: [
          { name: "name", label: "Name", type: "text", required: true, max: 120 },
          slug("name"),
          { name: "role", label: "Role", type: "text", max: 120, width: "half" },
          { name: "region", label: "Region", type: "text", max: 120, width: "half" },
          { name: "bio", label: "Short biography", type: "textarea", rows: 4, max: 1200 },
          { name: "highlights", label: "Highlights", type: "list", help: "Only verified achievements." },
        ],
      },
      {
        title: "Social links",
        fields: [
          { name: "socials.linkedin", label: "LinkedIn URL", type: "url", width: "half" },
          { name: "socials.twitter", label: "X / Twitter URL", type: "url", width: "half" },
          { name: "socials.website", label: "Website", type: "url", width: "half" },
        ],
      },
      { title: "Photo", aside: true, fields: [{ name: "photo", label: "Photo", type: "image" }] },
      { title: "Settings", aside: true, fields: [order] },
    ],
  },

  testimonials: {
    key: "testimonials",
    label: "Testimonials",
    singular: "Testimonial",
    group: "People",
    description: "Client quotes. Publish only real, approved testimonials.",
    titleField: "author",
    publish: { field: "published", draft: false, live: true },
    searchFields: ["author", "company", "quote"],
    defaultSort: { order: 1, createdAt: -1 },
    columns: [
      { key: "author", label: "Author", type: "title" },
      { key: "company", label: "Company", type: "text" },
      { key: "rating", label: "Rating", type: "number" },
      { key: "published", label: "Status", type: "status" },
    ],
    sections: [
      {
        title: "Testimonial",
        fields: [
          { name: "quote", label: "Quote", type: "textarea", rows: 5, required: true, max: 1200 },
          { name: "author", label: "Author", type: "text", required: true, max: 120, width: "half" },
          { name: "role", label: "Role", type: "text", max: 120, width: "half" },
          { name: "company", label: "Company", type: "text", max: 120, width: "half" },
          { name: "rating", label: "Rating (1–5)", type: "number", min: 1, max: 5, width: "half" },
        ],
      },
      { title: "Avatar", aside: true, fields: [{ name: "avatar", label: "Avatar", type: "image" }] },
      { title: "Settings", aside: true, fields: [order] },
    ],
  },

  faqs: {
    key: "faqs",
    label: "FAQs",
    singular: "FAQ",
    group: "People",
    description: "Frequently asked questions (homepage and contact page).",
    titleField: "question",
    publish: { field: "published", draft: false, live: true },
    searchFields: ["question", "answer"],
    defaultSort: { group: 1, order: 1 },
    filters: [
      {
        field: "group",
        label: "Group",
        options: [
          { value: "general", label: "Homepage" },
          { value: "contact", label: "Contact page" },
        ],
      },
    ],
    columns: [
      { key: "question", label: "Question", type: "title" },
      { key: "group", label: "Group", type: "text" },
      { key: "order", label: "Order", type: "number" },
      { key: "published", label: "Status", type: "status" },
    ],
    sections: [
      {
        title: "Question",
        fields: [
          { name: "question", label: "Question", type: "text", required: true, max: 300 },
          { name: "answer", label: "Answer", type: "textarea", rows: 5, required: true, max: 2000 },
        ],
      },
      {
        title: "Settings",
        aside: true,
        fields: [
          {
            name: "group",
            label: "Shown on",
            type: "select",
            required: true,
            options: [
              { value: "general", label: "Homepage" },
              { value: "contact", label: "Contact page" },
            ],
          },
          order,
        ],
      },
    ],
  },
};

export const RESOURCE_KEYS = Object.keys(RESOURCES) as ResourceKey[];

export function isResourceKey(key: string): key is ResourceKey {
  return key in RESOURCES;
}

export function allFields(def: ResourceDef): FieldDef[] {
  return def.sections.flatMap((s) => s.fields);
}
