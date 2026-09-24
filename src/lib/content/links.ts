import type { Post, Service } from "@/types/content";

/** The service a post is about: its category first (local-seo, seo, business-management), then its tags. */
export function serviceForPost(post: Post, services: Service[]): Service | undefined {
  return services.find((s) => s.slug === post.category?.slug) ?? services.find((s) => post.tags.some((t) => t.slug === s.slug));
}

/** Articles for a service page — the inverse of serviceForPost, newest first. */
export function postsForService(service: Service, posts: Post[], services: Service[], limit = 3): Post[] {
  return posts.filter((p) => serviceForPost(p, services)?.slug === service.slug).slice(0, limit);
}
