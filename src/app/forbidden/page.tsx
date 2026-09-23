import type { Metadata } from "next";
import { StatusPage } from "@/components/marketing/status-page";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = { title: "Access denied", robots: { index: false } };

/** Shown when a signed-in user lacks the role required for a page. */
export default function ForbiddenPage() {
  return (
    <StatusPage
      code="403"
      title="You don’t have access to this area."
      description="Your account doesn’t have permission to view this page. If you think this is a mistake, ask an administrator to update your role."
      actions={
        <>
          <ButtonLink href="/dashboard" arrow>
            Go to your dashboard
          </ButtonLink>
          <ButtonLink href="/" variant="outline-light">
            Back to home
          </ButtonLink>
        </>
      }
    />
  );
}
