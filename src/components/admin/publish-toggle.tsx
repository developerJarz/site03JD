"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useToast } from "@/components/ui/toast";
import { togglePublishAction } from "@/lib/actions/cms";
import { cn } from "@/lib/utils";

export function PublishToggle({ resource, id, live }: { resource: string; id: string; live: boolean }) {
  const [pending, start] = useTransition();
  const toast = useToast();
  const router = useRouter();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        start(async () => {
          const res = await togglePublishAction(resource, id);
          if (res.ok) {
            toast.success(res.message ?? "Updated");
            router.refresh();
          } else toast.error(res.error);
        })
      }
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset transition-opacity",
        live ? "bg-success-50 text-green-800 ring-green-600/20" : "bg-mist-100 text-mist-700 ring-mist-300/60",
        pending && "opacity-50",
      )}
      title={live ? "Click to unpublish" : "Click to publish"}
    >
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {live ? "Published" : "Draft"}
    </button>
  );
}
