import type { Metadata } from "next";
import { MediaLibrary } from "@/components/admin/media-library";
import { PageHeader } from "@/components/admin/ui";
import { requirePermission } from "@/lib/auth/session";
import { env } from "@/lib/env";

export const metadata: Metadata = { title: "Media library" };

export default async function MediaPage() {
  await requirePermission("media:manage");
  return (
    <>
      <PageHeader
        title="Media library"
        description={`Images for posts, projects and pages. Storage driver: ${env.STORAGE_DRIVER}. Max ${env.MAX_UPLOAD_MB} MB per file.`}
        crumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Media" }]}
      />
      <MediaLibrary />
    </>
  );
}
