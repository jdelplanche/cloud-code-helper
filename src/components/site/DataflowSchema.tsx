import { useState } from "react";
import { SectionTitle } from "@/components/site/Layout";
import { getExtraDict } from "@/i18n/extra";
import type { Locale } from "@/i18n/config";

/** Technisch blueprint-schema van het soevereine datapad. */
export function DataflowSchema({ locale }: { locale: Locale }) {
  const p = getExtraDict(locale).flow;
  const [active, setActive] = useState(0);

  return (
    <section>
      <SectionTitle index={p.index} title={p.title} lead={p.lead} />

      <div className="mt-6 flex items-center gap-4">
        <span className="font-mono text-[9px] tracking-[0.22em] text-moss uppercase">
          {p.marker}
        </span>
        <span className="h-px grow bg-gridline" />
        <span className="font-mono text-[9px] tracking-[0.22em] text-muted-ink uppercase">
          {p.hint}
        </span>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3 md:gap-5">
        {p.steps.map((step, i) => {
          const isActive = i === active;
          return (
            <div key={step.code} className="relative flex flex-col">
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-expanded={isActive}
                aria-controls={`flow-detail-${i}`}
                className={`flex h-full flex-col rounded-2xl border bg-card px-5 py-5 text-left transition-colors md:px-6 md:py-6 ${
                  isActive
                    ? "border-gridline-strong ring-1 ring-moss/40"
                    : "border-gridline hover:border-gridline-strong"
                }`}
              >
                <span className="font-mono text-[10px] tracking-[0.22em] text-muted-ink">
                  {step.code}
                </span>
                <h3 className="mt-3 text-base leading-tight text-ebony md:text-lg">{step.title}</h3>
                <p className="mt-1.5 font-mono text-[10px] tracking-[0.16em] text-moss uppercase">
                  {step.place}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-muted-ink">{step.summary}</p>
              </button>

              {i < p.steps.length - 1 && (
                <span
                  aria-hidden="true"
                  className="mx-auto my-1 font-mono text-[11px] text-muted-ink md:absolute md:top-1/2 md:-right-3.5 md:my-0 md:-translate-y-1/2"
                >
                  <span className="md:hidden">↓</span>
                  <span className="hidden md:inline">→</span>
                </span>
              )}
            </div>
          );
        })}
      </div>

      {p.steps.map((step, i) => (
        <div
          key={`${step.code}-detail`}
          id={`flow-detail-${i}`}
          hidden={i !== active}
          className="mt-5 rounded-2xl border border-gridline bg-card px-5 py-5 md:px-7 md:py-6"
        >
          <p className="font-mono text-[10px] tracking-[0.2em] text-muted-ink uppercase">
            {step.code} // {step.place}
          </p>
          <dl className="mt-4 divide-y divide-gridline">
            {step.specs.map(([k, v]) => (
              <div
                key={k}
                className="flex flex-col gap-1.5 py-3 md:flex-row md:items-baseline md:gap-8"
              >
                <dt className="w-40 shrink-0 font-mono text-[10px] tracking-[0.16em] text-muted-ink uppercase">
                  {k}
                </dt>
                <dd className="font-mono text-[12px] leading-relaxed text-ebony">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </section>
  );
}
