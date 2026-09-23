"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, ChevronDown, Menu, Search, UserRound } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Magnetic } from "@/components/animations";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";
import { MobileMenu } from "./mobile-menu";
import { SearchOverlay } from "./search-overlay";
import { PRIMARY_LINKS, type NavData } from "./types";

type MenuKey = "services" | "industries";

function useAccount() {
  const [account, setAccount] = useState<{ name: string; staff: boolean } | null>(null);
  useEffect(() => {
    let active = true;
    fetch("/api/auth/me", { credentials: "same-origin" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => active && d?.user && setAccount({ name: d.user.name, staff: d.user.staff }))
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);
  return account;
}

export function Navbar({ data }: { data: NavData }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState<MenuKey | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const account = useAccount();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menus on navigation (state adjusted during render, not in an effect).
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(null);
    setMobileOpen(false);
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const openMenu = useCallback((key: MenuKey) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(key);
  }, []);
  const scheduleClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(null), 140);
  }, []);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const groups = Array.from(new Set(data.services.map((s) => s.group)));

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-ink-900">
        Skip to content
      </a>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500",
          scrolled || open ? "border-b border-white/[0.07] bg-ink-950/90 backdrop-blur-xl backdrop-saturate-150" : "border-b border-transparent bg-transparent",
        )}
        onMouseLeave={scheduleClose}
      >
        <div className={cn("container-page flex items-center justify-between gap-6 transition-[height] duration-500 ease-[var(--ease-out-expo)]", scrolled ? "h-16" : "h-[76px]")}>
          <Logo tone="dark" />

          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {PRIMARY_LINKS.map((link) => (
                <li key={link.href} className="relative" onMouseEnter={() => (link.menu ? openMenu(link.menu) : scheduleClose())}>
                  {link.menu ? (
                    <button
                      type="button"
                      aria-expanded={open === link.menu}
                      aria-controls={`menu-${link.menu}`}
                      onClick={() => setOpen(open === link.menu ? null : link.menu!)}
                      className={cn(
                        "flex items-center gap-1 rounded-full px-3.5 py-2 text-[0.92rem] transition-colors",
                        isActive(link.href) || open === link.menu ? "text-white" : "text-white/70 hover:text-white",
                      )}
                    >
                      {link.label}
                      <ChevronDown className={cn("size-3.5 transition-transform duration-300", open === link.menu && "rotate-180")} aria-hidden />
                    </button>
                  ) : (
                    <Link
                      href={link.href}
                      aria-current={isActive(link.href) ? "page" : undefined}
                      className={cn("block rounded-full px-3.5 py-2 text-[0.92rem] transition-colors", isActive(link.href) ? "text-white" : "text-white/70 hover:text-white")}
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex h-10 items-center gap-2 rounded-full px-3 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Search the site (Ctrl+K)"
            >
              <Search className="size-[18px]" aria-hidden />
              <kbd className="hidden rounded border border-white/15 px-1.5 font-mono text-[10px] text-white/50 xl:inline">⌘K</kbd>
            </button>
            <Link
              href={account ? (account.staff ? "/admin" : "/dashboard") : "/login"}
              className="hidden h-10 items-center gap-2 rounded-full px-3 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white md:flex"
            >
              <UserRound className="size-[18px]" aria-hidden />
              <span className="hidden xl:inline">{account ? "Dashboard" : "Sign in"}</span>
            </Link>
            <Magnetic className="hidden sm:block">
              <ButtonLink href="/contact?intent=project" size="sm" arrow className="h-10 px-5">
                Start a Project
              </ButtonLink>
            </Magnetic>
            <button
              type="button"
              className="flex size-10 items-center justify-center rounded-full text-white hover:bg-white/10 lg:hidden"
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="size-5" aria-hidden />
            </button>
          </div>
        </div>

        {/* Mega menus */}
        <AnimatePresence>
          {open && (
            <motion.div
              key={open}
              id={`menu-${open}`}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8, transition: { duration: 0.15 } }}
              transition={{ duration: 0.35 }}
              className="absolute inset-x-0 top-full hidden border-b border-white/[0.07] bg-ink-950/95 backdrop-blur-xl lg:block"
              onMouseEnter={() => openMenu(open)}
            >
              <div className="container-page py-10">
                {open === "services" ? (
                  <div className="grid grid-cols-12 gap-10">
                    {groups.map((group) => (
                      <div key={group} className="col-span-4">
                        <p className="eyebrow mb-4 text-white/40">{group}</p>
                        <ul className="space-y-1">
                          {data.services
                            .filter((s) => s.group === group)
                            .map((s) => (
                              <li key={s.slug}>
                                <Link href={`/services/${s.slug}`} className="group flex items-start gap-4 rounded-2xl p-3 transition-colors hover:bg-white/[0.05]">
                                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-brand-300 transition-colors group-hover:border-brand-400/40 group-hover:text-brand-200">
                                    <Icon name={s.icon} className="size-5" />
                                  </span>
                                  <span>
                                    <span className="block text-[0.95rem] font-medium text-white">{s.title}</span>
                                    <span className="mt-0.5 block text-sm leading-snug text-white/50">{s.tagline}</span>
                                  </span>
                                </Link>
                              </li>
                            ))}
                        </ul>
                      </div>
                    ))}
                    <div className="col-span-4">
                      <Link href="/pricing" className="group relative flex h-full min-h-56 flex-col justify-end overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-brand-500/25 via-ink-800 to-ink-900 p-6">
                        <div aria-hidden className="absolute inset-0 bg-grid opacity-60 mask-radial" />
                        <p className="eyebrow relative text-brand-200">Transparent pricing</p>
                        <p className="relative mt-3 font-display text-2xl font-semibold tracking-tight text-white">Plans from $40/month.</p>
                        <p className="relative mt-2 text-sm text-white/60">Compare every package side by side.</p>
                        <span className="relative mt-5 inline-flex items-center gap-2 text-sm font-medium text-white">
                          View pricing <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
                        </span>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="mb-6 flex items-end justify-between">
                      <p className="eyebrow text-white/40">Web design & growth by industry</p>
                      <Link href="/industries" className="link-underline text-sm text-white/70 hover:text-white">
                        Explore all industries →
                      </Link>
                    </div>
                    <ul className="grid grid-cols-4 gap-1">
                      {data.industries.map((i) => (
                        <li key={i.slug}>
                          <Link href={`/industries/${i.slug}`} className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-white/75 transition-colors hover:bg-white/[0.05] hover:text-white">
                            <Icon name={i.icon} className="size-4 text-brand-300/80 transition-colors group-hover:text-brand-200" />
                            <span className="text-[0.92rem]">{i.name}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} data={data} account={account} onSearch={() => setSearchOpen(true)} />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
