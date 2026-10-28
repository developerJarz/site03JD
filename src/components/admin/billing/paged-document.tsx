"use client";

import { Fragment, useLayoutEffect, useReducer, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

/**
 * Splits a document into real A4 pages. The content is described as a flow of
 * unbreakable blocks and row-breakable tables; an off-screen copy is measured
 * and packed into sheets, so the preview shows exactly the pages that print —
 * each with its own header, footer and page number, and tables repeating their
 * column header when they continue onto the next page.
 */

export interface FlowRow {
  key: string;
  /** A single `<tr>`. */
  node: ReactNode;
  /** Never end a page on this row (group headings). */
  keepWithNext?: boolean;
}

interface FlowBase {
  key: string;
  /** Space above the item in CSS px; dropped at the top of a page. */
  gap?: number;
  /** Start this item on a fresh page. */
  breakBefore?: boolean;
}

type BlockFlow = FlowBase & { kind: "block"; node: ReactNode; /** Move to the next page together with the item after it (headings). */ keepWithNext?: boolean };
type TableFlow = FlowBase & { kind: "table"; className?: string; head?: ReactNode; rows: FlowRow[]; foot?: ReactNode };
export type Flow = BlockFlow | TableFlow;

export const block = (key: string, node: ReactNode, opts: Omit<BlockFlow, "key" | "kind" | "node"> = {}): Flow => ({ kind: "block", key, node, ...opts });
export const table = (key: string, opts: Omit<TableFlow, "key" | "kind">): Flow => ({ kind: "table", key, ...opts });

type Measured = { kind: "block"; h: number } | { kind: "table"; head: number; rows: number[]; foot: number };
/** Which flow item (and for tables, which rows) sits on a page. */
type Slot = { i: number; from: number; to: number };
type Layout = { pages: Slot[][]; grow: boolean[] };

/** Slack so sub-pixel rounding never pushes content into the footer. */
const SLACK = 4;

function pack(flows: Flow[], m: Measured[], capacity: number): Layout {
  const pages: Slot[][] = [[]];
  const grow = [false];
  let used = 0;
  const atTop = () => pages[pages.length - 1].length === 0;
  const newPage = () => {
    pages.push([]);
    grow.push(false);
    used = 0;
  };
  const place = (slot: Slot, h: number) => {
    pages[pages.length - 1].push(slot);
    used += h;
    if (used > capacity) grow[grow.length - 1] = true;
  };
  const gapOf = (i: number) => (atTop() ? 0 : (flows[i].gap ?? 0));

  /** Smallest piece of item `i` that may open a page: a block, or a table header plus its first unbreakable run of rows. */
  const opening = (i: number): number => {
    const f = flows[i];
    const x = m[i];
    if (x.kind === "block" || f.kind === "block") return x.kind === "block" ? x.h : 0;
    let h = x.head;
    for (let r = 0; r < x.rows.length; r++) {
      h += x.rows[r];
      if (!f.rows[r].keepWithNext) break;
    }
    return h + (x.rows.length <= 1 ? x.foot : 0);
  };

  for (let i = 0; i < flows.length; i++) {
    const f = flows[i];
    const x = m[i];
    if (f.breakBefore && !atTop()) newPage();

    if (f.kind === "block" && x.kind === "block") {
      let need = gapOf(i) + x.h;
      if (f.keepWithNext && i + 1 < flows.length && !flows[i + 1].breakBefore) need += (flows[i + 1].gap ?? 0) + opening(i + 1);
      if (used + need > capacity && !atTop()) newPage();
      place({ i, from: 0, to: 0 }, gapOf(i) + x.h);
      continue;
    }
    if (f.kind !== "table" || x.kind !== "table") continue;

    const total = x.rows.length;
    let r = 0;
    do {
      const base = gapOf(i) + x.head;
      const heightTo = (to: number) => base + x.rows.slice(r, to).reduce((s, h) => s + h, 0) + (to === total ? x.foot : 0);
      let to = r;
      while (to < total && used + heightTo(to + 1) <= capacity) to++;
      // Don't strand a group heading at the foot of a page, or a lone row (plus total) at the top of the next.
      while (to > r && to < total && f.rows[to - 1].keepWithNext) to--;
      if (to < total && total - to < 2 && to - r > 2) to--;
      if (to === r && total > 0) {
        if (!atTop()) {
          newPage();
          continue;
        }
        to = r + 1; // A single row taller than a page: let the sheet grow.
      }
      place({ i, from: r, to }, heightTo(to));
      r = to;
      if (r < total) newPage();
    } while (r < total);
  }
  return { pages, grow };
}

const fits = (layout: Layout, flows: Flow[]) => layout.pages.every((p) => p.every((s) => s.i < flows.length && (flows[s.i].kind === "block" || s.to <= (flows[s.i] as TableFlow).rows.length)));

/** Measure the off-screen copy and pack it; null when it isn't laid out (e.g. display: none while printing). */
function measureLayout(root: HTMLElement | null, flows: Flow[]): Layout | null {
  const body = root?.querySelector<HTMLElement>("[data-body]");
  const content = body?.querySelector<HTMLElement>("[data-content]");
  if (!body || !content) return null;
  const capacity = body.getBoundingClientRect().height - SLACK;
  const items = [...content.children];
  if (capacity <= 0 || items.length !== flows.length) return null;
  const h = (el: Element | null | undefined) => (el ? el.getBoundingClientRect().height : 0);
  const measured: Measured[] = flows.map((f, i) => {
    if (f.kind === "block") return { kind: "block", h: h(items[i]) };
    const t = items[i].querySelector("table");
    return { kind: "table", head: h(t?.tHead), rows: [...(t?.tBodies[0]?.rows ?? [])].map(h), foot: h(t?.tFoot) };
  });
  return pack(flows, measured, capacity);
}

const subscribe = () => () => {};
const useIsClient = () =>
  useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

function FlowItem({ flow, slot, gap }: { flow: Flow; slot?: Slot; gap: number }) {
  return (
    <div className="flow-root" style={gap ? { paddingTop: gap } : undefined}>
      {flow.kind === "block" ? (
        flow.node
      ) : (
        <table className={cn("billing-table w-full", flow.className)}>
          {flow.head && <thead>{flow.head}</thead>}
          <tbody>
            {(slot ? flow.rows.slice(slot.from, slot.to) : flow.rows).map((r) => (
              <Fragment key={r.key}>{r.node}</Fragment>
            ))}
          </tbody>
          {flow.foot && (!slot || slot.to === flow.rows.length) && <tfoot>{flow.foot}</tfoot>}
        </table>
      )}
    </div>
  );
}

export function PagedDocument({ flows, header, footer, decor }: { flows: Flow[]; header: ReactNode; footer: (page: number, pages: number) => ReactNode; decor?: ReactNode }) {
  const isClient = useIsClient();
  const measureRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<Layout | null>(null);
  const [tick, remeasure] = useReducer((n: number) => n + 1, 0);

  // Re-pack whenever the content changes (a new flows array each edit) or fonts and sizes settle.
  useLayoutEffect(() => {
    const next = measureLayout(measureRef.current, flows);
    if (next) setLayout((prev) => (prev && JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
  }, [flows, tick]);
  useLayoutEffect(() => {
    const content = measureRef.current?.querySelector("[data-content]");
    if (!content) return;
    const ro = new ResizeObserver(remeasure);
    ro.observe(content);
    document.fonts?.ready.then(remeasure);
    return () => ro.disconnect();
  }, [isClient]);

  // A stale layout (flows just changed shape) shows one long sheet until the re-measure lands.
  const active = layout && fits(layout, flows) ? layout : null;
  const pages: (Slot | undefined)[][] = active ? active.pages : [flows.map(() => undefined)];

  return (
    <div className="billing-doc text-ink-900">
      {pages.map((slots, p) => (
        <section key={p} className={cn("billing-sheet", (!active || active.grow[p]) && "billing-sheet-grow")} aria-label={`Page ${p + 1} of ${pages.length}`}>
          {decor}
          <div className="mb-5">{header}</div>
          <div className="billing-sheet-body">
            {slots.map((slot, n) => {
              const flow = flows[slot ? slot.i : n];
              return <FlowItem key={`${flow.key}:${slot?.from ?? 0}`} flow={flow} slot={slot} gap={n === 0 ? 0 : (flow.gap ?? 0)} />;
            })}
          </div>
          <div className="mt-6">{footer(p + 1, pages.length)}</div>
        </section>
      ))}

      {isClient &&
        createPortal(
          <div ref={measureRef} className="billing-doc billing-measure text-ink-900" aria-hidden>
            <section className="billing-sheet">
              <div className="mb-5">{header}</div>
              <div className="billing-sheet-body" data-body="">
                <div data-content="">
                  {flows.map((flow) => (
                    <FlowItem key={flow.key} flow={flow} gap={0} />
                  ))}
                </div>
              </div>
              <div className="mt-6">{footer(1, 1)}</div>
            </section>
          </div>,
          document.body,
        )}
    </div>
  );
}
