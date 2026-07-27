"use client";

interface SectionStatus {
  label: string;
  active: number;
  total: number;
}

interface ContentStatusChartProps {
  data: SectionStatus[];
}

const RING_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

const RADIUS = 42;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function ContentStatusChart({ data }: ContentStatusChartProps) {
  return (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
      {data.map((row, i) => {
        const color = RING_COLORS[i % RING_COLORS.length];
        const activeShare = row.total > 0 ? row.active / row.total : 0;
        const offset = CIRCUMFERENCE * (1 - activeShare);
        const percent = Math.round(activeShare * 100);

        return (
          <div key={row.label} className="flex flex-col items-center gap-2 text-center">
            <div className="relative flex size-24 items-center justify-center">
              <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full -rotate-90">
                <circle cx="50" cy="50" r={RADIUS} fill="none" stroke="var(--muted)" strokeWidth="9" />
                <circle
                  cx="50"
                  cy="50"
                  r={RADIUS}
                  fill="none"
                  stroke={color}
                  strokeWidth="9"
                  strokeLinecap="round"
                  strokeDasharray={CIRCUMFERENCE}
                  strokeDashoffset={offset}
                  className="transition-[stroke-dashoffset] duration-700 ease-out"
                />
              </svg>
              <span className="text-xl font-bold tabular-nums">{percent}%</span>
            </div>

            <div>
              <p className="text-sm font-medium">{row.label}</p>
              <p className="text-xs text-muted-foreground">
                {row.active}/{row.total} active
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
