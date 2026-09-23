import type { Metadata } from "next";
import { ProjectRequestForm } from "@/components/dashboard/forms";
import { DashHeader, Panel } from "@/components/dashboard/ui";
import { requireUser } from "@/lib/auth/session";
import { getServices } from "@/lib/data/public";

export const metadata: Metadata = { title: "New project request" };

export default async function NewRequestPage({ searchParams }: PageProps<"/dashboard/requests/new">) {
  await requireUser("/dashboard/requests/new");
  const [{ service }, services] = await Promise.all([searchParams, getServices()]);
  return (
    <>
      <DashHeader eyebrow="New request" title="Tell us about your project." description="The more detail you share, the faster we can come back with a plan. We respond within 24 hours." />
      <Panel>
        <ProjectRequestForm services={services.map((s) => ({ slug: s.slug, title: s.title }))} defaultService={typeof service === "string" ? service : undefined} />
      </Panel>
    </>
  );
}
