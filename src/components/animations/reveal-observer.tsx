"use client";

import { useEffect } from "react";

/**
 * The single observer behind <Reveal>, <Stagger> and <ImageReveal>. On first
 * load, anything already on screen is marked shown immediately (no flicker,
 * no delayed LCP); everything below the fold is armed and animates in when it
 * enters the viewport. Content added later (client navigation) animates in.
 */
export function RevealObserver() {
  useEffect(() => {
    if (!("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.setAttribute("data-revealed", "");
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -12% 0px" },
    );

    const pending = () => document.querySelectorAll<HTMLElement>("[data-reveal]:not([data-revealed]):not([data-watched])");
    for (const node of pending()) {
      const r = node.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) node.setAttribute("data-revealed", "instant");
      else {
        node.setAttribute("data-watched", "");
        io.observe(node);
      }
    }
    document.documentElement.classList.add("reveal-armed");

    // New content after client-side navigation: hidden until it scrolls (or already is) in view.
    let frame = 0;
    const mo = new MutationObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        for (const node of pending()) {
          node.setAttribute("data-watched", "");
          io.observe(node);
        }
      });
    });
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}
