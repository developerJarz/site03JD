import type { Metadata } from "next";
import { StatusPage } from "@/components/marketing/status-page";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = { title: "Page not found", robots: { index: false } };

export default function NotFound() {
  return (
    <StatusPage
      code="404"
      title="This page took a wrong turn."
      description="The page you’re looking for doesn’t exist or has moved. Let’s get you back on track."
      actions={
        <>
          <ButtonLink href="/" arrow>
            Back to home
          </ButtonLink>
          <ButtonLink href="/services" variant="outline-light">
            Explore services
          </ButtonLink>
          <ButtonLink href="/contact" variant="ghost-light">
            Contact us
          </ButtonLink>
        </>
      }
    />
  );
}
