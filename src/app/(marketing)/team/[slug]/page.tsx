import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { JsonLd } from "@/components/marketing/json-ld";
import { Breadcrumbs } from "@/components/marketing/page-hero";
import { TeamAvatar } from "@/components/sections/team-grid";
import { SOCIAL_ICONS } from "@/components/ui/brand-icons";
import { Section } from "@/components/ui/section";
import { getTeam, getTeamMemberBySlug } from "@/lib/data/public";
import { buildMetadata, personSchema, teamProfileIndexable } from "@/lib/seo";

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  return (await getTeam()).map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: PageProps<"/team/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const member = await getTeamMemberBySlug(slug);
  if (!member) return {};
  // Short profiles stay reachable but out of search until the bio is expanded (see teamProfileIndexable).
  return buildMetadata({ title: `${member.name} — ${member.role}`, description: member.bio, path: `/team/${member.slug}`, image: member.photo?.src, noindex: !teamProfileIndexable(member) });
}

export default async function TeamMemberPage({ params }: PageProps<"/team/[slug]">) {
  const { slug } = await params;
  const [member, team] = await Promise.all([getTeamMemberBySlug(slug), getTeam()]);
  if (!member) notFound();
  const socials = (["linkedin", "twitter"] as const).filter((k) => member.socials[k]);
  const others = team.filter((m) => m.slug !== member.slug);

  return (
    <>
      <JsonLd data={personSchema(member)} />
      <section className="theme-dark relative overflow-hidden bg-ink-950 pb-20 pt-36 md:pt-44">
        <div aria-hidden className="absolute inset-0 bg-grid opacity-60 mask-fade-b" />
        <div className="container-page relative">
          <Breadcrumbs
            items={[
              { name: "About", path: "/about" },
              { name: "Team", path: "/about#team" },
              { name: member.name, path: `/team/${member.slug}` },
            ]}
            className="mb-12"
          />
          <div className="flex flex-col gap-8 md:flex-row md:items-center">
            <TeamAvatar member={member} size={140} />
            <div>
              <p className="eyebrow text-brand-300">{member.region}</p>
              <h1 className="mt-3 font-display text-display-md font-semibold tracking-display text-white">{member.name}</h1>
              <p className="mt-3 text-lg text-white/60">{member.role}</p>
            </div>
          </div>
        </div>
      </section>

      <Section tone="light" aria-label="Biography">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="font-display text-2xl leading-snug tracking-tight text-ink-900 md:text-3xl">{member.bio}</p>
            {member.highlights.length > 0 && (
              <ul className="mt-10 space-y-3">
                {member.highlights.map((h) => (
                  <li key={h} className="flex items-center gap-3 text-mist-700">
                    <Check className="size-4 text-brand-600" aria-hidden />
                    {h}
                  </li>
                ))}
              </ul>
            )}
            {socials.length > 0 && (
              <ul className="mt-10 flex gap-2">
                {socials.map((k) => {
                  const { Icon, label } = SOCIAL_ICONS[k];
                  return (
                    <li key={k}>
                      <a href={member.socials[k]} target="_blank" rel="noopener noreferrer" aria-label={`${member.name} on ${label}`} className="flex size-11 items-center justify-center rounded-full border border-mist-200 text-mist-600 hover:border-ink-900 hover:text-ink-900">
                        <Icon className="size-4" />
                      </a>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
          <aside className="lg:col-span-4 lg:col-start-9">
            <p className="eyebrow text-mist-500">More of the team</p>
            <ul className="mt-6 divide-y divide-mist-100">
              {others.map((m) => (
                <li key={m.slug}>
                  <Link href={`/team/${m.slug}`} className="group flex items-center gap-4 py-3">
                    <TeamAvatar member={m} size={40} />
                    <span>
                      <span className="block font-medium text-ink-900 group-hover:text-brand-700">{m.name}</span>
                      <span className="block text-sm text-mist-500">{m.role}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </Section>
      <CtaBanner />
    </>
  );
}
