"use client";

import { useState } from "react";

interface DayCount {
  date: string; // "YYYY-MM-DD"
  total: number; // cumulative total users as of this day
}

interface UserGrowthChartProps {
  data: DayCount[];
}

const CHART_HEIGHT = 160;
const CHART_WIDTH = 100;

function formatDayLabel(dateStr: string) {
  const date = new Date(`${dateStr}T00:00:00`);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function UserGrowthChart({ data }: UserGrowthChartProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  const max = Math.max(1, ...data.map((d) => d.total));
  const min = Math.min(...data.map((d) => d.total));
  const range = Math.max(1, max - min);
  const stepX = CHART_WIDTH / Math.max(1, data.length - 1);

  const points = data.map((d, i) => {
    const x = i * stepX;
    const y = CHART_HEIGHT - 8 - ((d.total - min) / range) * (CHART_HEIGHT - 24);
    return { x, y, ...d };
  });

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${CHART_HEIGHT} L ${points[0].x} ${CHART_HEIGHT} Z`;

  const last = points[points.length - 1];

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
        preserveAspectRatio="none"
        className="h-40 w-full overflow-visible"
        role="img"
        aria-label="Total users over the last 30 days"
      >
        <defs>
          <linearGradient id="user-growth-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-3)" stopOpacity="0.22" />
            <stop offset="100%" stopColor="var(--chart-3)" stopOpacity="0" />
          </linearGradient>
        </defs>

        <line
          x1="0"
          y1={CHART_HEIGHT - 1}
          x2={CHART_WIDTH}
          y2={CHART_HEIGHT - 1}
          stroke="var(--border)"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />

        <path d={areaPath} fill="url(#user-growth-area)" className="pointer-events-none" />
        <path
          d={linePath}
          fill="none"
          stroke="var(--chart-3)"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          className="pointer-events-none"
        />

        {/* End marker, ring in the surface color so it stays legible on the line */}
        <circle cx={last.x} cy={last.y} r="4.5" fill="var(--chart-3)" stroke="var(--card)" strokeWidth="2" />

        {points.map((p, i) => (
          <rect
            key={p.date}
            x={i === 0 ? 0 : p.x - stepX / 2}
            y={0}
            width={stepX}
            height={CHART_HEIGHT}
            fill="transparent"
            pointerEvents="all"
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          />
        ))}

        {hovered !== null && (
          <>
            <line
              x1={points[hovered].x}
              y1={0}
              x2={points[hovered].x}
              y2={CHART_HEIGHT}
              stroke="var(--border)"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
              className="pointer-events-none"
            />
            <circle
              cx={points[hovered].x}
              cy={points[hovered].y}
              r="4.5"
              fill="var(--chart-3)"
              stroke="var(--card)"
              strokeWidth="2"
              className="pointer-events-none"
            />
          </>
        )}
      </svg>

      <div className="mt-2 flex justify-between text-xs text-muted-foreground">
        <span>{formatDayLabel(data[0].date)}</span>
        <span>{formatDayLabel(data[data.length - 1].date)}</span>
      </div>

      <div className="mt-2 h-6 text-sm text-foreground">
        {hovered !== null ? (
          <span>
            <span className="font-medium">{points[hovered].total}</span>{" "}
            <span className="text-muted-foreground">total users as of {formatDayLabel(points[hovered].date)}</span>
          </span>
        ) : (
          <span>
            <span className="font-medium">{last.total}</span>{" "}
            <span className="text-muted-foreground">total users today</span>
          </span>
        )}
      </div>
    </div>
  );
}
