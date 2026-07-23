import type { ReactNode } from "react";

interface PageHeaderProps {
  children: ReactNode;
}

export function PageHeader({ children }: PageHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border bg-card p-6">
      <span className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
      <span className="pointer-events-none absolute -bottom-20 left-1/3 h-56 w-56 rounded-full bg-[color-mix(in_oklch,var(--chart-2),transparent_80%)] blur-3xl" />
      <div className="relative">{children}</div>
    </div>
  );
}
