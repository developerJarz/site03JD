import { exampleRun, type RunStep } from "@/content/ai-automation";
import { cn } from "@/lib/utils";

const DOT: Record<RunStep["kind"], string> = {
  in: "bg-white",
  ai: "bg-brand-300 shadow-[0_0_12px_rgb(82_212_220/0.8)]",
  tool: "bg-azure-400",
  done: "bg-[#3ddc97]",
};

/**
 * Hero visual for the AI Automation page: one example workflow run, written as the
 * activity log a client sees. Lines play in once on load (CSS only, skipped with
 * reduced motion); the full text is in the server HTML.
 */
export function RunLog() {
  const last = exampleRun.steps.length;
  return (
    <figure className="relative overflow-hidden rounded-[28px] border border-white/10 bg-ink-900/80 shadow-[0_40px_80px_-40px_rgb(0_0_0/0.9)] backdrop-blur-sm">
      <figcaption className="flex items-center justify-between gap-4 border-b border-white/[0.08] px-6 py-4">
        <span className="text-sm font-medium text-white">{exampleRun.title}</span>
        <span className="flex shrink-0 items-center gap-2 text-xs text-[#3ddc97]">
          <span className="size-1.5 rounded-full bg-[#3ddc97]" aria-hidden />
          Completed
        </span>
      </figcaption>

      <ol className="relative px-6 py-5">
        {/* timeline spine */}
        <span aria-hidden className="absolute bottom-9 left-[7.1rem] top-8 w-px bg-white/10" />
        {exampleRun.steps.map((s, i) => (
          <li
            key={i}
            className="relative grid grid-cols-[4.6rem_1rem_minmax(0,1fr)] items-start gap-x-2 py-2 motion-safe:animate-fade-up"
            style={{ animationDelay: `${0.5 + i * 0.32}s` }}
          >
            <time className="pt-0.5 font-mono text-xs tabular-nums text-white/40">{s.time}</time>
            <span aria-hidden className={cn("relative z-10 mt-1.5 size-2 justify-self-center rounded-full ring-4 ring-ink-900", DOT[s.kind])} />
            <p className="text-sm leading-snug text-white/75">
              <span className="font-medium text-white">{s.source}</span>
              <span className="mt-0.5 block text-white/60">{s.text}</span>
            </p>
          </li>
        ))}
      </ol>

      <p
        className="border-t border-white/[0.08] bg-[#3ddc97]/[0.06] px-6 py-4 text-sm text-white/80 motion-safe:animate-fade-up"
        style={{ animationDelay: `${0.5 + last * 0.32}s` }}
      >
        {exampleRun.footer}
      </p>
    </figure>
  );
}
