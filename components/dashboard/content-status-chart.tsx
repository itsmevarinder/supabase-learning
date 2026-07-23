"use client";

import { useState } from "react";

interface SectionStatus {
  label: string;
  active: number;
  total: number;
}

interface ContentStatusChartProps {
  data: SectionStatus[];
}

export function ContentStatusChart({ data }: ContentStatusChartProps) {
  const [hovered, setHovered] = useState<{ row: number; segment: "active" | "hidden" } | null>(null);

  const maxTotal = Math.max(1, ...data.map((d) => d.total));

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-3.5 rounded-full" style={{ backgroundColor: "var(--chart-3)" }} />
          Active
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-3.5 rounded-full bg-muted" />
          Hidden
        </span>
      </div>

      <div className="space-y-3.5">
        {data.map((row, i) => {
          const hiddenCount = row.total - row.active;
          const barWidthPercent = (row.total / maxTotal) * 100;
          const activeSharePercent = row.total > 0 ? (row.active / row.total) * 100 : 0;
          const hiddenSharePercent = 100 - activeSharePercent;
          const hasHidden = hiddenCount > 0;

          return (
            <div key={row.label}>
              <div className="mb-1 flex items-baseline justify-between text-sm">
                <span className="text-muted-foreground">{row.label}</span>
                <span className="text-xs text-muted-foreground">
                  {row.active}/{row.total} active
                </span>
              </div>

              <div className="h-4.5 rounded-full bg-transparent" style={{ width: `${barWidthPercent}%` }}>
                <div className="flex h-full gap-0.5">
                  {row.active > 0 && (
                    <div
                      className="h-full transition-opacity duration-150"
                      style={{
                        width: `${activeSharePercent}%`,
                        backgroundColor: "var(--chart-3)",
                        borderRadius: hasHidden ? "9999px 0 0 9999px" : "9999px",
                        opacity: hovered?.row === i && hovered.segment === "active" ? 1 : 0.9,
                      }}
                      onMouseEnter={() => setHovered({ row: i, segment: "active" })}
                      onMouseLeave={() => setHovered(null)}
                    />
                  )}
                  {hasHidden && (
                    <div
                      className="h-full bg-muted transition-opacity duration-150"
                      style={{
                        width: `${hiddenSharePercent}%`,
                        borderRadius: row.active > 0 ? "0 9999px 9999px 0" : "9999px",
                        opacity: hovered?.row === i && hovered.segment === "hidden" ? 1 : 0.85,
                      }}
                      onMouseEnter={() => setHovered({ row: i, segment: "hidden" })}
                      onMouseLeave={() => setHovered(null)}
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 h-5 text-sm text-foreground">
        {hovered && (
          <span>
            <span className="font-medium">
              {hovered.segment === "active"
                ? data[hovered.row].active
                : data[hovered.row].total - data[hovered.row].active}
            </span>{" "}
            <span className="text-muted-foreground">
              {hovered.segment === "active" ? "active" : "hidden"} — {data[hovered.row].label}
            </span>
          </span>
        )}
      </div>
    </div>
  );
}
