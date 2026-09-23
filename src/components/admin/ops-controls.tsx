"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { LEAD_STATUS_META } from "@/config/forms";
import { addLeadNoteAction, markNotificationsReadAction, sendRequestMessageAction, setUserStatusAction, updateLeadStatusAction, updateRequestAction, updateUserRoleAction } from "@/lib/actions/admin";
import type { ActionResult } from "@/lib/actions/types";
import { cn } from "@/lib/utils";

function useRun() {
  const [pending, start] = useTransition();
  const toast = useToast();
  const router = useRouter();
  const run = (fn: () => Promise<ActionResult<unknown>>, after?: () => void) =>
    start(async () => {
      const res = await fn();
      if (res.ok) {
        toast.success(res.message ?? "Saved");
        after?.();
        router.refresh();
      } else toast.error(res.error);
    });
  return { pending, run };
}

const STATUSES = Object.entries(LEAD_STATUS_META) as [keyof typeof LEAD_STATUS_META, (typeof LEAD_STATUS_META)[keyof typeof LEAD_STATUS_META]][];

/** Segmented status picker for the lead / request pipeline. */
export function StatusPicker({ id, value, kind }: { id: string; value: string; kind: "lead" | "request" }) {
  const { pending, run } = useRun();
  return (
    <div role="radiogroup" aria-label="Status" className={cn("flex flex-wrap gap-1.5", pending && "opacity-60")}>
      {STATUSES.map(([key, meta]) => (
        <button
          key={key}
          type="button"
          role="radio"
          aria-checked={value === key}
          disabled={pending}
          onClick={() => value !== key && run(() => (kind === "lead" ? updateLeadStatusAction(id, key) : updateRequestAction(id, { status: key })))}
          className={cn(
            "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
            value === key ? "border-ink-900 bg-ink-900 text-white" : "border-mist-200 bg-white text-mist-600 hover:border-mist-400",
          )}
        >
          {meta.label}
        </button>
      ))}
    </div>
  );
}

export function ProgressControl({ id, value }: { id: string; value: number }) {
  const { pending, run } = useRun();
  const [v, setV] = useState(value);
  return (
    <div className="flex items-center gap-3">
      <input type="range" min={0} max={100} step={5} value={v} onChange={(e) => setV(Number(e.target.value))} aria-label="Progress" className="flex-1 accent-brand-600" />
      <span className="w-10 text-right text-sm tabular-nums text-ink-900">{v}%</span>
      <Button size="sm" variant="outline" loading={pending} disabled={v === value} onClick={() => run(() => updateRequestAction(id, { progress: v }))}>
        Save
      </Button>
    </div>
  );
}

export function NoteForm({ id }: { id: string }) {
  const { pending, run } = useRun();
  const [body, setBody] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        run(() => addLeadNoteAction(id, body), () => setBody(""));
      }}
      className="space-y-2"
    >
      <label htmlFor="note" className="sr-only">
        Internal note
      </label>
      <textarea id="note" value={body} onChange={(e) => setBody(e.target.value)} rows={3} placeholder="Add an internal note (only visible to staff)…" className="w-full rounded-xl border border-mist-200 px-3 py-2 text-sm outline-none focus:border-brand-500" />
      <div className="flex justify-end">
        <Button type="submit" size="sm" variant="dark" loading={pending} disabled={!body.trim()}>
          Add note
        </Button>
      </div>
    </form>
  );
}

export function MessageComposer({ requestId, placeholder = "Write a message…" }: { requestId: string; placeholder?: string }) {
  const { pending, run } = useRun();
  const [body, setBody] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        run(() => sendRequestMessageAction(requestId, body), () => setBody(""));
      }}
      className="flex flex-col gap-2 sm:flex-row sm:items-end"
    >
      <label htmlFor="message" className="sr-only">
        Message
      </label>
      <textarea
        id="message"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && body.trim()) run(() => sendRequestMessageAction(requestId, body), () => setBody(""));
        }}
        rows={2}
        placeholder={placeholder}
        className="min-h-[3rem] flex-1 rounded-xl border border-mist-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
      />
      <Button type="submit" variant="dark" size="md" loading={pending} disabled={!body.trim()}>
        Send
      </Button>
    </form>
  );
}

export function RoleSelect({ id, value, disabled }: { id: string; value: string; disabled?: boolean }) {
  const { pending, run } = useRun();
  return (
    <select
      value={value}
      disabled={disabled || pending}
      onChange={(e) => run(() => updateUserRoleAction(id, e.target.value))}
      aria-label="Role"
      className="h-10 rounded-xl border border-mist-200 bg-white px-3 text-sm outline-none focus:border-brand-500 disabled:opacity-60"
    >
      <option value="USER">User (client)</option>
      <option value="EDITOR">Editor</option>
      <option value="ADMIN">Admin</option>
    </select>
  );
}

export function UserStatusButton({ id, status, disabled }: { id: string; status: string; disabled?: boolean }) {
  const { pending, run } = useRun();
  const suspended = status === "suspended";
  return (
    <Button
      variant={suspended ? "dark" : "outline"}
      size="sm"
      loading={pending}
      disabled={disabled}
      onClick={() => run(() => setUserStatusAction(id, suspended ? "active" : "suspended"))}
      className={cn(!suspended && "border-red-200 text-danger-500 hover:border-danger-500 hover:bg-danger-500 hover:text-white")}
    >
      {suspended ? "Reactivate account" : "Suspend account"}
    </Button>
  );
}

export function MarkAllRead() {
  const { pending, run } = useRun();
  return (
    <Button variant="outline" size="sm" loading={pending} onClick={() => run(() => markNotificationsReadAction("all"))}>
      Mark all as read
    </Button>
  );
}
