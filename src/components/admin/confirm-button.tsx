"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type ReactNode } from "react";
import { Button, type ButtonVariant } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import type { ActionResult } from "@/lib/actions/types";

/**
 * Button that asks for confirmation before running a server action,
 * then shows a toast and refreshes (or redirects).
 */
export function ConfirmButton({
  action,
  children,
  title,
  description,
  confirmLabel = "Confirm",
  variant = "outline",
  danger = true,
  redirectTo,
  size = "sm",
  className,
}: {
  action: () => Promise<ActionResult<unknown>>;
  children: ReactNode;
  title: string;
  description?: string;
  confirmLabel?: string;
  variant?: ButtonVariant;
  danger?: boolean;
  redirectTo?: string;
  size?: "sm" | "md";
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const toast = useToast();
  const router = useRouter();

  return (
    <>
      <Button type="button" variant={variant} size={size} onClick={() => setOpen(true)} className={className}>
        {children}
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={title}
        description={description}
        size="sm"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={danger ? "danger" : "dark"}
              size="sm"
              loading={pending}
              onClick={() =>
                start(async () => {
                  const res = await action();
                  if (res.ok) {
                    toast.success(res.message ?? "Done.");
                    setOpen(false);
                    if (redirectTo) router.push(redirectTo);
                    else router.refresh();
                  } else toast.error(res.error);
                })
              }
            >
              {confirmLabel}
            </Button>
          </>
        }
      />
    </>
  );
}
