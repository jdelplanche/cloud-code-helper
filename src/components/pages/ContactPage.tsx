import { useState } from "react";
import { Check, Copy, Loader2 } from "lucide-react";
import { useLocale, type Dict } from "@/i18n";
import {
  Arrow,
  Field,
  PageShellLite,
  SectionTitle,
  StatusLine,
  actionClass,
  fieldClass,
} from "@/components/site/Layout";

const FINGERPRINT = "4A2B 8F91 C3E4 D5F6 7890 1234 5678 90AB CDEF 1234";
const MATRIX_ID = "@jona:delplanche.cloud";

export function ContactPage({ t }: { t: Dict }) {
  const p = t.contactPage;
  const [copied, setCopied] = useState<"pgp" | "matrix" | null>(null);
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const locale = useLocale();

  const copy = async (value: string, key: "pgp" | "matrix") => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      setTimeout(() => setCopied(null), 2400);
    } catch {
      setCopied(null);
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setState("sending");
    try {
      const res = await fetch("/api/public/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locale,
          name: String(form.get("name") ?? ""),
          email: String(form.get("email") ?? ""),
          subject: String(form.get("subject") ?? ""),
          message: String(form.get("message") ?? ""),
          company: String(form.get("company") ?? ""),
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setState("sent");
    } catch {
      setState("error");
    }
  };

  return (
    <PageShellLite index={p.index} title={p.title} lead={p.lead}>
      <section>
        <SectionTitle index={p.formIndex} title={p.formTitle} lead={p.formLead} />
        <div className="mt-8">
          {state === "sent" ? (
            <div>
              <StatusLine label={p.sentTitle} />
              <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted-ink">{p.sentBody}</p>
              <button
                type="button"
                className={`${actionClass} mt-8`}
                onClick={() => setState("idle")}
              >
                {p.again} <Arrow />
              </button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="grid gap-8 md:grid-cols-2 md:gap-10">
              <div aria-hidden="true" className="hidden">
                <label htmlFor="company">Company</label>
                <input id="company" name="company" tabIndex={-1} autoComplete="off" />
              </div>
              <Field label={p.name}>
                <input required name="name" className={fieldClass} placeholder="Jona Delplanche" />
              </Field>
              <Field label={p.email}>
                <input
                  required
                  type="email"
                  name="email"
                  className={fieldClass}
                  placeholder="you@company.be"
                />
              </Field>
              <div className="md:col-span-2">
                <Field label={p.subject}>
                  <input
                    required
                    name="subject"
                    className={fieldClass}
                    placeholder={p.subjectPlaceholder}
                  />
                </Field>
              </div>
              <div className="md:col-span-2">
                <Field label={p.message}>
                  <textarea
                    required
                    name="message"
                    rows={5}
                    minLength={10}
                    className={`${fieldClass} resize-none`}
                    placeholder={p.messagePlaceholder}
                  />
                </Field>
              </div>
              <div className="flex flex-wrap items-center gap-5 md:col-span-2">
                <button type="submit" disabled={state === "sending"} className={actionClass}>
                  {state === "sending" ? (
                    <>
                      <Loader2 size={12} className="animate-spin" /> {p.submitting}
                    </>
                  ) : (
                    <>
                      {p.submit} <Arrow />
                    </>
                  )}
                </button>
                <span className="font-mono text-[10px] tracking-[0.16em] text-muted-ink uppercase">
                  {p.zeroTracking}
                </span>
                {state === "error" && (
                  <span
                    aria-live="polite"
                    className="font-mono text-[10px] tracking-[0.16em] text-ebony uppercase"
                  >
                    {p.error}
                  </span>
                )}
              </div>
            </form>
          )}
        </div>
      </section>

      <section>
        <SectionTitle index={p.channelsIndex} title={p.channelsTitle} />
        <div className="mt-8 divide-y divide-gridline border-y border-gridline md:grid md:grid-cols-2 md:gap-12 md:divide-y-0">
          <div className="py-7">
            <span className="font-mono text-[10px] tracking-[0.18em] text-muted-ink uppercase">
              {p.mailLabel}
            </span>
            <a
              href="mailto:core@delplanche.cloud"
              className="mt-3 block font-mono text-[14px] text-ebony transition-colors hover:text-moss"
            >
              core@delplanche.cloud
            </a>
            <p className="mt-4 text-sm leading-relaxed text-muted-ink">{p.mailNote}</p>
          </div>
          <div className="py-7">
            <span className="font-mono text-[10px] tracking-[0.18em] text-muted-ink uppercase">
              {p.matrixLabel}
            </span>
            <a
              href={`https://matrix.to/#/${MATRIX_ID}`}
              target="_blank"
              rel="noreferrer"
              className="mt-3 block font-mono text-[14px] text-ebony transition-colors hover:text-moss"
            >
              {MATRIX_ID}
            </a>
            <p className="mt-4 text-sm leading-relaxed text-muted-ink">{p.matrixNote}</p>
            <button
              type="button"
              className={`${actionClass} mt-6`}
              onClick={() => copy(MATRIX_ID, "matrix")}
            >
              {copied === "matrix" ? <Check size={12} /> : <Copy size={12} />}
              {copied === "matrix" ? p.copied : p.copyMatrix}
            </button>
          </div>
        </div>
      </section>

      <section>
        <SectionTitle index={p.verifyIndex} title={p.verifyTitle} lead={p.verifyLead} />
        <div className="mt-8 overflow-hidden rounded-2xl border border-gridline-strong bg-card">
          <div className="border-b border-gridline px-4 py-2.5 font-mono text-[9px] tracking-[0.2em] text-muted-ink uppercase">
            // PGP FINGERPRINT / SHA-256 CHECKSUM
          </div>
          <p className="px-4 py-5 font-mono text-[12.5px] leading-[1.9] font-medium tracking-[0.08em] break-words text-ebony md:text-[14px]">
            {FINGERPRINT}
          </p>
        </div>
        <button
          type="button"
          className={`${actionClass} mt-6`}
          onClick={() => copy(FINGERPRINT, "pgp")}
        >
          {copied === "pgp" ? <Check size={12} /> : <Copy size={12} />}
          {copied === "pgp" ? p.copied : p.copyFingerprint}
        </button>
      </section>
    </PageShellLite>
  );
}
