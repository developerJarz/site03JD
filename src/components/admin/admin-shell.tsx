"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  Bell,
  Briefcase,
  Building2,
  ExternalLink,
  File,
  Folder,
  Globe,
  HelpCircle,
  History,
  Image as ImageIcon,
  Inbox,
  KanbanSquare,
  LayoutDashboard,
  LogOut,
  Menu,
  Newspaper,
  PenLine,
  Quote,
  Search,
  Settings,
  Shield,
  Sparkles,
  Tag,
  User,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { Suspense, useEffect, useState, type ReactNode } from "react";
import { logoutAction } from "@/lib/actions/auth";
import { can } from "@/lib/auth/permissions";
import type { Role } from "@/models/shared";
import { cn, initials } from "@/lib/utils";
import { CommandPalette } from "./command-palette";
import { ADMIN_NAV } from "./nav";

const ICONS: Record<string, LucideIcon> = {
  "layout-dashboard": LayoutDashboard,
  file: File,
  newspaper: Newspaper,
  folder: Folder,
  tag: Tag,
  sparkles: Sparkles,
  briefcase: Briefcase,
  building: Building2,
  users: Users,
  quote: Quote,
  help: HelpCircle,
  inbox: Inbox,
  kanban: KanbanSquare,
  user: User,
  shield: Shield,
  pen: PenLine,
  image: ImageIcon,
  globe: Globe,
  search: Search,
  settings: Settings,
  history: History,
  bell: Bell,
};

export interface AdminShellProps {
  user: { name: string; email: string; role: Role };
  counts: { leads: number; requests: number; notifications: number };
  dbReady: boolean;
  children: ReactNode;
}

function NavLinks({ role, counts, onNavigate }: { role: Role; counts: AdminShellProps["counts"]; onNavigate?: () => void }) {
  const pathname = usePathname();
  const search = useSearchParams();
  const current = pathname + (search.size ? `?${search}` : "");

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    if (href.includes("?")) return current === href;
    if (href === "/admin/users") return pathname.startsWith("/admin/users") && !search.get("role");
    if (href === "/admin/seo") return pathname === "/admin/seo";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <nav aria-label="Admin" className="space-y-6">
      {ADMIN_NAV.map((group) => {
        const items = group.items.filter((i) => can(role, i.permission));
        if (!items.length) return null;
        return (
          <div key={group.label || "root"}>
            {group.label && <p className="mb-2 px-3 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-white/35">{group.label}</p>}
            <ul className="space-y-0.5">
              {items.map((item) => {
                const I = ICONS[item.icon] ?? File;
                const active = isActive(item.href);
                const badge = item.badge ? counts[item.badge] : 0;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                        active ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/[0.05] hover:text-white",
                      )}
                    >
                      <I className={cn("size-4", active ? "text-brand-300" : "text-white/40 group-hover:text-white/70")} aria-hidden />
                      <span className="flex-1">{item.label}</span>
                      {badge > 0 && (
                        <span className="rounded-full bg-brand-500 px-1.5 text-[0.7rem] font-semibold text-ink-950" aria-label={`${badge} new`}>
                          {badge > 99 ? "99+" : badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}

function SidebarContent({ user, counts, onNavigate }: Omit<AdminShellProps, "children" | "dbReady"> & { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2.5 px-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/brand/mark.png" alt="" className="size-7" />
        <span className="font-display text-[1.05rem] font-semibold tracking-tight text-white">Jarz Digital</span>
        <span className="ml-auto rounded-md bg-white/10 px-1.5 py-0.5 text-[0.65rem] font-medium uppercase tracking-wider text-white/60">{user.role}</span>
      </div>
      <div className="flex-1 overflow-y-auto px-3 pb-6 pt-2">
        <Suspense>
          <NavLinks role={user.role} counts={counts} onNavigate={onNavigate} />
        </Suspense>
      </div>
      <div className="border-t border-white/10 p-3">
        <Link href="/" target="_blank" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/60 hover:bg-white/[0.05] hover:text-white">
          <ExternalLink className="size-4" aria-hidden /> View website
        </Link>
      </div>
    </div>
  );
}

export function AdminShell({ user, counts, dbReady, children }: AdminShellProps) {
  const [drawer, setDrawer] = useState(false);
  const [palette, setPalette] = useState(false);
  const [menu, setMenu] = useState(false);
  const pathname = usePathname();

  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setDrawer(false);
  }
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPalette((v) => !v);
      }
      if (e.key === "Escape") {
        setDrawer(false);
        setMenu(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="min-h-dvh bg-mist-50">
      <a href="#admin-main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2">
        Skip to content
      </a>

      {/* Desktop sidebar */}
      <aside className="theme-dark fixed inset-y-0 left-0 z-40 hidden w-64 bg-ink-950 lg:block">
        <SidebarContent user={user} counts={counts} />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {drawer && (
          <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Admin menu">
            <motion.div className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDrawer(false)} />
            <motion.aside
              className="theme-dark absolute inset-y-0 left-0 w-72 bg-ink-950 shadow-2xl"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
            >
              <button onClick={() => setDrawer(false)} className="absolute right-3 top-3 rounded-lg p-2 text-white/60 hover:bg-white/10" aria-label="Close menu">
                <X className="size-4" />
              </button>
              <SidebarContent user={user} counts={counts} onNavigate={() => setDrawer(false)} />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-mist-200 bg-white/85 px-4 backdrop-blur-xl sm:px-6">
          <button onClick={() => setDrawer(true)} className="rounded-lg p-2 text-mist-600 hover:bg-mist-100 lg:hidden" aria-label="Open menu">
            <Menu className="size-5" />
          </button>
          <button
            onClick={() => setPalette(true)}
            className="flex h-10 flex-1 items-center gap-3 rounded-xl border border-mist-200 bg-mist-50 px-3 text-left text-sm text-mist-500 transition-colors hover:border-mist-300 sm:max-w-md"
          >
            <Search className="size-4" aria-hidden />
            <span className="flex-1 truncate">Search or jump to…</span>
            <kbd className="hidden rounded border border-mist-200 bg-white px-1.5 font-mono text-[10px] sm:inline">Ctrl K</kbd>
          </button>
          <div className="ml-auto flex items-center gap-1">
            <Link href="/admin/notifications" className="relative rounded-lg p-2.5 text-mist-600 hover:bg-mist-100" aria-label={`Notifications${counts.notifications ? ` (${counts.notifications} unread)` : ""}`}>
              <Bell className="size-5" aria-hidden />
              {counts.notifications > 0 && <span className="absolute right-2 top-2 size-2 rounded-full bg-brand-500 ring-2 ring-white" />}
            </Link>
            <div className="relative">
              <button onClick={() => setMenu((m) => !m)} className="flex items-center gap-2 rounded-xl p-1.5 hover:bg-mist-100" aria-expanded={menu} aria-haspopup="menu">
                <span className="flex size-8 items-center justify-center rounded-lg bg-ink-900 text-xs font-semibold text-brand-300">{initials(user.name)}</span>
                <span className="hidden text-left text-sm leading-tight md:block">
                  <span className="block font-medium text-ink-900">{user.name}</span>
                  <span className="block text-xs text-mist-500">{user.email}</span>
                </span>
              </button>
              <AnimatePresence>
                {menu && (
                  <motion.div
                    role="menu"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-mist-200 bg-white py-1 shadow-lift"
                  >
                    <Link role="menuitem" href="/dashboard/profile" className="block px-4 py-2 text-sm text-mist-700 hover:bg-mist-50" onClick={() => setMenu(false)}>
                      My profile
                    </Link>
                    <Link role="menuitem" href="/dashboard/settings" className="block px-4 py-2 text-sm text-mist-700 hover:bg-mist-50" onClick={() => setMenu(false)}>
                      Account settings
                    </Link>
                    <form action={logoutAction}>
                      <button role="menuitem" type="submit" className="flex w-full items-center gap-2 border-t border-mist-100 px-4 py-2 text-left text-sm text-danger-500 hover:bg-danger-50">
                        <LogOut className="size-4" aria-hidden /> Sign out
                      </button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {!dbReady && (
          <div className="border-b border-amber-200 bg-warning-50 px-6 py-2.5 text-sm text-amber-900" role="alert">
            Database not configured — set MONGODB_URI to enable the CMS.
          </div>
        )}

        <main id="admin-main" className="mx-auto w-full max-w-[1400px] px-4 py-8 sm:px-6 lg:px-10">
          {children}
        </main>
      </div>

      <CommandPalette open={palette} onClose={() => setPalette(false)} role={user.role} />
    </div>
  );
}
