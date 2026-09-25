#!/usr/bin/env node
/**
 * Asset migration: copies Jarz Digital media from the HTTrack mirror
 * (../jarzdigital.com) into public/images with clean, stable names.
 *
 * The mirror is never modified. Files that the mirror failed to download
 * (0-byte or missing) are fetched from the live site only when
 * `--fetch-missing` is passed.
 *
 *   node scripts/migrate-assets.mjs                 # local copy only
 *   node scripts/migrate-assets.mjs --fetch-missing # also recover gaps
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, "..");
const mirrorRoot = path.resolve(projectRoot, "..");
const siteRoot = path.join(mirrorRoot, "jarzdigital.com");
const outRoot = path.join(projectRoot, "public", "images");
const LIVE = "https://jarzdigital.com/";
const fetchMissing = process.argv.includes("--fetch-missing");

/** [destination, ...candidate source paths relative to the site root] — shared with the legacy image redirects in next.config.ts. */
const ASSETS = JSON.parse(fs.readFileSync(path.join(projectRoot, "src", "config", "legacy-uploads.json"), "utf8")).map((e) => [e.to, ...e.from]);

// City photography that was referenced from third-party hosts in the mirror.
const MIRROR_EXTRAS = [
  ["locations/dallas.jpg", "dallas.culturemap.com/media-library/dallas-skyline-with-reflectiond231.jpg"],
  ["locations/denver.jpeg", "cdn.prod.website-files.com/627d566bcae96660c41d12e1/627ea8487ee2b3bc6333dbc1_Denver.jpeg"],
  ["locations/calgary.jpg", "www.toniagara.com/blog/wp-content/uploads/2023/12/Calgary-Skyline-at-Dusk.jpg"],
];

function nonEmpty(file) {
  try {
    return fs.statSync(file).size > 0;
  } catch {
    return false;
  }
}

async function download(rel, dest) {
  const res = await fetch(LIVE + rel, { redirect: "follow" });
  if (!res.ok) return false;
  const type = res.headers.get("content-type") ?? "";
  if (!type.startsWith("image/")) return false;
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length === 0) return false;
  fs.writeFileSync(dest, buf);
  return true;
}

const report = { copied: [], downloaded: [], skipped: [], missing: [] };

async function place(dest, candidates, base, allowFetch) {
  const out = path.join(outRoot, dest);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  if (nonEmpty(out)) {
    report.skipped.push(dest);
    return;
  }
  for (const rel of candidates) {
    const src = path.join(base, rel);
    if (nonEmpty(src)) {
      fs.copyFileSync(src, out);
      report.copied.push(dest);
      return;
    }
  }
  if (allowFetch && fetchMissing) {
    for (const rel of candidates) {
      try {
        if (await download(rel, out)) {
          report.downloaded.push(dest);
          return;
        }
      } catch {
        /* try next candidate */
      }
    }
  }
  report.missing.push(dest);
}

for (const [dest, ...candidates] of ASSETS) await place(dest, candidates, siteRoot, true);
for (const [dest, rel] of MIRROR_EXTRAS) await place(dest, [rel], mirrorRoot, false);

const manifest = {
  generatedAt: new Date().toISOString(),
  available: [...report.copied, ...report.downloaded, ...report.skipped].sort(),
  missing: report.missing.sort(),
};
fs.writeFileSync(path.join(projectRoot, "src", "content", "asset-manifest.json"), JSON.stringify(manifest, null, 2));

console.log(`copied from mirror: ${report.copied.length}`);
console.log(`downloaded (missing in mirror): ${report.downloaded.length}`);
console.log(`already present: ${report.skipped.length}`);
if (report.missing.length) {
  console.log(`missing (${report.missing.length}):`);
  for (const m of report.missing) console.log("  -", m);
  if (!fetchMissing) console.log("Re-run with --fetch-missing to recover these from the live site.");
}
