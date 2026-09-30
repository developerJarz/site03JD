import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  Award,
  Bot,
  Check,
  Compass,
  FileSearch,
  GraduationCap,
  Mail,
  MapPin,
  MonitorSmartphone,
  Share2,
  ShoppingBag,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Counter } from "@/components/animations";
import { Reveal, Stagger, StaggerItem } from "@/components/animations/reveal";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { JsonLd } from "@/components/marketing/json-ld";
import { PageHero } from "@/components/marketing/page-hero";
import { WhatsAppButton } from "@/components/marketing/whatsapp";
import { TeamAvatar } from "@/components/sections/team-grid";
import { SOCIAL_ICONS } from "@/components/ui/brand-icons";
import { buttonClasses } from "@/components/ui/button";
import { Section, SectionHeader } from "@/components/ui/section";
import { whatsappLink } from "@/config/contact";
import { FOUNDER_PROFILE } from "@/config/team";
import { founderProfile as p } from "@/content/founder";
import { getTeamMemberBySlug } from "@/lib/data/public";
import { profilePageSchema } from "@/lib/seo";
import { pageMetadata } from "@/lib/seo/page";
import { cn } from "@/lib/utils";

export const revalidate = 3600;

const PATH = FOUNDER_PROFILE.path;

const ICONS: Record<(typeof p.competencies)[number]["icon"], LucideIcon> = {
  map: MapPin,
  sparkles: Sparkles,
  shop: ShoppingBag,
  share: Share2,
  users: Users,
  search: FileSearch,
  monitor: MonitorSmartphone,
  bot: Bot,
  compass: Compass,
  growth: TrendingUp,
};

/** Plain counts ("300+") count up; ranges and ratings are shown as written. */
const countable = (value: string) => /^\d[\d,]*\+?$/.test(value);

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata(PATH);
}

export default async function FounderPage() {
  const member = await getTeamMemberBySlug(FOUNDER_PROFILE.slug);
  // The Team entry supplies the portrait (editable in Admin → Team); fall back to the published photo.
  const avatar = member ?? {
    name: p.fullName,
    photo: { src: "/images/team/rokonuzzaman-jony.png", alt: `Portrait of ${p.fullName}`, width: 150, height: 150 },
  };
  // Social links are edited in Admin → Team.
  const socials = (["linkedin", "youtube", "facebook", "twitter"] as const).flatMap((k) => (member?.socials[k] ? [[k, member.socials[k]] as const] : []));

  return (
    <>
      {member && (
        <JsonLd
          data={profilePageSchema(member, {
            description: p.summary[0],
            knowsAbout: p.competencies.map((c) => c.title),
            alumniOf: p.education.school,
            homeLocation: p.location,
          })}
        />
      )}

      <PageHero
        eyebrow={p.title}
        title={p.fullName}
        titleLines={["Md Rokonuzzaman", "Jony"]}
        description={p.intro}
        crumbs={[
          { name: "About", path: "/about" },
          { name: "Team", path: "/about#team" },
          { name: p.fullName, path: PATH },
        ]}
        actions={
          <>
            <WhatsAppButton number={p.whatsapp} intent="I’d like to talk to Jony about my business." from="Founder profile page" path={PATH}>
              Message Jony
            </WhatsAppButton>
            <a href={`mailto:${p.email}`} className={buttonClasses({ size: "lg", variant: "outline-light" })}>
              <Mail className="size-4" aria-hidden />
              Email Jony
            </a>
          </>
        }
        aside={
          <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm md:p-8">
            <div className="flex items-center gap-5">
              <TeamAvatar member={avatar} size={88} />
              <div>
                <p className="font-display text-xl font-semibold tracking-tight text-white">{p.fullName}</p>
                <p className="mt-0.5 text-sm text-white/60">Jarz Digital</p>
              </div>
            </div>
            <ul className="mt-6 flex flex-wrap gap-2" aria-label="Specialties">
              {p.specialties.map((s) => (
                <li key={s} className="rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs text-white/75">
                  {s}
                </li>
              ))}
            </ul>
            <dl className="mt-6 divide-y divide-white/10 border-y border-white/10 text-sm">
              {[
                { term: "Based in", value: p.location },
                { term: "Offices", value: p.offices.join(", ") },
                {
                  term: "WhatsApp",
                  value: (
                    <a href={whatsappLink(p.whatsapp)} target="_blank" rel="noopener noreferrer" className="hover:text-brand-300">
                      {p.whatsappDisplay}
                    </a>
                  ),
                },
                {
                  term: "Email",
                  value: (
                    <a href={`mailto:${p.email}`} className="break-all hover:text-brand-300">
                      {p.email}
                    </a>
                  ),
                },
                {
                  term: "Website",
                  value: (
                    <Link href={p.website.href} className="hover:text-brand-300">
                      {p.website.label}
                    </Link>
                  ),
                },
              ].map((row) => (
                <div key={row.term} className="grid grid-cols-[5.5rem_1fr] gap-4 py-3">
                  <dt className="text-white/60">{row.term}</dt>
                  <dd className="text-white">{row.value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-6 flex items-center gap-3 text-sm text-white/75">
              <Star className="size-4 shrink-0 fill-brand-300 text-brand-300" aria-hidden />
              Former Fiverr Top Rated Seller, rated 5.0
            </p>
            {socials.length > 0 && (
              <ul className="mt-6 flex flex-wrap gap-2" aria-label={`${p.fullName} on social media`}>
                {socials.map(([k, href]) => {
                  const { Icon, label } = SOCIAL_ICONS[k];
                  return (
                    <li key={k}>
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer me"
                        aria-label={`${p.fullName} on ${label}`}
                        className="flex size-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/75 transition-colors hover:border-brand-300 hover:text-brand-300"
                      >
                        <Icon className="size-4" />
                      </a>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        }
      >
        <dl className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-3xl bg-white/10 md:grid-cols-4" aria-label="Key achievements">
          {p.achievements.map((a) => (
            <div key={a.label} className="flex flex-col-reverse justify-end bg-ink-950 p-5 md:p-8">
              <dt className="mt-2 text-sm text-white/55">{a.label}</dt>
              {/* Eight stats (one a range) share the row, so they run a step smaller than the About page’s four. */}
              <dd
                className={cn(
                  "whitespace-nowrap font-display font-semibold tracking-tight text-white sm:text-3xl lg:text-4xl xl:text-[2.75rem]",
                  a.value.length > 6 ? "text-xl" : "text-[1.6rem]",
                )}
              >{countable(a.value) ? <Counter value={a.value} /> : a.value}</dd>
            </div>
          ))}
        </dl>
      </PageHero>

      {/* Profile */}
      <Section tone="light" aria-labelledby="profile-heading">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeader index="01" eyebrow="Profile" title={<span id="profile-heading">Turning online visibility into measurable sales.</span>} className="mb-0 md:mb-0" />
          </div>
          <div className="space-y-5 text-lg leading-relaxed text-mist-600 lg:col-span-7">
            {p.summary.map((para) => (
              <p key={para}>{para}</p>
            ))}
            <p>
              Want to see the work?{" "}
              <Link href="/work" className="font-medium text-ink-900 underline underline-offset-4 hover:text-brand-700">
                Browse our client projects
              </Link>{" "}
              or read{" "}
              <Link href="/blog" className="font-medium text-ink-900 underline underline-offset-4 hover:text-brand-700">
                our local SEO guides
              </Link>
              .
            </p>
          </div>
        </div>
      </Section>

      {/* Core competencies */}
      <Section tone="mist" aria-labelledby="skills-heading">
        <SectionHeader
          index="02"
          eyebrow="Core competencies"
          title={<span id="skills-heading">From local SEO to AI automation.</span>}
          description="The skills behind every project. Where the Jarz Digital team offers it as a service, you can go straight to it."
        />
        <Stagger as="ul" className="grid gap-px overflow-hidden rounded-[28px] bg-mist-200 sm:grid-cols-2 lg:grid-cols-5" stagger={0.04}>
          {p.competencies.map((c) => {
            const Icon = ICONS[c.icon];
            return (
              <StaggerItem as="li" key={c.title} className="flex flex-col bg-white p-6 md:p-7">
                <span className="flex size-10 items-center justify-center rounded-xl bg-mist-50 text-brand-700">
                  <Icon className="size-5" aria-hidden />
                </span>
                <h3 className="mt-6 font-display text-lg font-semibold leading-snug tracking-tight text-ink-900">{c.title}</h3>
                {"service" in c && (
                  <Link href={c.service} className="group mt-auto inline-flex items-center gap-1 pt-6 text-sm font-medium text-brand-700 hover:text-ink-900">
                    View service<span className="sr-only">: {c.title}</span>
                    <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
                  </Link>
                )}
              </StaggerItem>
            );
          })}
        </Stagger>
      </Section>

      {/* Experience */}
      <Section tone="light" aria-labelledby="experience-heading">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              <SectionHeader index="03" eyebrow="Experience" title={<span id="experience-heading">A decade of ranking, building and growing businesses.</span>} className="mb-0 md:mb-0" />
            </div>
          </div>
          <ol className="relative space-y-14 border-l border-mist-200 pl-8 md:pl-10 lg:col-span-7 lg:col-start-6">
            {p.experience.map((job, i) => (
              <Reveal as="li" key={job.role} className="relative">
                <span aria-hidden className="absolute -left-[41px] top-1 flex size-4 items-center justify-center rounded-full bg-white ring-1 ring-mist-300 md:-left-[49px]">
                  <span className={i === 0 ? "size-2 rounded-full bg-brand-500" : "size-1.5 rounded-full bg-mist-400"} />
                </span>
                <p className="font-mono text-sm text-brand-700">{job.period}</p>
                <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink-900">{job.role}</h3>
                <p className="mt-1 font-medium text-ink-900">{job.company}</p>
                <p className="text-sm text-mist-500">{job.place}</p>
                <ul className="mt-5 space-y-2.5">
                  {job.points.map((point) => (
                    <li key={point} className="flex gap-3 leading-relaxed text-mist-600">
                      <Check className="mt-1.5 size-4 shrink-0 text-brand-600" aria-hidden />
                      {point}
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </ol>
        </div>
      </Section>

      {/* Tools & technologies */}
      <Section tone="dark" aria-labelledby="tools-heading">
        <SectionHeader index="04" eyebrow="Tools & technologies" title={<span id="tools-heading">The stack behind the work.</span>} description={p.toolsNote} />
        <div className="grid gap-5 lg:grid-cols-3">
          {p.tools.map((t) => (
            <Reveal key={t.group} className="flex flex-col rounded-[28px] border border-white/10 bg-white/[0.03] p-8">
              <h3 className="font-display text-xl font-semibold tracking-tight text-white">{t.group}</h3>
              <ul className="mt-6 flex flex-wrap gap-2">
                {t.items.map((item) => (
                  <li key={item} className="rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-sm text-white/80">
                    {item}
                  </li>
                ))}
              </ul>
              {"note" in t && <p className="mt-auto pt-6 text-sm leading-relaxed text-white/60">{t.note}</p>}
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Education & credentials */}
      <Section tone="mist" aria-labelledby="credentials-heading">
        <SectionHeader index="05" eyebrow="Education & credentials" title={<span id="credentials-heading">Trained as an engineer, certified in search.</span>} />
        <div className="grid gap-5 lg:grid-cols-3">
          <Reveal className="rounded-[28px] border border-mist-200 bg-white p-8">
            <GraduationCap className="size-6 text-brand-700" aria-hidden />
            <h3 className="mt-6 text-sm font-medium text-mist-500">Education</h3>
            <p className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink-900">{p.education.degree}</p>
            <p className="mt-2 text-mist-600">
              {p.education.school}, {p.education.detail}
            </p>
          </Reveal>
          <Reveal className="rounded-[28px] border border-mist-200 bg-white p-8" delay={0.06}>
            <Award className="size-6 text-brand-700" aria-hidden />
            <h3 className="mt-6 text-sm font-medium text-mist-500">Certifications</h3>
            <p className="mt-2 leading-relaxed text-mist-600">{p.certifications.summary}</p>
            <ul className="mt-5 flex flex-wrap gap-2">
              {p.certifications.items.map((c) => (
                <li key={c} className="rounded-full bg-mist-50 px-3.5 py-1.5 text-sm text-mist-700">
                  {c}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal className="rounded-[28px] border border-mist-200 bg-white p-8" delay={0.12}>
            <Users className="size-6 text-brand-700" aria-hidden />
            <h3 className="mt-6 text-sm font-medium text-mist-500">Leadership & activities</h3>
            <ul className="mt-3 space-y-2.5">
              {p.activities.map((a) => (
                <li key={a} className="flex gap-3 text-ink-900">
                  <Check className="mt-1 size-4 shrink-0 text-brand-600" aria-hidden />
                  {a}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </Section>

      <CtaBanner
        eyebrow="Work with Jony’s team"
        title="Want your business found on Google and in AI search?"
        description="Tell us about your business and where you want to grow. Jony and the Jarz Digital team reply within 24 hours."
        whatsapp={{ intent: "I’d like to work with Jony and the Jarz Digital team.", from: "Founder profile page", path: PATH }}
        secondary={{ label: "Meet the rest of the team", href: "/about#team" }}
      />
    </>
  );
}
