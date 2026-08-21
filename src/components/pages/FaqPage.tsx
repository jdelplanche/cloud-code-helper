import { Link } from "@tanstack/react-router";
import { Arrow, PageShellLite, SectionTitle, actionClass } from "@/components/site/Layout";
import { getExtraDict } from "@/i18n/extra";
import { slugs, type Locale } from "@/i18n/config";

export function FaqPage({ locale }: { locale: Locale }) {
  const p = getExtraDict(locale).faq;

  return (
    <PageShellLite index={p.index} title={p.title} lead={p.lead}>
      {p.groups.map((group) => (
        <section key={group.index}>
          <SectionTitle index={group.index} title={group.title} lead={group.lead} />
          <div className="mt-8 space-y-4">
            {group.items.map((item) => (
              <details
                key={item.q}
                className="group rounded-2xl border border-gridline bg-card px-5 py-4 transition-colors open:border-gridline-strong md:px-7 md:py-5"
              >
                <summary className="flex cursor-pointer list-none items-start justify-between gap-6 text-sm leading-relaxed text-ebony marker:hidden">
                  <span>{item.q}</span>
                  <span
                    aria-hidden="true"
                    className="mt-0.5 shrink-0 font-mono text-[13px] text-muted-ink transition-transform duration-300 group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-3.5 max-w-3xl text-sm leading-relaxed text-muted-ink">{item.a}</p>
              </details>
            ))}
          </div>
        </section>
      ))}

      <section>
        <SectionTitle index={p.ctaIndex} title={p.ctaTitle} lead={p.ctaLead} />
        <div className="mt-8">
          <Link
            to="/$lang/$slug"
            params={{ lang: locale, slug: slugs.contact[locale] }}
            className={`${actionClass} w-full sm:w-auto`}
          >
            {p.ctaLabel} <Arrow />
          </Link>
        </div>
      </section>
    </PageShellLite>
  );
}
