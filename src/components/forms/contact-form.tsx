"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { useFormAction } from "@/hooks/use-form-action";
import { submitLead } from "@/lib/actions/leads";
import { track } from "@/lib/analytics";
import { BUDGET_OPTIONS, PROJECT_TYPE_OPTIONS, TIMELINE_OPTIONS } from "@/config/forms";
import { Button } from "@/components/ui/button";
import { Field, Honeypot, Input, Select, Textarea } from "@/components/ui/form";

export function ContactForm({ services }: { services: { slug: string; title: string }[] }) {
  const params = useSearchParams();
  const formRef = useRef<HTMLFormElement>(null);
  // Spam time-trap: measured from the visitor's first interaction (the page itself is static).
  const startedAt = useRef<number | null>(null);
  const submitted = useRef<{ service?: string; source?: string }>({});
  // Validation happens on the server (contactSchema); its field errors are shown and focused below.
  // Not bundling zod here keeps ~85 KB of JavaScript off every page that links to /contact.
  const { state, action: formAction, onSubmit, pending } = useFormAction(submitLead, {
    validate: (fd) => {
      fd.set("startedAt", String(startedAt.current ?? Date.now()));
      submitted.current = { service: String(fd.get("service") ?? ""), source: String(fd.get("source") ?? "") };
      return true;
    },
    // Fired only after the server has stored the lead (consent-gated in track()).
    onSuccess: () => track("generate_lead", { form: submitted.current.source, service: submitted.current.service, plan: plan ?? undefined }),
  });
  const presetService = params.get("service") ?? "";
  const plan = params.get("plan");
  const intent = params.get("intent");
  const industry = params.get("industry");
  const presetMessage = plan
    ? `I'm interested in the ${plan} plan.`
    : industry
      ? `We're a ${industry.replace(/-/g, " ")} business and would like to discuss our website and online growth.`
      : "";

  const errors = (!state.ok && state.fieldErrors) || {};

  useEffect(() => {
    if (!state.ok && state.fieldErrors) {
      const first = Object.keys(state.fieldErrors)[0];
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
    }
  }, [state]);

  return (
    <AnimatePresence mode="wait">
      {state.ok ? (
        <motion.div
          key="success"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center rounded-[28px] border border-mist-200 bg-white px-8 py-16 text-center"
          role="status"
        >
          <motion.span initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.15, type: "spring", stiffness: 200 }} className="flex size-16 items-center justify-center rounded-full bg-brand-50 text-brand-600">
            <CheckCircle2 className="size-8" aria-hidden />
          </motion.span>
          <h3 className="mt-6 font-display text-3xl font-semibold tracking-tight text-ink-900">Message received.</h3>
          <p className="mt-3 max-w-md text-mist-600">{state.message}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/work" className="inline-flex items-center gap-2 rounded-full bg-ink-900 px-5 py-3 text-sm font-medium text-white hover:bg-ink-700">
              Explore our work <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link href="/blog" className="inline-flex items-center gap-2 rounded-full border border-mist-300 px-5 py-3 text-sm font-medium text-ink-900 hover:border-ink-900">
              Read our insights
            </Link>
          </div>
        </motion.div>
      ) : (
        <motion.form
          key="form"
          ref={formRef}
          action={formAction}
          onSubmit={onSubmit}
          onFocusCapture={() => {
            startedAt.current ??= Date.now();
          }}
          noValidate
          exit={{ opacity: 0, y: -8 }}
          className="relative rounded-[28px] border border-mist-200 bg-white p-6 shadow-soft md:p-10"
        >
          <Honeypot />
          <input type="hidden" name="source" value={intent === "project" ? "start-project" : presetService ? "service-page" : "contact-form"} />
          <input type="hidden" name="pagePath" value="/contact" />

          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Name" required error={errors.name}>
              {(p) => <Input {...p} name="name" autoComplete="name" placeholder="Your full name" />}
            </Field>
            <Field label="Email" required error={errors.email}>
              {(p) => <Input {...p} name="email" type="email" autoComplete="email" placeholder="you@company.com" />}
            </Field>
            <Field label="Phone" error={errors.phone}>
              {(p) => <Input {...p} name="phone" type="tel" autoComplete="tel" placeholder="+1 (555) 000-0000" />}
            </Field>
            <Field label="Company" error={errors.company}>
              {(p) => <Input {...p} name="company" autoComplete="organization" placeholder="Business name" />}
            </Field>
            <Field label="Service" error={errors.service}>
              {(p) => (
                <Select {...p} name="service" defaultValue={presetService}>
                  <option value="">Select a service</option>
                  {services.map((s) => (
                    <option key={s.slug} value={s.slug}>
                      {s.title}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
            <Field label="Budget" error={errors.budget}>
              {(p) => (
                <Select {...p} name="budget" defaultValue="">
                  <option value="">Select a range</option>
                  {BUDGET_OPTIONS.map((b) => (
                    <option key={b}>{b}</option>
                  ))}
                </Select>
              )}
            </Field>
            <Field label="Project type" error={errors.projectType}>
              {(p) => (
                <Select {...p} name="projectType" defaultValue={intent === "project" ? "" : ""}>
                  <option value="">Select a project type</option>
                  {PROJECT_TYPE_OPTIONS.map((b) => (
                    <option key={b}>{b}</option>
                  ))}
                </Select>
              )}
            </Field>
            <Field label="Timeline" error={errors.timeline}>
              {(p) => (
                <Select {...p} name="timeline" defaultValue="">
                  <option value="">When do you want to start?</option>
                  {TIMELINE_OPTIONS.map((b) => (
                    <option key={b}>{b}</option>
                  ))}
                </Select>
              )}
            </Field>
            <Field label="Message" required error={errors.message} className="md:col-span-2" help="Tell us about your business, goals and anything you already have (website, Google profile, ads).">
              {(p) => <Textarea {...p} name="message" rows={5} defaultValue={presetMessage} placeholder="What would you like to achieve?" />}
            </Field>
          </div>

          {!state.ok && state.error && (
            <p role="alert" className="mt-6 rounded-xl bg-danger-50 px-4 py-3 text-sm text-red-700">
              {state.error}
            </p>
          )}

          <div className="mt-8 flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-relaxed text-mist-500">
              By submitting, you agree to be contacted about your inquiry. See our{" "}
              <Link href="/privacy-policy" className="underline underline-offset-2">
                privacy policy
              </Link>
              .
            </p>
            <Button type="submit" size="lg" arrow loading={pending} className="shrink-0">
              {pending ? "Sending…" : "Send message"}
            </Button>
          </div>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
