import { useId, type SVGProps } from "react";

/**
 * Country flags as inline SVG. Emoji flags render as two letters on Windows, so these are drawn.
 * Each is a 3:2 viewBox (60×40) that fills its box; frame and size come from the caller.
 */
type P = SVGProps<SVGSVGElement>;

export type FlagCode = "bd" | "us" | "ca" | "uk";

/** Each flag's lead colour and a second tone, for anything that takes on the country's colours
 *  (Canada's second tone is a deep red rather than its white, which would read as grey on dark grounds). */
export const FLAG_COLORS: Record<FlagCode, [string, string]> = {
  bd: ["#006A4E", "#F42A41"],
  us: ["#0A3161", "#B31942"],
  ca: ["#D52B1E", "#7A1A12"],
  uk: ["#012169", "#C8102E"],
};

function Bangladesh(p: P) {
  return (
    <svg viewBox="0 0 60 40" preserveAspectRatio="xMidYMid slice" {...p}>
      <rect width="60" height="40" fill="#006A4E" />
      <circle cx="27" cy="20" r="12" fill="#F42A41" />
    </svg>
  );
}

function Usa(p: P) {
  const stripe = 40 / 13;
  return (
    <svg viewBox="0 0 60 40" preserveAspectRatio="xMidYMid slice" {...p}>
      <rect width="60" height="40" fill="#fff" />
      {Array.from({ length: 7 }, (_, i) => (
        <rect key={i} y={i * 2 * stripe} width="60" height={stripe} fill="#B31942" />
      ))}
      <rect width="26" height={stripe * 7} fill="#0A3161" />
      {Array.from({ length: 4 }, (_, r) =>
        Array.from({ length: 5 }, (_, c) => <circle key={`${r}-${c}`} cx={3 + c * 5 + (r % 2) * 2.5} cy={3.2 + r * 5.6} r="0.95" fill="#fff" />),
      )}
    </svg>
  );
}

function Canada(p: P) {
  return (
    <svg viewBox="0 0 60 40" preserveAspectRatio="xMidYMid slice" {...p}>
      <rect width="60" height="40" fill="#fff" />
      <rect width="15" height="40" fill="#D52B1E" />
      <rect x="45" width="15" height="40" fill="#D52B1E" />
      <path
        fill="#D52B1E"
        d="M30 7.5l1.9 4.2 2.3-1.3-.9 6.6 4.3-4.3.9 2.2 4.2-.9-1.6 4.4 2.2 1.2-6.4 5.2.9 2.6-6.5-1.2.4 6.8h-2.2l.4-6.8-6.5 1.2.9-2.6-6.4-5.2 2.2-1.2-1.6-4.4 4.2.9.9-2.2 4.3 4.3-.9-6.6 2.3 1.3z"
      />
    </svg>
  );
}

function Uk(p: P) {
  // Union Jack with the counterchanged red saltire; ids are per instance so several flags can share a page.
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 60 30" preserveAspectRatio="xMidYMid slice" {...p}>
      <clipPath id={`${id}s`}>
        <path d="M0,0 v30 h60 v-30 z" />
      </clipPath>
      <clipPath id={`${id}t`}>
        <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
      </clipPath>
      <g clipPath={`url(#${id}s)`}>
        <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
        <path d="M0,0 L60,30 M60,0 L0,30" clipPath={`url(#${id}t)`} stroke="#C8102E" strokeWidth="4" />
        <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
        <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
      </g>
    </svg>
  );
}

const FLAGS: Record<FlagCode, (p: P) => React.ReactElement> = { bd: Bangladesh, us: Usa, ca: Canada, uk: Uk };

/** A country flag; decorative by default (the country name is always written next to it). */
export function Flag({ code, ...props }: { code: FlagCode } & P) {
  const Cmp = FLAGS[code];
  return <Cmp aria-hidden {...props} />;
}
