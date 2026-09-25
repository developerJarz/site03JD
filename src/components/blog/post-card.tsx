import Image from "next/image";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import type { Post } from "@/types/content";
import { cn } from "@/lib/utils";

export function PostMeta({ post, className }: { post: Post; className?: string }) {
  return (
    <p className={cn("flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-mist-500", className)}>
      {post.category && <span className="font-medium text-brand-700 [.theme-dark_&]:text-brand-300">{post.category.name}</span>}
      <span aria-hidden>·</span>
      <time dateTime={post.publishedAt ?? undefined}>{formatDate(post.publishedAt)}</time>
      <span aria-hidden>·</span>
      <span>{post.readingTime} min read</span>
    </p>
  );
}

export function PostCard({ post, priority }: { post: Post; priority?: boolean }) {
  return (
    <article className="group relative flex h-full flex-col">
      <div className="relative aspect-[3/2] overflow-hidden rounded-3xl bg-mist-100">
        {post.coverImage && (
          <Image
            src={post.coverImage.src}
            alt={post.coverImage.alt}
            fill
            {...(priority ? { loading: "eager" as const, fetchPriority: "high" as const } : {})}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-[1.2s] ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
          />
        )}
      </div>
      <PostMeta post={post} className="mt-5" />
      <h3 className="mt-2 font-display text-xl font-semibold leading-snug tracking-tight text-ink-900">
        <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0 group-hover:text-brand-700">
          {post.title}
        </Link>
      </h3>
      <p className="mt-2 line-clamp-2 text-[0.95rem] leading-relaxed text-mist-600">{post.excerpt}</p>
    </article>
  );
}

export function FeaturedPost({ post }: { post: Post }) {
  return (
    <article className="group relative grid overflow-hidden rounded-[32px] border border-mist-200 bg-white lg:grid-cols-2">
      <div className="relative aspect-[3/2] lg:aspect-auto">
        {post.coverImage && (
          <Image src={post.coverImage.src} alt={post.coverImage.alt} fill loading="eager" fetchPriority="high" sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover transition-transform duration-[1.2s] ease-[var(--ease-out-expo)] group-hover:scale-[1.03]" />
        )}
      </div>
      <div className="flex flex-col justify-center p-8 md:p-12">
        <p className="eyebrow text-brand-700">Featured article</p>
        <h2 className="mt-5 font-display text-3xl font-semibold leading-tight tracking-tight text-ink-900 md:text-4xl">
          <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0">
            {post.title}
          </Link>
        </h2>
        <p className="mt-4 line-clamp-3 text-lg leading-relaxed text-mist-600">{post.excerpt}</p>
        <PostMeta post={post} className="mt-8" />
      </div>
    </article>
  );
}
