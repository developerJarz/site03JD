"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, Mail, Phone, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ButtonLink } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";
import { PRIMARY_LINKS, type NavData } from "./types";

export function MobileMenu({
  open,
  onClose,
  data,
  account,
  onSearch,
}: {
  open: boolean;
  onClose: () => void;
  data: NavData;
  account: { name: string; staff: boolean } | null;
  onSearch: () => void;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    document.documentElement.style.overflow = "hidden";
    panelRef.current?.querySelector<HTMLElement>("button, a")?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && panelRef.current) {
        const focusables = panelRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      previous?.focus();
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          className="theme-dark fixed inset-0 z-[70] flex flex-col overflow-y-auto bg-ink-950 lg:hidden"
          initial={{ clipPath: "inset(0 0 100% 0)" }}
          animate={{ clipPath: "inset(0 0 0% 0)" }}
          exit={{ clipPath: "inset(0 0 100% 0)", transition: { duration: 0.45, ease: [0.76, 0, 0.24, 1] } }}
          transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
        >
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-grid opacity-40 mask-fade-b" />
          <div className="container-page relative flex h-[76px] shrink-0 items-center justify-between">
            <Logo tone="dark" />
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSearch();
                }}
                className="flex size-10 items-center justify-center rounded-full text-white hover:bg-white/10"
                aria-label="Search"
              >
                <Search className="size-5" />
              </button>
              <button type="button" onClick={onClose} className="flex size-10 items-center justify-center rounded-full text-white hover:bg-white/10" aria-label="Close menu">
                <X className="size-5" />
              </button>
            </div>
          </div>

          <nav aria-label="Mobile" className="container-page relative flex-1 pb-8 pt-6">
            <ul className="divide-y divide-white/[0.08] border-y border-white/[0.08]">
              {PRIMARY_LINKS.map((link, i) => (
                <motion.li key={link.href} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.05, duration: 0.6 }}>
                  {link.menu ? (
                    <>
                      <button
                        type="button"
                        className="flex w-full items-center justify-between py-4 text-left font-display text-3xl font-medium tracking-tight text-white"
                        aria-expanded={expanded === link.menu}
                        onClick={() => setExpanded(expanded === link.menu ? null : link.menu!)}
                      >
                        {link.label}
                        <ChevronDown className={cn("size-6 text-white/50 transition-transform", expanded === link.menu && "rotate-180")} aria-hidden />
                      </button>
                      <AnimatePresence initial={false}>
                        {expanded === link.menu && (
                          <motion.ul
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="grid grid-cols-1 gap-1 overflow-hidden pb-4 sm:grid-cols-2"
                          >
                            <li>
                              <Link href={link.href} onClick={onClose} className="block rounded-lg px-2 py-2 text-brand-300">
                                All {link.label.toLowerCase()} →
                              </Link>
                            </li>
                            {(link.menu === "services"
                              ? data.services.map((s) => ({ href: `/services/${s.slug}`, label: s.title }))
                              : data.industries.map((s) => ({ href: `/industries/${s.slug}`, label: s.name }))
                            ).map((item) => (
                              <li key={item.href}>
                                <Link href={item.href} onClick={onClose} className="block rounded-lg px-2 py-2 text-white/70 hover:text-white">
                                  {item.label}
                                </Link>
                              </li>
                            ))}
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <Link href={link.href} onClick={onClose} className="block py-4 font-display text-3xl font-medium tracking-tight text-white">
                      {link.label}
                    </Link>
                  )}
                </motion.li>
              ))}
            </ul>

            <div className="mt-8 flex flex-col gap-3">
              <ButtonLink href="/contact?intent=project" size="lg" arrow onClick={onClose}>
                Start a Project
              </ButtonLink>
              <ButtonLink href={account ? (account.staff ? "/admin" : "/dashboard") : "/login"} variant="outline-light" size="lg" onClick={onClose}>
                {account ? `Dashboard — ${account.name.split(" ")[0]}` : "Sign in"}
              </ButtonLink>
            </div>

            <div className="mt-10 space-y-3 text-sm text-white/60">
              <a href={`tel:${data.phone.replace(/[^+\d]/g, "")}`} className="flex items-center gap-3 hover:text-white">
                <Phone className="size-4" aria-hidden /> {data.phone}
              </a>
              <a href={`mailto:${data.email}`} className="flex items-center gap-3 hover:text-white">
                <Mail className="size-4" aria-hidden /> {data.email}
              </a>
            </div>
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
