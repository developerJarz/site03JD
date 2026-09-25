import type { Office, Post, Service } from "@/types/content";
import { officeSlug } from "@/lib/seo/locations";

/** A post is about an office’s city when it is tagged with the city or names it in the title. */
const aboutOffice = (post: Post, office: Office) =>
  post.tags.some((t) => t.slug === officeSlug(office)) || new RegExp(`\\b${office.city}\\b`, "i").test(post.title);

/** Articles for a location page, newest first. */
export function postsForOffice(office: Office, posts: Post[], limit = 3): Post[] {
  return posts.filter((p) => aboutOffice(p, office)).slice(0, limit);
}

/** The office an article is about (e.g. a Dallas guide → the Dallas page). */
export function officeForPost(post: Post, offices: Office[]): Office | undefined {
  return offices.find((o) => aboutOffice(post, o));
}

/** The service a post is about: its category first (local-seo, seo, business-management), then its tags. */
export function serviceForPost(post: Post, services: Service[]): Service | undefined {
  return services.find((s) => s.slug === post.category?.slug) ?? services.find((s) => post.tags.some((t) => t.slug === s.slug));
}

/** Articles for a service page — the inverse of serviceForPost, newest first. */
export function postsForService(service: Service, posts: Post[], services: Service[], limit = 3): Post[] {
  return posts.filter((p) => serviceForPost(p, services)?.slug === service.slug).slice(0, limit);
}
