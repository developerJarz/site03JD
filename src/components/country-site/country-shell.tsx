"use client";

import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import "./country.css";

export interface ShellSection {
  id: string;
  label: string;
  icon: keyof typeof ICONS;
  /** The calculator: highlighted in the menu and offered as the shortcut on phones. */
  hot?: boolean;
}

const ICONS = {
  home: <path d="M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z" />,
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </>
  ),
  calc: (
    <>
      <rect x="5" y="2.5" width="14" height="19" rx="2.5" />
      <path d="M8 6.5h8M8.5 11h.01M12 11h.01M15.5 11h.01M8.5 14.5h.01M12 14.5h.01M15.5 14.5h.01M8.5 18h.01M12 18h3.5" />
    </>
  ),
  trend: <path d="M3 17l6-6 4 4 8-8M15 7h6v6" />,
  chart: <path d="M4 20V10m6 10V4m6 16v-7m6 7H2" />,
  person: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
  star: <path d="m12 3 2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6-4.5-4.2 6.1-.7z" />,
  steps: <path d="M4 6h4v4H4zM10 14h4v4h-4zM16 6h4v4h-4zM8 8h8M12 10v4" />,
  tag: <path d="M3 12V4h8l10 10-8 8L3 12zM7.5 7.5h.01" />,
  pin: <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21zm0-9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" />,
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </>
  ),
  ask: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6M12 17h.01" />
    </>
  ),
  go: <path d="M5 12h14m-6-6 6 6-6 6" />,
};

/**
 * The proposal page's reading shell for a country or city page: a sticky contents sidebar with a
 * progress rail on desktop; below 1024px a compact section bar that opens the same contents as a drawer.
 * The page itself is server-rendered and passed in as children.
 */
export function CountryShell({
  kicker,
  title,
  sections,
  whatsappHref,
  children,
}: {
  kicker: string;
  title: string;
  sections: ShellSection[];
  whatsappHref: string;
  children: ReactNode;
}) {
  const [active, setActive] = useState(sections[0].id);
  const [progress, setProgress] = useState(0);
  const [drawer, setDrawer] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const hot = sections.find((s) => s.hot);
  const ids = sections.map((s) => s.id).join(" ");

  // highlight the menu item for the section in view
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (vis) setActive(vis.target.id);
      },
      { rootMargin: "-35% 0px -55% 0px" },
    );
    ids.split(" ").forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [ids]);

  // reading progress through the page (drives the sidebar rail and the section bar)
  useEffect(() => {
    let raf = 0;
    const measure = () => {
      raf = 0;
      const el = root.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      setProgress(span > 0 ? Math.min(1, Math.max(0, -r.top / span)) : 1);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  // drawer: lock page scroll, close on Escape, hand focus back to the trigger
  useEffect(() => {
    if (!drawer) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDrawer(false);
    window.addEventListener("keydown", onKey);
    document.querySelector<HTMLElement>(".jdc .drawer .side-nav a")?.focus();
    const btn = trigger.current;
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      btn?.focus({ preventScroll: true });
    };
  }, [drawer]);

  const go = (id: string) => {
    setDrawer(false);
    // next frame: the drawer's scroll lock is released first
    requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };
  const current = sections.find((s) => s.id === active) ?? sections[0];
  const nav = <SideNav sections={sections} active={active} progress={progress} go={go} />;
  const head = (
    <div className="side-head">
      <span>{kicker}</span>
      <b>{title}</b>
    </div>
  );
  const foot = (
    <div className="side-foot">
      <a className="side-link" href="#audit" onClick={(e) => (e.preventDefault(), go("audit"))}>
        <svg viewBox="0 0 24 24" aria-hidden>
          <path d="M9 11l3 3 8-8M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9" />
        </svg>
        What the free audit includes
      </a>
      <a className="btn primary side-cta" href={whatsappHref} target="_blank" rel="noopener noreferrer">
        Chat on WhatsApp
      </a>
    </div>
  );

  return (
    <div ref={root} className="jdc site">
      <div className="shell">
        <aside className="side" aria-label="Page contents">
          {head}
          {nav}
          {foot}
        </aside>

        <div className="content">
          {/* phones & tablets: current section + progress; opens the contents drawer */}
          <div className="cbar">
            <button ref={trigger} className="cbar-btn" onClick={() => setDrawer(true)} aria-expanded={drawer} aria-controls="jdc-drawer">
              <svg viewBox="0 0 24 24" aria-hidden>
                <path d="M4 6h16M4 12h10M4 18h16" />
              </svg>
              <span className="cbar-txt">
                <small>Contents</small>
                <b>{current.label}</b>
              </span>
            </button>
            {hot && active !== hot.id && (
              <button className="cbar-cta" onClick={() => go(hot.id)}>
                Calculator
              </button>
            )}
            <span className="cbar-progress" aria-hidden>
              <i style={{ transform: `scaleX(${progress})` }} />
            </span>
          </div>
          <div className="main">{children}</div>
        </div>
      </div>

      <div className={`drawer-veil ${drawer ? "open" : ""}`} onClick={() => setDrawer(false)} aria-hidden />
      <div id="jdc-drawer" className={`drawer ${drawer ? "open" : ""}`} role="dialog" aria-modal="true" aria-label="Page contents" inert={!drawer}>
        <div className="drawer-top">
          {head}
          <button className="drawer-x" onClick={() => setDrawer(false)} aria-label="Close contents">
            ×
          </button>
        </div>
        {nav}
        {foot}
      </div>
    </div>
  );
}

function SideNav({ sections, active, progress, go }: { sections: ShellSection[]; active: string; progress: number; go: (id: string) => void }) {
  const click = (id: string) => (e: MouseEvent) => {
    e.preventDefault();
    go(id);
  };
  return (
    <nav className="side-nav" aria-label="Page contents">
      <div className="side-list">
        <span className="side-rail" aria-hidden>
          <i style={{ transform: `scaleY(${progress})` }} />
        </span>
        <ol>
          {sections.map((s, i) => (
            <li key={s.id}>
              <a href={`#${s.id}`} className={`${active === s.id ? "on" : ""} ${s.hot ? "hot" : ""}`} aria-current={active === s.id ? "location" : undefined} onClick={click(s.id)}>
                <svg viewBox="0 0 24 24" aria-hidden>
                  {ICONS[s.icon]}
                </svg>
                <span>{s.label}</span>
                <em>{String(i + 1).padStart(2, "0")}</em>
              </a>
            </li>
          ))}
        </ol>
      </div>
      <p className="side-pct">{Math.round(progress * 100)}% read</p>
    </nav>
  );
}
