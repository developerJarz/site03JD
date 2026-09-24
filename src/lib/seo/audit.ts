/**
 * Lightweight on-page SEO checks for the admin audit. Limits follow what
 * Google typically shows in results (~60 title / ~160 description characters).
 */
export const TITLE_MAX = 60;
export const TITLE_MIN = 30;
export const DESC_MAX = 160;
export const DESC_MIN = 70;

export type IssueLevel = "error" | "warning" | "info";
export interface SeoIssue {
  level: IssueLevel;
  message: string;
}

export interface AuditInput {
  key: string;
  label: string;
  /** Title as it appears in search results (site suffix included). */
  fullTitle: string;
  description: string;
  noindex: boolean;
}

export function applyTemplate(title: string, template: string, absolute = false) {
  return absolute || !template.includes("%s") ? title : template.replace("%s", title);
}

export function auditPage(p: AuditInput): SeoIssue[] {
  const issues: SeoIssue[] = [];
  const t = p.fullTitle.trim().length;
  const d = p.description.trim().length;
  // Hidden pages never appear in results, so length checks don’t apply.
  if (p.noindex) return [{ level: "info", message: "Hidden from search engines (noindex)." }];
  if (t > TITLE_MAX) issues.push({ level: "warning", message: `Title is ${t} characters — Google may cut it off after about ${TITLE_MAX}.` });
  else if (t < TITLE_MIN) issues.push({ level: "warning", message: `Title is only ${t} characters — add the main keyword or location.` });
  if (!d) issues.push({ level: "error", message: "No meta description." });
  else if (d > DESC_MAX) issues.push({ level: "warning", message: `Description is ${d} characters — may be cut off after about ${DESC_MAX}.` });
  else if (d < DESC_MIN) issues.push({ level: "warning", message: `Description is only ${d} characters — aim for ${DESC_MIN}–${DESC_MAX}.` });
  return issues;
}

/** Audits every page and flags titles/descriptions shared by more than one indexable page. */
export function auditAll(pages: AuditInput[]): Map<string, SeoIssue[]> {
  const out = new Map(pages.map((p) => [p.key, auditPage(p)]));
  const indexable = pages.filter((p) => !p.noindex);
  for (const field of ["fullTitle", "description"] as const) {
    const groups = new Map<string, AuditInput[]>();
    for (const p of indexable) {
      const v = p[field].trim().toLowerCase();
      if (v) groups.set(v, [...(groups.get(v) ?? []), p]);
    }
    for (const group of groups.values()) {
      if (group.length < 2) continue;
      for (const p of group) {
        const others = group.filter((g) => g.key !== p.key).map((g) => `“${g.label}”`);
        out.get(p.key)!.push({ level: "warning", message: `Same ${field === "fullTitle" ? "title" : "description"} as ${others.join(", ")}.` });
      }
    }
  }
  return out;
}
