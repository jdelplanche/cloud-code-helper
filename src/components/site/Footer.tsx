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
const CHANNELS: { label: string; value: string; href: string; external?: boolean }[] = [
  { label: "GITHUB", value: "delplanche/cloud", href: "https://github.com/delplanche/cloud", external: true },
  { label: "REPOSITORIES", value: "delplanche", href: "https://github.com/delplanche", external: true },
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
    "group flex items-center justify-between gap-3 py-1 font-mono text-[10px] tracking-[0.16em] text-muted-ink uppercase transition-colors hover:text-ebony";

  return (
    <footer className="border-t border-gridline">
      <div className="mx-auto w-full max-w-6xl px-6 py-14 md:px-10 md:py-24">
        <div className="grid gap-9 md:grid-cols-[1.1fr_2fr] md:gap-16">
          <div>
            <BrandMark className="font-mono text-[12px] font-medium tracking-[0.16em] text-ebony" />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-ink">
              {t.footer.tagline}
            </p>
            <div className="mt-7">
              <CopyAction value="core@delplanche.cloud" label="core@delplanche.cloud" />
            </div>
            <LocaleLink page="contact" className={`${actionClass} mt-6`}>
              {t.footer.contactCta} <Arrow />
            </LocaleLink>
          </div>

          {/* Desktop kolommen */}
          <div className="hidden gap-10 sm:grid sm:grid-cols-3">
            {columns.map((col) => (
              <div key={col.title} className="flex flex-col gap-3">
                <span className="font-mono text-[10px] font-semibold tracking-[0.2em] text-ebony uppercase">
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
          <div className="divide-y divide-gridline border-y border-gridline sm:hidden">
            {columns.map((col) => (
              <details key={col.title} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between font-mono text-[10px] font-semibold tracking-[0.2em] text-ebony uppercase">
                  {col.title}
                  <span className="text-muted-ink transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <div className="mt-3 flex flex-col gap-2">
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

        <div
          data-testid="footer-channels"
          className="mt-14 grid grid-cols-1 divide-y divide-gridline border-y border-gridline sm:grid-cols-2 md:mt-20 md:grid-cols-4 md:divide-x md:divide-y-0"
        >
          {CHANNELS.map((c) => (
            <a
              key={c.label}
              href={c.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-baseline justify-between gap-4 px-5 py-5 transition-colors hover:bg-ebony/[0.03] sm:px-6 sm:py-6"
            >
              <span className="flex flex-col gap-2">
                <span className="font-mono text-[9px] tracking-[0.2em] text-muted-ink uppercase">
                  {c.label}
                </span>
                <span className="font-mono text-[11px] tracking-[0.06em] text-ebony">{c.value}</span>
              </span>
              {c.external ? (
                <span
                  aria-hidden="true"
                  className="font-mono text-[11px] text-muted-ink transition-colors group-hover:text-terracotta"
                >
                  ↗
                </span>
              ) : null}
            </a>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-5 pt-2 md:mt-10">
          <p
            data-testid="footer-stewardship"
            className="max-w-2xl font-mono text-[10px] leading-[1.9] tracking-[0.06em] text-muted-ink"
          >
            {notes.stewardship}
          </p>
          <Marginalia rotate={-1} className="ml-1 sm:ml-6">
            {notes.hosting}
          </Marginalia>
        </div>

        <div className="mt-5 flex flex-col gap-1 border-t border-gridline pt-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6 sm:gap-y-1">
          <span className="font-mono text-[9px] leading-[1.6] tracking-[0.18em] text-muted-ink uppercase">
            // © 2026 delplanche.cloud
          </span>
          <span className="font-mono text-[9px] leading-[1.6] tracking-[0.18em] text-muted-ink uppercase">
            {t.footer.hosting}
          </span>
          <span className="font-mono text-[9px] leading-[1.6] tracking-[0.18em] text-muted-ink uppercase">
            {t.footer.impressum}{" "}
            <LocaleLink
              page="legal"
              className="text-muted-ink underline underline-offset-2 transition-colors hover:text-ebony"
            >
              {t.footer.impressumLink}
            </LocaleLink>
          </span>
        </div>

      </div>
    </footer>
  );
}
