/**
 * The founder has a full profile page at the site root; everyone else lives
 * under /team. The old /team/<founder> URL 301s to it (see redirects.ts).
 */
export const FOUNDER_PROFILE = { slug: "rokonuzzaman-jony", path: "/rokonuzzaman-jony" } as const;

export const teamMemberPath = (slug: string) => (slug === FOUNDER_PROFILE.slug ? FOUNDER_PROFILE.path : `/team/${slug}`);
