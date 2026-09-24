import "server-only";
import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/data/public";
import type { SeoFields } from "@/types/content";
import { buildMetadata } from "./index";
import { staticPageSeo, type StaticPageSeo } from "./pages";

type Options = Omit<Parameters<typeof buildMetadata>[0], "title" | "description" | "path"> & Partial<Pick<StaticPageSeo, "title" | "description">>;

/** Keeps only the override fields an admin actually filled in. */
function filled(seo?: SeoFields): SeoFields {
  return Object.fromEntries(Object.entries(seo ?? {}).filter(([, v]) => v !== "" && v !== undefined && v !== null)) as SeoFields;
}

/**
 * Metadata for a built-in page: registry defaults (or the ones passed in),
 * then admin overrides from settings.seo.pages[path], then the global
 * social image when the page has none of its own.
 */
export async function pageMetadata(path: string, opts: Options = {}): Promise<Metadata> {
  const settings = await getSiteSettings();
  const defaults = staticPageSeo(path);
  const override = filled(settings.seo.pages?.[path]);
  const globalImage = settings.seo.ogImage && settings.seo.ogImage !== "/opengraph-image" ? settings.seo.ogImage : undefined;
  return buildMetadata({
    ...opts,
    title: opts.title ?? defaults?.title ?? settings.seo.defaultTitle,
    description: opts.description ?? defaults?.description ?? settings.seo.defaultDescription,
    path,
    image: opts.image ?? globalImage,
    seo: { ...opts.seo, ...override },
  });
}
