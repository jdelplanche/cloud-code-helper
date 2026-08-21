import type { Dict } from "@/i18n";
import { PageShellLite } from "@/components/site/Layout";

export function LegalPage({ t }: { t: Dict }) {
  const p = t.legalPage;
  return (
    <PageShellLite index={p.index} title={p.title} lead={p.lead}>
      <section>
        <dl className="divide-y divide-gridline border-y border-gridline">
          {p.rows.map(([k, v]) => (
            <div
              key={k}
              className="flex flex-col gap-1.5 py-4 md:flex-row md:items-baseline md:gap-10"
            >
              <dt className="w-56 shrink-0 font-mono text-[10px] tracking-[0.16em] text-muted-ink uppercase">
                {k}
              </dt>
              <dd className="text-sm leading-relaxed text-ebony">{v}</dd>
            </div>
          ))}
        </dl>
      </section>
      <section>
        <h2 className="text-xl text-ebony">{p.liabilityTitle}</h2>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-ink">{p.liabilityBody}</p>
      </section>
    </PageShellLite>
  );
}
