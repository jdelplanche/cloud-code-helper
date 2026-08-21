import { BrandMark } from "@/components/site/TopNav";
import { CopyAction } from "@/components/site/CopyAction";
import { LocaleLink, useDict, useLocale } from "@/i18n";
import { getExtraDict } from "@/i18n/extra";
import type { PageKey } from "@/i18n/config";
import { Arrow, actionClass } from "@/components/site/Layout";

type Item = { label: string; page?: PageKey; href?: string };

/** Technische kanalen — strikt monospace metadata, geen social icons. */
const CHANNELS: { label: string; value: string; href: string }[] = [
  { label: "GITHUB", value: "jdelplanche", href: "https://github.com/jdelplanche" },
  {
    label: "MATRIX",
    value: "@jona:delplanche.cloud",
    href: "https://matrix.to/#/@jona:delplanche.cloud",
  },
  { label: "PGP KEY", value: "9F3C 21A7 D4B8 6E05", href: "/pgp.asc" },
];

export function Footer() {
  const t = useDict();
  const locale = useLocale();

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
      <div className="mx-auto w-full max-w-6xl px-6 py-10 md:px-10 md:py-20">
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
              <details key={col.title} className="group py-4">
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
          className="mt-10 grid grid-cols-1 divide-y divide-gridline border border-gridline sm:grid-cols-3 sm:divide-x sm:divide-y-0 md:mt-14"
        >
          {CHANNELS.map((c) => (
            <a
              key={c.label}
              href={c.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col gap-1.5 px-4 py-3.5 transition-colors hover:bg-ebony/[0.03]"
            >
              <span className="font-mono text-[9px] tracking-[0.2em] text-muted-ink uppercase">
                // {c.label}
              </span>
              <span className="font-mono text-[11px] tracking-[0.08em] text-ebony">
                [ {c.value} ]
              </span>
            </a>
          ))}
        </div>

        <div className="vault-frame mt-4 flex flex-col gap-1 rounded-2xl px-4 py-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6 sm:gap-y-1">
          <span className="font-mono text-[9px] leading-[1.6] tracking-[0.18em] text-muted-ink uppercase">
            // © 2026 delplanche.cloud
          </span>
          <span className="font-mono text-[9px] leading-[1.6] tracking-[0.18em] text-muted-ink uppercase">
            {t.footer.hosting}
          </span>
          <span className="font-mono text-[9px] leading-[1.6] tracking-[0.18em] text-muted-ink uppercase">
            {t.footer.impressum}{" "}
            <LocaleLink page="legal" className="text-ebony underline-offset-2 hover:underline">
              {t.footer.impressumLink}
            </LocaleLink>
          </span>
        </div>
      </div>
    </footer>
  );
}
