import Link from "next/link";

interface SectionHeadingProps {
  actionHref?: string;
  actionLabel?: string;
  description?: string;
  title: string;
}

export function SectionHeading({
  actionHref,
  actionLabel,
  description,
  title,
}: SectionHeadingProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <h2 className="font-heading text-base font-semibold tracking-tight text-foreground">
          {title}
        </h2>
        {description ? (
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {actionHref && actionLabel ? (
        <Link
          className="shrink-0 rounded-sm text-xs font-medium text-muted-foreground outline-none transition-all duration-fast ease-standard hover:text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
          href={actionHref}
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
