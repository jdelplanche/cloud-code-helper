import { BrandMark } from "@/components/site/TopNav";
import { CopyAction } from "@/components/site/CopyAction";
import { LocaleLink, useDict, useLocale } from "@/i18n";
import { getExtraDict } from "@/i18n/extra";
import type { PageKey } from "@/i18n/config";
import { getAnnotations } from "@/i18n/annotations";
import { Marginalia } from "@/components/site/Marginalia";
import { Arrow, actionClass } from "@/components/site/Layout";

type Item = { label: string; page?: PageKey; href?: string };

/** Technische kanalen — strikt monospace metadata, geen social icons. */
const CHANNELS: {
  label: string;
  value: string;
  href: string;
  external?: boolean;
}[] = [
  {
    label: "GITHUB",
    value: "delplanche/cloud",
    href: "https://github.com/delplanche/cloud",
    external: true,
  },
  {
    label: "REPOSITORIES",
    value: "delplanche",
    href: "https://github.com/delplanche",
    external: true,
  },
  {
    label: "MATRIX",
    value: "@jona:delplanche.cloud",
    href: "https://matrix.to/#/@jona:delplanche.cloud",
    external: true,
  },
  { label: "PGP KEY", value: "9F3C 21A7 D4B8 6E05", href: "/pgp.asc" },
];

export function Footer() {
  const t = useDict();
  const locale = useLocale();
  const notes = getAnnotations(locale);

  const columns: { title: string; items: Item[] }[] = [
    {
      title: t.footer.infrastructure,
      items: [
        { label: t.stacks[0]!.title, page: "stack" },
        { label: t.stacks[1]!.title, page: "stack" },
        { label: t.stacks[2]!.title, page: "stack" },
      ],
    },
    {
      title: t.footer.law,
      items: [
        { label: t.nav.security.replace(/^\d+\s/, ""), page: "security" },
        { label: t.privacyPage.title, page: "privacy" },
        { label: t.legalPage.title, page: "legal" },
      ],
    },
    {
      title: t.footer.vectors,
      items: [
        { label: t.onboardingPage.title, page: "onboarding" },
        { label: getExtraDict(locale).faq.title, page: "faq" },
        { label: getExtraDict(locale).gateway.title, page: "gateway" },
        { label: t.contactPage.title, page: "contact" },
      ],
    },
  ];

  const linkClass =
    "group flex min-h-11 items-center justify-between gap-3 font-mono text-[10px] tracking-[0.16em] text-muted-ink uppercase transition-colors hover:text-ebony focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-moss";

  const microLabel = "font-mono text-[9px] tracking-[0.2em] text-muted-ink uppercase";

  return (
    <footer className="border-t border-gridline">
      <div className="dossier-gutter mx-auto w-full max-w-6xl py-10 md:py-16">
        {/* Handgeschreven annotatie, zwevend op de bovenrand van het titelblok */}
        <Marginalia rotate={-1.2} className="relative z-10 ml-3 -mb-2 sm:ml-8">
          {notes.hosting}
        </Marginalia>

        {/* Architectonisch titelblok — één technisch raster, scherpe hoeken */}
        <section
          data-testid="footer-titleblock"
          className="border border-gridline bg-card/60 divide-y divide-gridline"
        >
          {/* Rij 1: identiteit + navigatiekolommen */}
          <div className="grid gap-6 p-5 sm:p-6 md:grid-cols-[1fr_1.7fr] md:gap-10">
            <div>
              <BrandMark className="font-mono text-[12px] font-medium tracking-[0.16em] text-ebony" />
              <p className="mt-3 max-w-sm text-[13px] leading-relaxed text-muted-ink">
                {t.footer.tagline}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
                <CopyAction value="core@delplanche.cloud" label="core@delplanche.cloud" />
                <LocaleLink page="contact" className={actionClass}>
                  {t.footer.contactCta} <Arrow />
                </LocaleLink>
              </div>
            </div>

            {/* Desktop kolommen */}
            <div className="hidden gap-8 sm:grid sm:grid-cols-3">
              {columns.map((col) => (
                <div key={col.title} className="flex flex-col gap-1">
                  <span className="mb-1 font-mono text-[9px] font-semibold tracking-[0.2em] text-ebony uppercase">
                    {col.title}
                  </span>
                  {col.items.map((item) => (
                    <LocaleLink key={item.label} page={item.page ?? "home"} className={linkClass}>
                      {item.label}
                    </LocaleLink>
                  ))}
                </div>
              ))}
            </div>

            {/* Mobiel: accordeons */}
            <div className="divide-y divide-gridline border-t border-gridline sm:hidden">
              {columns.map((col) => (
                <details key={col.title} className="group">
                  <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between font-mono text-[10px] font-semibold tracking-[0.2em] text-ebony uppercase">
                    {col.title}
                    <span className="text-muted-ink transition-transform group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <div className="flex flex-col pb-2">
                    {col.items.map((item) => (
                      <LocaleLink key={item.label} page={item.page ?? "home"} className={linkClass}>
                        {item.label}
                      </LocaleLink>
                    ))}
                  </div>
                </details>
              ))}
            </div>
          </div>

          {/* Rij 2: vector-microgrid — compacte label/waarde-rijen */}
          <div
            data-testid="footer-channels"
            className="grid grid-cols-1 divide-y divide-gridline sm:grid-cols-2 sm:divide-y-0 md:grid-cols-4 sm:[&>a]:border-b sm:[&>a]:border-gridline sm:[&>a:nth-child(n+3)]:border-b-0 md:[&>a]:border-b-0 sm:divide-x sm:divide-gridline"
          >
            {CHANNELS.map((c) => (
              <a
                key={c.label}
                href={c.href}
                {...(c.external
                  ? {
                      target: "_blank",
                      rel: "noopener noreferrer",
                      "aria-label": `${c.label}: ${c.value} (opens in a new tab)`,
                    }
                  : { "aria-label": `${c.label}: ${c.value}` })}
                className="group flex min-h-11 items-baseline justify-between gap-3 px-5 py-3 transition-colors hover:bg-ebony/[0.03] focus-visible:outline focus-visible:outline-1 focus-visible:-outline-offset-2 focus-visible:outline-moss sm:px-6"
              >
                <span className={microLabel}>{c.label}</span>
                <span className="flex items-baseline gap-2">
                  <span className="font-mono text-[11px] tracking-[0.04em] text-ebony">
                    {c.value}
                  </span>
                  {c.external ? (
                    <span
                      aria-hidden="true"
                      className="font-mono text-[10px] text-muted-ink transition-colors group-hover:text-terracotta"
                    >
                      ↗
                    </span>
                  ) : null}
                </span>
              </a>
            ))}
          </div>

          {/* Rij 3: micro-print colofon — stewardship, copyright, hosting, impressum */}
          <div className="px-5 py-4 sm:px-6">
            <p
              data-testid="footer-stewardship"
              className="max-w-4xl font-mono text-[9px] leading-[1.7] tracking-[0.05em] text-muted-ink"
            >
              {notes.stewardship}
            </p>
            <p className="mt-2 font-mono text-[9px] leading-[1.7] tracking-[0.14em] text-muted-ink uppercase">
              // © 2026 delplanche.cloud · {t.footer.hosting.replace(/^\/\/\s*/, "")} ·{" "}
              {t.footer.impressum}{" "}
              <LocaleLink
                page="legal"
                className="underline underline-offset-2 transition-colors hover:text-ebony focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-moss"
              >
                {t.footer.impressumLink}
              </LocaleLink>
            </p>
          </div>
        </section>
      </div>
    </footer>
  );
}
