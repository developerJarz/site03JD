"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Bell, FolderKanban, Home, Inbox, LayoutDashboard, LogOut, Menu, MessageSquare, Settings, Shield, UserRound, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { ButtonLink } from "@/components/ui/button";
import { logoutAction } from "@/lib/actions/auth";
import { cn, initials } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Overview", Icon: LayoutDashboard },
  { href: "/dashboard/projects", label: "My projects", Icon: FolderKanban },
  { href: "/dashboard/requests", label: "My requests", Icon: Inbox },
  { href: "/dashboard/messages", label: "Messages", Icon: MessageSquare, badge: "messages" as const },
  { href: "/dashboard/notifications", label: "Notifications", Icon: Bell, badge: "notifications" as const },
  { href: "/dashboard/profile", label: "Profile", Icon: UserRound },
  { href: "/dashboard/settings", label: "Settings", Icon: Settings },
];

export interface DashboardShellProps {
  user: { name: string; email: string; staff: boolean };
  counts: { messages: number; notifications: number };
  children: ReactNode;
}

function Sidebar({ user, counts, onNavigate }: Omit<DashboardShellProps, "children"> & { onNavigate?: () => void }) {
  const pathname = usePathname();
  const active = (href: string) => (href === "/dashboard" ? pathname === href : pathname.startsWith(href));
  return (
    <div className="flex h-full flex-col">
      <Link href="/" className="flex h-[72px] items-center gap-2.5 px-6" aria-label="Jarz Digital — home">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/brand/mark.png" alt="" className="size-8" />
        <span className="font-display text-lg font-semibold tracking-tight text-white">Jarz Digital</span>
      </Link>
      <p className="eyebrow px-6 pb-3 pt-2 text-white/35">Client portal</p>
      <nav aria-label="Dashboard" className="flex-1 space-y-1 overflow-y-auto px-3">
        {NAV.map(({ href, label, Icon, badge }) => {
          const n = badge ? counts[badge] : 0;
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              aria-current={active(href) ? "page" : undefined}
              className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-[0.92rem] transition-colors", active(href) ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white")}
            >
              <Icon className={cn("size-[18px]", active(href) ? "text-brand-300" : "text-white/40")} aria-hidden />
              <span className="flex-1">{label}</span>
              {n > 0 && (
                <span className="rounded-full bg-brand-400 px-1.5 text-[0.7rem] font-semibold text-ink-950" aria-label={`${n} unread`}>
                  {n}
                </span>
              )}
            </Link>
          );
        })}
        {user.staff && (
          <Link href="/admin" className="mt-4 flex items-center gap-3 rounded-xl border border-white/10 px-3 py-2.5 text-[0.92rem] text-white/70 hover:bg-white/5 hover:text-white">
            <Shield className="size-[18px] text-brand-300" aria-hidden /> Admin dashboard
          </Link>
        )}
      </nav>
      <div className="m-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <p className="text-sm font-medium text-white">Have a new idea?</p>
        <p className="mt-1 text-xs text-white/50">Send us a brief — we respond within 24 hours.</p>
        <ButtonLink href="/dashboard/requests/new" size="sm" className="mt-3 w-full" onClick={onNavigate}>
          New request
        </ButtonLink>
      </div>
      <div className="flex items-center gap-3 border-t border-white/10 p-4">
        <span className="flex size-9 items-center justify-center rounded-full bg-brand-500 text-xs font-semibold text-ink-950">{initials(user.name)}</span>
        <span className="min-w-0 flex-1 leading-tight">
          <span className="block truncate text-sm font-medium text-white">{user.name}</span>
          <span className="block truncate text-xs text-white/45">{user.email}</span>
        </span>
        <form action={logoutAction}>
          <button type="submit" className="rounded-lg p-2 text-white/50 hover:bg-white/10 hover:text-white" aria-label="Sign out">
            <LogOut className="size-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

export function DashboardShell({ user, counts, children }: DashboardShellProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  return (
    <div className="min-h-dvh bg-mist-50">
      <a href="#dash-main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2">
        Skip to content
      </a>
      <aside className="theme-dark fixed inset-y-0 left-0 z-40 hidden w-72 bg-ink-950 lg:block">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-grid opacity-30 mask-fade-b" />
        <div className="relative h-full">
          <Sidebar user={user} counts={counts} />
        </div>
      </aside>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Dashboard menu">
            <motion.div className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
            <motion.aside className="theme-dark absolute inset-y-0 left-0 w-80 max-w-[85vw] bg-ink-950" initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", stiffness: 320, damping: 34 }}>
              <button onClick={() => setOpen(false)} className="absolute right-3 top-4 rounded-lg p-2 text-white/60 hover:bg-white/10" aria-label="Close menu">
                <X className="size-5" />
              </button>
              <Sidebar user={user} counts={counts} onNavigate={() => setOpen(false)} />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-mist-200 bg-white/85 px-4 backdrop-blur-xl lg:hidden">
          <button onClick={() => setOpen(true)} className="rounded-lg p-2 text-mist-600 hover:bg-mist-100" aria-label="Open menu">
            <Menu className="size-5" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/brand/logo.png" alt="Jarz Digital" className="h-7 w-auto" />
          <Link href="/" className="ml-auto rounded-lg p-2 text-mist-600 hover:bg-mist-100" aria-label="Back to website">
            <Home className="size-5" />
          </Link>
        </header>
        <main id="dash-main" className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
          {children}
        </main>
      </div>
    </div>
  );
}
