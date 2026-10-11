"use client";

import { useEffect, useId, useRef, useState, type InputHTMLAttributes } from "react";
import { useFormAction } from "@/hooks/use-form-action";
import { requestBusinessAnalysis } from "@/lib/actions/business-analysis";
import { track } from "@/lib/analytics";
import { ANALYZE_EN, type AnalyzeStrings } from "./analyze-strings";

/** Panel beside the calculator video guide, opening the request form in a modal. */
export function BusinessAnalysis({ s = ANALYZE_EN }: { s?: AnalyzeStrings }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const headingId = useId();
  // Remounting the form after a successful send gives the next visitor a clean form.
  const [formKey, setFormKey] = useState(0);
  const sentRef = useRef(false);

  const open = () => dialogRef.current?.showModal();
  const close = () => dialogRef.current?.close();
  const onClose = () => {
    if (sentRef.current) {
      sentRef.current = false;
      setFormKey((k) => k + 1);
    }
  };

  return (
    <div className="calc-analyze">
      <h3>{s.title}</h3>
      <p>{s.text}</p>
      <ul>
        {s.points.map((p) => <li key={p}>{p}</li>)}
      </ul>
      <button type="button" className="calc-analyze-btn" onClick={open} aria-haspopup="dialog">{s.button}</button>
      <small>{s.note}</small>

      <dialog
        ref={dialogRef}
        className="calc-analyze-dialog"
        aria-labelledby={headingId}
        onClose={onClose}
        onClick={(e) => { if (e.target === e.currentTarget) close(); }}
      >
        <div className="cad-body">
          <button type="button" className="cad-x" onClick={close} aria-label={s.close}>
            <svg viewBox="0 0 24 24" aria-hidden><path d="M6 6l12 12M18 6 6 18" /></svg>
          </button>
          <h2 id={headingId}>{s.button}</h2>
          <AnalyzeForm key={formKey} s={s} onSent={() => (sentRef.current = true)} onDone={close} />
        </div>
      </dialog>
    </div>
  );
}

function AnalyzeForm({ s, onSent, onDone }: { s: AnalyzeStrings; onSent: () => void; onDone: () => void }) {
  const formRef = useRef<HTMLFormElement>(null);
  const startedAt = useRef<number | null>(null);
  const { state, action, onSubmit, pending } = useFormAction(requestBusinessAnalysis, {
    validate: (fd) => {
      fd.set("startedAt", String(startedAt.current ?? Date.now()));
      fd.set("pagePath", window.location.pathname);
      return true;
    },
    onSuccess: () => {
      onSent();
      track("generate_lead", { form: "business-analysis" });
    },
  });
  const errors = (!state.ok && state.fieldErrors) || {};

  useEffect(() => {
    if (!state.ok && state.fieldErrors) {
      const first = Object.keys(state.fieldErrors)[0];
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
    }
  }, [state]);

  if (state.ok) {
    return (
      <div className="cad-sent" role="status">
        <p><b>{s.sentTitle}.</b> {state.message}</p>
        <button type="button" className="calc-analyze-btn" onClick={onDone} autoFocus>{s.close}</button>
      </div>
    );
  }

  const field = (name: "name" | "businessName" | "phone" | "websiteUrl" | "address", props: InputHTMLAttributes<HTMLInputElement>, optional = false) => (
    <label className={`cad-field${name === "address" ? " full" : ""}`}>
      <span>
        {s[name]}
        {optional && <em> ({s.optional})</em>}
      </span>
      <input
        name={name}
        required={!optional}
        aria-invalid={errors[name] ? true : undefined}
        aria-describedby={errors[name] ? `cad-err-${name}` : undefined}
        {...props}
      />
      {errors[name] && <i id={`cad-err-${name}`}>{errors[name]}</i>}
    </label>
  );

  return (
    <form ref={formRef} action={action} onSubmit={onSubmit} onFocus={() => (startedAt.current ??= Date.now())}>
      <p className="cad-lead">{s.formText}</p>
      <div className="cad-grid">
        {field("name", { autoComplete: "name", maxLength: 120, minLength: 2 })}
        {field("businessName", { autoComplete: "organization", maxLength: 160, minLength: 2 })}
        {field("phone", { type: "tel", autoComplete: "tel", maxLength: 40, inputMode: "tel" })}
        {field("websiteUrl", { type: "text", inputMode: "url", autoComplete: "url", maxLength: 300, placeholder: "yourbusiness.com" }, true)}
        {field("address", { autoComplete: "street-address", maxLength: 300 }, true)}
      </div>
      <div aria-hidden className="cad-hp">
        <label>Website<input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" /></label>
      </div>
      {!state.ok && state.error && <p className="cad-error" role="alert">{state.error}</p>}
      <button type="submit" className="calc-analyze-btn" disabled={pending}>{pending ? s.sending : s.submit}</button>
    </form>
  );
}
