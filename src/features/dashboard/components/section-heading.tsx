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
      <div>
        <h2 className="font-heading text-base font-medium tracking-tight">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actionHref && actionLabel ? (
        <Link
          className="shrink-0 rounded-sm text-xs font-medium text-muted-foreground outline-none transition-colors duration-fast hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          href={actionHref}
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
