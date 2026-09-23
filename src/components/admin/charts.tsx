"use client";

import { useId, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Lightweight SVG charts for the admin dashboard (no chart library).
 * Single-series, single hue (#00a0aa — validated for lightness, chroma and
 * ≥3:1 contrast on the white surface). Specs: ≤24px bars with 4px rounded
 * data-ends, 2px lines, ≥8px markers with a 2px surface ring, 1px solid
 * recessive grid, hover + keyboard tooltips, and a table view for every chart.
 */
const MARK = "#00a0aa";
const GRID = "#eaeff3";
const fmt = new Intl.NumberFormat("en-US");

export interface Point {
  label: string;
  value: number;
}

function niceMax(max: number) {
  if (max <= 4) return 4;
  const pow = 10 ** Math.floor(Math.log10(max));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * pow).find((s) => max / s <= 4) ?? pow * 10;
  return Math.ceil(max / step) * step;
}

function TableView({ data, valueLabel }: { data: Point[]; valueLabel: string }) {
  return (
    <details className="mt-3 text-sm">
      <summary className="cursor-pointer text-xs text-mist-500 hover:text-ink-900">View as table</summary>
      <div className="mt-2 max-h-48 overflow-y-auto rounded-lg border border-mist-100">
        <table className="w-full text-left text-xs">
          <thead className="bg-mist-25 text-mist-500">
            <tr>
              <th className="px-3 py-1.5 font-medium">Period</th>
              <th className="px-3 py-1.5 text-right font-medium">{valueLabel}</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.label} className="border-t border-mist-100">
                <td className="px-3 py-1.5 text-mist-700">{d.label}</td>
                <td className="px-3 py-1.5 text-right tabular-nums text-ink-900">{fmt.format(d.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}

function Tooltip({ x, y, label, value, valueLabel }: { x: number; y: number; label: string; value: number; valueLabel: string }) {
  return (
    <div
      role="status"
      className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg border border-mist-200 bg-white px-3 py-2 shadow-lift"
      style={{ left: x, top: y - 10 }}
    >
      <p className="text-sm font-semibold tabular-nums text-ink-900">{fmt.format(value)}</p>
      <p className="flex items-center gap-1.5 text-xs text-mist-500">
        <span aria-hidden className="inline-block h-0.5 w-3 rounded" style={{ background: MARK }} />
        {valueLabel} · {label}
      </p>
    </div>
  );
}

const H = 200;
const PAD = { top: 16, right: 12, bottom: 26, left: 36 };

/** Columns over time (e.g. leads per week). */
export function ColumnChart({ data, valueLabel, title }: { data: Point[]; valueLabel: string; title: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);
  const [width, setWidth] = useState(640);
  const id = useId();

  const max = niceMax(Math.max(...data.map((d) => d.value), 0));
  const innerW = width - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const band = innerW / Math.max(1, data.length);
  const barW = Math.min(24, band - 4);
  const ticks = [0, max / 2, max];
  const labelEvery = Math.ceil(data.length / 6);
  const peak = data.reduce((m, d, i) => (d.value > (data[m]?.value ?? -1) ? i : m), 0);

  return (
    <div
      ref={(el) => {
        wrap.current = el;
        if (el && Math.abs(el.clientWidth - width) > 4) setWidth(el.clientWidth);
      }}
      className="relative"
    >
      <svg width="100%" height={H} viewBox={`0 0 ${width} ${H}`} role="img" aria-labelledby={`${id}-t`} onPointerLeave={() => setActive(null)}>
        <title id={`${id}-t`}>{title}</title>
        {ticks.map((t) => {
          const y = PAD.top + innerH - (t / max) * innerH;
          return (
            <g key={t}>
              <line x1={PAD.left} x2={width - PAD.right} y1={y} y2={y} stroke={GRID} strokeWidth={1} />
              <text x={PAD.left - 8} y={y + 4} textAnchor="end" className="fill-mist-500 text-[10px] tabular-nums">
                {fmt.format(t)}
              </text>
            </g>
          );
        })}
        {data.map((d, i) => {
          const h = max ? (d.value / max) * innerH : 0;
          const x = PAD.left + i * band + (band - barW) / 2;
          const y = PAD.top + innerH - h;
          const r = Math.min(4, h / 2);
          const path = h > 0 ? `M${x},${y + h} V${y + r} Q${x},${y} ${x + r},${y} H${x + barW - r} Q${x + barW},${y} ${x + barW},${y + r} V${y + h} Z` : "";
          return (
            <g key={d.label}>
              {/* Hit target: the whole band, taller than the mark */}
              <rect
                x={PAD.left + i * band}
                y={PAD.top}
                width={band}
                height={innerH}
                fill="transparent"
                tabIndex={0}
                aria-label={`${d.label}: ${d.value} ${valueLabel.toLowerCase()}`}
                onPointerEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
                className="outline-none"
              />
              {path && <path d={path} fill={MARK} opacity={active === null || active === i ? 1 : 0.45} className="pointer-events-none transition-opacity" />}
              {i === peak && d.value > 0 && active === null && (
                <text x={x + barW / 2} y={y - 5} textAnchor="middle" className="pointer-events-none fill-ink-900 text-[10px] font-medium tabular-nums">
                  {fmt.format(d.value)}
                </text>
              )}
              {i % labelEvery === 0 && (
                <text x={PAD.left + i * band + band / 2} y={H - 8} textAnchor="middle" className="pointer-events-none fill-mist-500 text-[10px]">
                  {d.label}
                </text>
              )}
            </g>
          );
        })}
        <line x1={PAD.left} x2={width - PAD.right} y1={PAD.top + innerH} y2={PAD.top + innerH} stroke="#d9e1e8" strokeWidth={1} />
      </svg>
      {active !== null && data[active] && (
        <Tooltip
          x={PAD.left + active * band + band / 2}
          y={PAD.top + innerH - (max ? (data[active].value / max) * innerH : 0)}
          label={data[active].label}
          value={data[active].value}
          valueLabel={valueLabel}
        />
      )}
      <TableView data={data} valueLabel={valueLabel} />
    </div>
  );
}

/** Line + area over time with a crosshair that snaps to the nearest point. */
export function LineChart({ data, valueLabel, title }: { data: Point[]; valueLabel: string; title: string }) {
  const [active, setActive] = useState<number | null>(null);
  const [width, setWidth] = useState(640);
  const svgRef = useRef<SVGSVGElement>(null);
  const id = useId();

  const max = niceMax(Math.max(...data.map((d) => d.value), 0));
  const innerW = width - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const xAt = (i: number) => PAD.left + (data.length <= 1 ? innerW / 2 : (i / (data.length - 1)) * innerW);
  const yAt = (v: number) => PAD.top + innerH - (max ? (v / max) * innerH : 0);
  const line = useMemo(() => data.map((d, i) => `${i ? "L" : "M"}${xAt(i)},${yAt(d.value)}`).join(" "), [data, width, max]); // eslint-disable-line react-hooks/exhaustive-deps
  const area = data.length ? `${line} L${xAt(data.length - 1)},${PAD.top + innerH} L${xAt(0)},${PAD.top + innerH} Z` : "";
  const labelEvery = Math.ceil(data.length / 6);
  const last = data.length - 1;

  const onMove = (clientX: number) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect || !data.length) return;
    const x = ((clientX - rect.left) / rect.width) * width;
    const i = Math.round(((x - PAD.left) / innerW) * (data.length - 1));
    setActive(Math.max(0, Math.min(data.length - 1, i)));
  };

  return (
    <div
      ref={(el) => {
        if (el && Math.abs(el.clientWidth - width) > 4) setWidth(el.clientWidth);
      }}
      className="relative"
    >
      <svg
        ref={svgRef}
        width="100%"
        height={H}
        viewBox={`0 0 ${width} ${H}`}
        role="img"
        aria-labelledby={`${id}-t`}
        tabIndex={0}
        onPointerMove={(e) => onMove(e.clientX)}
        onPointerLeave={() => setActive(null)}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") setActive((a) => Math.min(last, (a ?? -1) + 1));
          if (e.key === "ArrowLeft") setActive((a) => Math.max(0, (a ?? last + 1) - 1));
        }}
        onBlur={() => setActive(null)}
        className="outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
      >
        <title id={`${id}-t`}>{title}</title>
        {[0, max / 2, max].map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={width - PAD.right} y1={yAt(t)} y2={yAt(t)} stroke={GRID} strokeWidth={1} />
            <text x={PAD.left - 8} y={yAt(t) + 4} textAnchor="end" className="fill-mist-500 text-[10px] tabular-nums">
              {fmt.format(t)}
            </text>
          </g>
        ))}
        <path d={area} fill={MARK} opacity={0.1} />
        <path d={line} fill="none" stroke={MARK} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        {data.map((d, i) =>
          i % labelEvery === 0 ? (
            <text key={d.label} x={xAt(i)} y={H - 8} textAnchor="middle" className="fill-mist-500 text-[10px]">
              {d.label}
            </text>
          ) : null,
        )}
        {last >= 0 && active === null && (
          <>
            <circle cx={xAt(last)} cy={yAt(data[last].value)} r={4} fill={MARK} stroke="#fff" strokeWidth={2} />
            <text x={xAt(last) - 8} y={yAt(data[last].value) - 10} textAnchor="end" className="fill-ink-900 text-[10px] font-medium tabular-nums">
              {fmt.format(data[last].value)}
            </text>
          </>
        )}
        {active !== null && (
          <>
            <line x1={xAt(active)} x2={xAt(active)} y1={PAD.top} y2={PAD.top + innerH} stroke="#bcc8d3" strokeWidth={1} />
            <circle cx={xAt(active)} cy={yAt(data[active].value)} r={4} fill={MARK} stroke="#fff" strokeWidth={2} />
          </>
        )}
      </svg>
      {active !== null && data[active] && <Tooltip x={xAt(active)} y={yAt(data[active].value)} label={data[active].label} value={data[active].value} valueLabel={valueLabel} />}
      <TableView data={data} valueLabel={valueLabel} />
    </div>
  );
}

/** Ranked horizontal bars with the value at each bar's tip. */
export function BarList({ data, valueLabel, empty = "No data yet." }: { data: Point[]; valueLabel: string; empty?: string }) {
  const max = Math.max(...data.map((d) => d.value), 0);
  if (!data.length || max === 0) return <p className="py-8 text-center text-sm text-mist-500">{empty}</p>;
  return (
    <ul className="space-y-3" aria-label={valueLabel}>
      {data.map((d) => (
        <li key={d.label} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1">
          <span className="truncate text-sm text-mist-700" title={d.label}>
            {d.label}
          </span>
          <span className="text-sm font-medium tabular-nums text-ink-900">{fmt.format(d.value)}</span>
          <span className="col-span-2 block h-2 overflow-hidden rounded-full bg-mist-100">
            <span className={cn("block h-full rounded-full")} style={{ width: `${Math.max(2, (d.value / max) * 100)}%`, background: MARK }} />
          </span>
        </li>
      ))}
    </ul>
  );
}
