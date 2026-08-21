import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 border border-gridline bg-card px-3 py-1.5 font-mono text-[10px] tracking-[0.18em] text-moss uppercase",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function SectionHeader({
  index,
  title,
  lead,
}: {
  index: string;
  title: string;
  lead?: string;
}) {
  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3">
        <span className="font-mono text-[10px] tracking-[0.22em] text-muted-ink uppercase">
          {index}
        </span>
        <span className="h-px flex-1 bg-gridline" />
      </div>
      <h2 className="mt-6 text-3xl leading-[1.15] text-ebony md:text-5xl">{title}</h2>
      {lead && (
        <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted-ink md:text-base">{lead}</p>
      )}
    </div>
  );
}

const baseBtn =
  "group stamp-press inline-flex items-center justify-center gap-2.5 rounded-full border-2 border-moss bg-card px-6 py-3 font-mono text-[10px] tracking-[0.18em] text-moss uppercase transition-colors hover:bg-moss/[0.07] disabled:opacity-50";

export function ArrowGlyph({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-block transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5",
        className,
      )}
    >
      ↗
    </span>
  );
}

export function ActionButton({
  children,
  className,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "solid" | "outline" }) {
  const { variant: _variant, ...buttonProps } = rest;
  return (
    <button className={cn(baseBtn, className)} {...buttonProps}>
      {children}
    </button>
  );
}

export function ActionLink({
  to,
  children,
  className,
}: {
  to: string;
  children: React.ReactNode;
  variant?: "solid" | "outline";
  className?: string;
}) {
  return (
    <Link to={to} className={cn(baseBtn, className)}>
      {children}
    </Link>
  );
}

export function ActionAnchor({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a href={href} className={cn(baseBtn, className)}>
      {children}
    </a>
  );
}

export function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("sketch-frame p-7 md:p-10", className)}>{children}</div>;
}

export function PageShell({
  index,
  title,
  lead,
  children,
}: {
  index: string;
  title: string;
  lead: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-6xl px-5 pt-32 pb-20 md:px-8 md:pt-44 md:pb-32">
      <SectionHeader index={index} title={title} lead={lead} />
      <div className="mt-16 space-y-20 md:mt-24 md:space-y-28">{children}</div>
    </div>
  );
}
