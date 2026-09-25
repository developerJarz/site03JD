import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Stagger, StaggerItem } from "@/components/animations/reveal";
import { initials } from "@/lib/utils";
import type { TeamMember } from "@/types/content";

export function TeamAvatar({ member, size = 64 }: { member: Pick<TeamMember, "name" | "photo">; size?: number }) {
  return member.photo ? (
    <Image
      src={member.photo.src}
      alt={member.photo.alt}
      width={size}
      height={size}
      className="shrink-0 rounded-2xl object-cover ring-1 ring-mist-200"
      style={{ width: size, height: size }}
    />
  ) : (
    <span
      className="flex shrink-0 items-center justify-center rounded-2xl bg-ink-900 font-display font-semibold text-brand-300"
      style={{ width: size, height: size, fontSize: size / 3 }}
      aria-hidden
    >
      {initials(member.name)}
    </span>
  );
}

/**
 * Team cards. The published portraits are small (150px), so the design is
 * typographic with compact avatars rather than large photography.
 */
export function TeamGrid({ team }: { team: TeamMember[] }) {
  const [lead, ...rest] = team;
  if (!lead) return null;
  return (
    <div className="grid gap-4 lg:grid-cols-12">
      <Link
        href={`/team/${lead.slug}`}
        className="theme-dark group relative flex flex-col justify-between overflow-hidden rounded-[28px] bg-ink-900 p-8 lg:col-span-5 lg:row-span-2 lg:p-10"
      >
        <div aria-hidden className="absolute -right-24 -top-24 size-72 rounded-full bg-brand-400/20 blur-3xl transition-colors duration-700 group-hover:bg-brand-400/30" />
        <div className="relative flex items-center gap-5">
          <TeamAvatar member={lead} size={88} />
          <div>
            <p className="eyebrow text-brand-300">Founder</p>
            <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight text-white">{lead.name}</h3>
            <p className="text-sm text-white/55">{lead.role}</p>
          </div>
        </div>
        <p className="relative mt-10 text-lg leading-relaxed text-white/75">{lead.bio}</p>
        {lead.highlights.length > 0 && (
          <ul className="relative mt-8 flex flex-wrap gap-2">
            {lead.highlights.map((h) => (
              <li key={h} className="rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs text-white/70">
                {h}
              </li>
            ))}
          </ul>
        )}
        <span className="relative mt-10 inline-flex items-center gap-2 text-sm font-medium text-brand-300">
          View profile <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
        </span>
      </Link>

      <Stagger as="ul" className="grid gap-4 sm:grid-cols-2 lg:col-span-7 lg:grid-cols-2" stagger={0.05}>
        {rest.map((m) => (
          <StaggerItem as="li" key={m.slug}>
            <Link
              href={`/team/${m.slug}`}
              className="group flex h-full items-start gap-4 rounded-3xl border border-mist-200 bg-white p-5 transition-all duration-500 hover:-translate-y-0.5 hover:border-ink-900 hover:shadow-soft"
            >
              <TeamAvatar member={m} size={56} />
              <div className="min-w-0">
                <h3 className="font-display text-lg font-semibold tracking-tight text-ink-900">{m.name}</h3>
                <p className="text-sm text-brand-700">{m.role}</p>
                {m.region && <p className="mt-0.5 text-xs text-mist-500">{m.region}</p>}
                <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-mist-600">{m.bio}</p>
              </div>
            </Link>
          </StaggerItem>
        ))}
      </Stagger>
    </div>
  );
}
