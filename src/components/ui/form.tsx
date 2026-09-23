import { useId, type ComponentProps, type ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const control =
  "w-full rounded-xl border bg-white px-4 text-[0.9375rem] text-ink-900 placeholder:text-mist-400 shadow-[0_1px_0_rgb(6_11_19/0.02)] transition-[border-color,box-shadow] duration-200 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 disabled:cursor-not-allowed disabled:bg-mist-50 aria-[invalid=true]:border-danger-500 aria-[invalid=true]:focus:ring-danger-500/15";

export const controlClass = (invalid?: boolean, extra?: string) =>
  cn(control, invalid ? "border-danger-500" : "border-mist-200", extra);

export function Label({ className, ...props }: ComponentProps<"label">) {
  return <label className={cn("mb-1.5 block text-sm font-medium text-ink-800", className)} {...props} />;
}

export function Input({ invalid, className, ...props }: ComponentProps<"input"> & { invalid?: boolean }) {
  return <input aria-invalid={invalid || undefined} className={controlClass(invalid, cn("h-12", className))} {...props} />;
}

export function Textarea({ invalid, className, ...props }: ComponentProps<"textarea"> & { invalid?: boolean }) {
  return <textarea aria-invalid={invalid || undefined} className={controlClass(invalid, cn("min-h-32 py-3 leading-relaxed", className))} {...props} />;
}

export function Select({ invalid, className, children, ...props }: ComponentProps<"select"> & { invalid?: boolean }) {
  return (
    <div className="relative">
      <select aria-invalid={invalid || undefined} className={controlClass(invalid, cn("h-12 appearance-none pr-10", className))} {...props}>
        {children}
      </select>
      <svg aria-hidden viewBox="0 0 20 20" className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-mist-500">
        <path fill="currentColor" d="M5.3 7.3a1 1 0 0 1 1.4 0L10 10.6l3.3-3.3a1 1 0 1 1 1.4 1.4l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 0 1 0-1.4Z" />
      </svg>
    </div>
  );
}

export function FieldError({ id, message }: { id?: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-1.5 flex items-center gap-1.5 text-sm text-danger-500">
      <AlertCircle className="size-3.5 shrink-0" aria-hidden />
      {message}
    </p>
  );
}

/**
 * Label + control + help + error, wired together with ids so screen readers
 * announce errors against the right input.
 */
export function Field({
  label,
  help,
  error,
  required,
  className,
  children,
}: {
  label: ReactNode;
  help?: ReactNode;
  error?: string;
  required?: boolean;
  className?: string;
  children: (props: { id: string; "aria-describedby"?: string; invalid: boolean }) => ReactNode;
}) {
  const id = useId();
  const describedBy = [help ? `${id}-help` : null, error ? `${id}-error` : null].filter(Boolean).join(" ") || undefined;
  return (
    <div className={className}>
      <Label htmlFor={id}>
        {label}
        {required && <span className="ml-0.5 text-brand-600" aria-hidden>*</span>}
      </Label>
      {children({ id, "aria-describedby": describedBy, invalid: Boolean(error) })}
      {help && !error && (
        <p id={`${id}-help`} className="mt-1.5 text-sm text-mist-500">
          {help}
        </p>
      )}
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}

export function Checkbox({ label, className, ...props }: ComponentProps<"input"> & { label: ReactNode }) {
  return (
    <label className={cn("flex cursor-pointer items-start gap-3 text-sm text-mist-700", className)}>
      <input type="checkbox" className="mt-0.5 size-4 shrink-0 rounded border-mist-300 accent-brand-600" {...props} />
      <span>{label}</span>
    </label>
  );
}

/** Invisible honeypot field for spam protection (bots fill it, humans never see it). */
export function Honeypot() {
  return (
    <div aria-hidden className="absolute left-[-10000px] top-auto h-px w-px overflow-hidden">
      <label>
        Website
        <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
      </label>
    </div>
  );
}
