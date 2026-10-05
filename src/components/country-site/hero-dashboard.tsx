import type { SiteData } from "@/content/country-sites/site/sitedata";
import { fromCategory, growth360 } from "@/content/country-sites/us/model";
import { money, setMoney } from "@/content/country-sites/us/money";

/** Animated “results” card built from the same model as the calculator (source: Site.tsx HeroDashboard). */
export function HeroDashboard({ data }: { data: SiteData }) {
  setMoney(data.calc.symbol, data.calc.locale);
  const pts = growth360(fromCategory(data.calc.categories.find((c) => c.id === data.heroExample.cat)!, 1500));
  const a = pts[0];
  const z = pts[11];
  const line = (vals: number[]) => {
    const mx = Math.max(...vals);
    const mn = Math.min(...vals);
    return vals.map((v, i) => `${(i / 11) * 300},${110 - ((v - mn) / (mx - mn || 1)) * 96}`).join(" ");
  };
  const rows: [string, string, string][] = [
    ["Calls a month", String(Math.round(a.callsTyp)), String(Math.round(z.callsAds + z.callsOrganic))],
    ["Page-1 keywords", String(Math.round(a.keywords)), String(Math.round(z.keywords))],
    ["Google reviews", String(Math.round(a.reviews)), String(Math.round(z.reviews))],
  ];
  return (
    <div className="hero-dash" aria-label={`${data.heroExample.label}: growth after 12 months with Jarz Digital`}>
      <div className="hd-top">
        <span className="dot" />
        {data.heroExample.label}
      </div>
      <div className="hd-big">
        <span>Monthly revenue</span>
        <b>{money(z.revenue)}</b>
        <em>+{Math.round((z.revenue / a.revenueTyp - 1) * 100)}% in 12 months</em>
      </div>
      <svg viewBox="0 0 300 116" className="hd-chart" aria-hidden>
        <polyline points={line(pts.map((p) => p.revenue))} pathLength={1} />
      </svg>
      <ul>
        {rows.map(([l, b, c]) => (
          <li key={l}>
            <span>{l}</span>
            <s>{b}</s>
            <b>{c}</b>
          </li>
        ))}
      </ul>
      <p className="hd-note">Illustration from our calculator. Your numbers depend on your market.</p>
    </div>
  );
}
