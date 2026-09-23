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

const U = "wp-content/uploads/";

/** [destination, ...candidate source paths relative to the site root] */
const ASSETS = [
  // Brand
  ["brand/logo.png", `${U}2024/12/Jard-Digital-logo-sideclear.png`],
  ["brand/mark.png", `${U}2024/12/cropped-Jard-Digital-logo-sideclear-270x270.png`],

  // Portfolio — website builds (1137x798 device mockups)
  ["work/creative-tree-web.webp", `${U}2025/06/Creative-tree-and-stump-llc-jarz-digital.webp`],
  ["work/quirky-cart-web.webp", `${U}2025/06/Quirky-Cart-jarz-digital.webp`],
  ["work/cravin-crabs-web.webp", `${U}2025/06/cravin-crabs-baltimore-jarz-digital.webp`],
  ["work/doorstep-spa-web.webp", `${U}2025/06/doorstep-spa-jarz-digital.webp`],
  ["work/fire-wood-web.webp", `${U}2025/06/fire-wood-jarz-digital.webp`],
  ["work/pride-customizing-web.webp", `${U}2025/06/pride-car-miami-jarz-digital.webp`],
  ["work/puff-picks-web.webp", `${U}2025/06/puff-picks-jarz-digital.webp`],
  ["work/rides-on-time-web.webp", `${U}2025/06/rides-on-time-san-diego-jarz-digital.webp`],
  ["work/jarz-digital-web.webp", `${U}2025/06/jarzdigital.com_.webp`],

  // Portfolio — business management
  ["work/cravin-crabs-management.webp", `${U}2025/06/cravin-crabs-business-management-jarz-digital-01-1.webp`],
  ["work/creative-tree-management.webp", `${U}2025/06/creative-tree-business-management-jarz-digital-04-1.webp`],
  ["work/pride-customizing-management.webp", `${U}2025/06/pride-car-customizing-miami-business-management-jarz-digital-03-1.webp`],
  ["work/richmond-hill-management.webp", `${U}2025/06/richmond-hill-auto-repair-business-management-jarz-digital-06-1.webp`],
  ["work/rides-on-time-management.webp", `${U}2025/06/rides-on-time-business-management-jarz-digital-05-1.webp`],
  ["work/yonge-rehab-management.webp", `${U}2025/06/yonge-rehab-business-management-jarz-digital-02-1.webp`],

  // Portfolio — social media marketing
  ["work/cravin-crabs-social.webp", `${U}2025/06/cravin-crabs-social-media-marketing-jarz-digital-01.webp`],
  ["work/creative-tree-social.webp", `${U}2025/06/creative-tree-social-media-marketing-jarz-digital-02.webp`],
  ["work/rides-on-time-social.webp", `${U}2025/06/rides-on-time-social-media-marketing-jarz-digital-03.webp`],
  ["work/yonge-rehab-social.webp", `${U}2025/06/yonge-rehab-social-media-marketing-jarz-digital-04.webp`],

  // Portfolio — SEO ranking
  ["work/rides-on-time-seo.webp", `${U}2025/07/rides-on-time-SEO-ranking-jarz-digital-01.webp`],
  ["work/cravin-crabs-seo.webp", `${U}2025/07/cravin-crabs-SEO-ranking-jarz-digital-02.webp`],
  ["work/creative-tree-seo.webp", `${U}2025/07/creative-tree-SEO-ranking-jarz-digital-03.webp`],
  ["work/pride-customizing-seo.webp", `${U}2025/07/pride-car-customizing-SEO-ranking-jarz-digital-04.webp`],
  ["work/commercial-roofing-seo.png", `${U}2025/07/commercial-roofing-SEO-ranking-jarz-digital-04.png`],
  ["work/cravin-crabs-seo-2.png", `${U}2025/07/cravin-crabs-2-SEO-ranking-jarz-digital-04.png`],

  // Before / after redesigns
  ["before-after/rides-on-time.png", `${U}2025/07/before-after-image-JD-airport-transfer-min.png`],
  ["before-after/cravin-crabs.png", `${U}2025/07/before-after-image-JD-cravin-crabs-min.png`],
  ["before-after/blissful.png", `${U}2025/07/before-after-image-JD-main-file-blissful.png`],
  ["before-after/puff-picks.png", `${U}2025/07/before-after-image-JD-main-file-puff-picks.png`],
  ["before-after/yonge-rehab.png", `${U}2025/07/before-after-image-JD-yonge-rehab-min.png`],

  // Team (Elementor thumbnails are the only published crops)
  ["team/rokonuzzaman-jony.png", `${U}elementor/thumbs/CEO-r8dirmvp5khsb6fmxkbgxhngiimjoazpnws8epaqu4.png`],
  ["team/shawn.png", `${U}elementor/thumbs/Sawon-r93qe886jtoamo93j1fzcmnuobwb5uw36qgemqrf4s.png`],
  ["team/asad.png", `${U}elementor/thumbs/PP-03-scaled-r8dfhwlf5lbw5ffze6ao4p6204wil2m0h77vi1uw64.png`],
  ["team/shahriar.webp", `${U}elementor/thumbs/NOBIN-PIC-r8f2zcgl9osufwvqvtogobayi20isrzdkcizo2q0kc.webp`],
  ["team/ammar-mazrui.jpg", `${U}elementor/thumbs/c8694ce1-52ac-49e9-9381-67aa55fffc91-r8crznic68vhjuo7wvlfsqxcopz1n41qgn1m6uls2k.jpg`],
  ["team/salman-hafiz.png", `${U}elementor/thumbs/DEV-Shuvo-e1752097017790-r8iusako49egxjeuv3k7gls89t0iagrkee3vmxtxek.png`],
  ["team/abir.png", `${U}elementor/thumbs/SEO-expert-USA-r8f7t9jjt4vsmi96bi2eixcbdmsg0nfft609c6una4.png`],
  ["team/fardin.webp", `${U}elementor/thumbs/Fardin-video-editor-global-e1752097591982-r8iv7a4135x21pn5cks27tmt8z570q9hskkl3rly70.webp`],
  ["team/denial.png", `${U}elementor/thumbs/PP-04-scaled-r8dfghu4wjeeqhhpmkcte1z5xbup1f0ia7znl3y5i4.png`],

  // Client logos that were published on the homepage
  ["clients/client-06.png", `${U}2025/07/6-1.png`],
  ["clients/client-12.png", `${U}2025/07/12-1.png`],
  ["clients/client-18.png", `${U}2025/07/18.png`],
  ["clients/client-27.png", `${U}2025/07/27.png`],

  // Service artwork (square covers used on the service pages)
  ["services/business-management.webp", `${U}2025/10/Full-Business-Management-Package-square.webp`],
  ["services/local-seo.webp", `${U}2025/10/Dominate-Your-Local-Market-SEO-square.webp`],
  ["services/website-development.webp", `${U}2025/10/Professional-Website-Development-square.webp`],
  ["services/website-seo.webp", `${U}2025/10/Professional-Website-SEO-square.webp`],
  ["services/social-media-marketing.webp", `${U}2025/10/Social-Media-Marketing-Services_-square.webp`],
  ["services/advertising.webp", `${U}2025/10/Advertising-Services-square.webp`],
  ["services/web-application-development.webp", `${U}2025/10/Web-Application-Development-square.webp`],
  ["services/software-development.webp", `${U}2025/10/Software-Development-square.webp`],

  // Platform logos
  ["platforms/wordpress.png", `${U}2025/06/WordPress-scaled.png`],
  ["platforms/shopify.png", `${U}2025/06/Shopify-scaled.png`],
  ["platforms/laravel.png", `${U}2025/06/Laravel-scaled.png`],

  // Blog covers
  ["blog/why-local-seo-is-a-game-changer-for-dallas.webp", `${U}2025/10/Why-Local-SEO-is-a-Game-Changer-for-Businesses-in-Dallas-Boost-Your-Online-Visibility-1.webp`],
  ["blog/how-to-rank-1-on-google-map-dallas.webp", `${U}2025/10/How-to-Rank-1-on-Google-Map-for-Your-Dallas-Business-The-Ultimate-Local-SEO-Guide-1.webp`],
  ["blog/how-to-open-a-google-business-profile.webp", `${U}2025/10/How-to-Open-a-Google-Business-Profile-A-Step-by-Step-Guide-for-Local-Businesses-1.webp`],
  ["blog/how-to-rank-your-junk-car-buyer-business.webp", `${U}2025/10/How-to-Rank-Your-Junk-Car-Buyer-Business-on-Google-Map.webp`, `${U}2025/10/How-to-Rank-Your-Junk-Car-Buyer-Business-on-Google-Map-700x700.webp`],
  ["blog/why-website-local-seo-is-important.webp", `${U}2025/10/Why-Website-Local-SEO-is-Important-for-Your-Business-Growth.webp`, `${U}2025/10/Why-Website-Local-SEO-is-Important-for-Your-Business-Growth-1024x683.webp`],
  ["blog/why-map-ranking-is-crucial.webp", `${U}2025/10/Why-Map-Ranking-is-Crucial-for-Small-Businesses-in-2025.webp`, `${U}2025/10/Why-Map-Ranking-is-Crucial-for-Small-Businesses-in-2025-1024x683.webp`],
  ["blog/why-full-business-management-package.webp", `${U}2025/11/Why-Our-Full-Business-Management-Service-Package-is-Essential-for-Your-Business-Growth.webp`, `${U}2025/11/Why-Our-Full-Business-Management-Service-Package-is-Essential-for-Your-Business-Growth-1024x576.webp`],
  ["blog/why-small-business-owners-should-invest.webp", `${U}2025/11/Why-Small-Business-Owners-Should-Invest-in-Our-Monthly-Business-Management-Package.webp`, `${U}2025/11/Why-Small-Business-Owners-Should-Invest-in-Our-Monthly-Business-Management-Package-1024x576.webp`],

  // Process / section artwork from the homepage
  ["process/planning.png", `${U}2025/07/Planning-1.png`],
  ["process/website-development.png", `${U}2025/07/Website-Development-3.png`],
  ["process/seo.png", `${U}2025/07/SEO-1.png`],
  ["process/local-seo.png", `${U}2025/07/Local-SEO-2.png`],
  ["process/social-media-marketing.png", `${U}2025/07/Social-Media-Marketing-1.png`],
  ["process/ads.png", `${U}2025/07/Ads-1.png`],
  ["misc/agency.webp", `${U}2025/07/jarz-digital-agency.webp`],
];

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
