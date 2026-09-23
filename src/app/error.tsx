"use client";

import { useEffect } from "react";
import { StatusPage } from "@/components/marketing/status-page";
import { Button, ButtonLink } from "@/components/ui/button";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <StatusPage
      code="500"
      title="Something went wrong."
      description={`An unexpected error occurred. Please try again — if it keeps happening, contact us and quote reference ${error.digest ?? "N/A"}.`}
      actions={
        <>
          <Button onClick={reset} arrow>
            Try again
          </Button>
          <ButtonLink href="/" variant="outline-light">
            Back to home
          </ButtonLink>
        </>
      }
    />
  );
}
