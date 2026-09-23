import "server-only";
import sanitizeHtml from "sanitize-html";

/**
 * Allow-list sanitiser for CMS rich text (blog posts, project descriptions,
 * pages). Everything not listed is stripped — including scripts, inline
 * event handlers, iframes and style attributes.
 */
const options: sanitizeHtml.IOptions = {
  allowedTags: [
    "h2", "h3", "h4", "p", "br", "hr", "strong", "b", "em", "i", "u", "s", "a",
    "ul", "ol", "li", "blockquote", "code", "pre", "img", "figure", "figcaption",
    "table", "thead", "tbody", "tfoot", "tr", "th", "td", "caption", "span", "sup", "sub",
  ],
  allowedAttributes: {
    a: ["href", "title", "target", "rel"],
    img: ["src", "alt", "title", "width", "height", "loading"],
    th: ["colspan", "rowspan", "scope"],
    td: ["colspan", "rowspan"],
    code: ["class"],
    pre: ["class"],
  },
  allowedClasses: { code: [/^language-[\w-]+$/], pre: [/^language-[\w-]+$/] },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowedSchemesByTag: { img: ["http", "https"] },
  allowProtocolRelative: false,
  transformTags: {
    h1: "h2",
    a: (tagName, attribs) => {
      const external = /^https?:\/\//i.test(attribs.href ?? "") && !/jarzdigital\.com/i.test(attribs.href ?? "");
      return {
        tagName,
        attribs: {
          ...attribs,
          ...(external ? { target: "_blank", rel: "noopener noreferrer nofollow" } : { target: attribs.target === "_blank" ? "_blank" : "" }),
        },
      };
    },
    img: (tagName, attribs) => ({ tagName, attribs: { ...attribs, loading: "lazy" } }),
  },
  exclusiveFilter: (frame) => frame.tag === "a" && !frame.attribs.href,
};

export function sanitizeRichText(html: string): string {
  return sanitizeHtml(html ?? "", options).trim();
}

/** Plain text only — for user-submitted fields rendered outside React. */
export function sanitizePlain(input: string): string {
  return sanitizeHtml(input ?? "", { allowedTags: [], allowedAttributes: {} }).trim();
}

/** Adds ids to h2/h3 headings so articles can render a table of contents. */
export function withHeadingAnchors(html: string): { html: string; toc: { id: string; text: string; level: number }[] } {
  const toc: { id: string; text: string; level: number }[] = [];
  const used = new Set<string>();
  const out = html.replace(/<(h[23])>([\s\S]*?)<\/\1>/g, (_m, tag: string, inner: string) => {
    const text = inner.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").trim();
    let id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "section";
    let n = 2;
    while (used.has(id)) id = `${id}-${n++}`;
    used.add(id);
    toc.push({ id, text, level: tag === "h2" ? 2 : 3 });
    return `<${tag} id="${id}">${inner}</${tag}>`;
  });
  return { html: out, toc };
}
