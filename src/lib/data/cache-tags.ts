/** Cache tags shared by the public data layer and the CMS mutations that invalidate it. */
export const TAGS = {
  settings: "settings",
  services: "services",
  projects: "projects",
  industries: "industries",
  team: "team",
  testimonials: "testimonials",
  faqs: "faqs",
  posts: "posts",
  pages: "pages",
  taxonomy: "taxonomy",
} as const;

export type CacheTag = (typeof TAGS)[keyof typeof TAGS];

/** Seconds before cached public content is re-validated in the background. */
export const PUBLIC_REVALIDATE = 3600;
