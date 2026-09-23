"use client";

import { startTransition, useActionState, type FormEvent } from "react";
import { initialActionState, type ActionResult } from "@/lib/actions/types";

/**
 * Wraps a server action for use in a form without React 19's automatic
 * form reset (which would wipe what the user typed whenever validation
 * fails). With JavaScript, submission goes through `onSubmit`; without it,
 * the `action` prop still posts to the server action (progressive enhancement).
 *
 *   const { state, action, onSubmit, pending } = useFormAction(loginAction);
 *   <form action={action} onSubmit={onSubmit}>…</form>
 */
export function useFormAction<T = undefined>(
  fn: (prev: ActionResult<T>, formData: FormData) => Promise<ActionResult<T>>,
  opts: { validate?: (formData: FormData) => boolean; onSuccess?: (state: ActionResult<T>) => void } = {},
) {
  const [state, action, pending] = useActionState(async (prev: ActionResult<T>, fd: FormData) => {
    const res = await fn(prev, fd);
    if (res.ok) opts.onSuccess?.(res);
    return res;
  }, initialActionState as ActionResult<T>);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (opts.validate && !opts.validate(fd)) return;
    startTransition(() => action(fd));
  };

  return { state, action, onSubmit, pending };
}
