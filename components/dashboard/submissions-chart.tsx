"use client";

import { useState } from "react";

interface DayCount {
  date: string;
  count: number;
}

interface SubmissionsChartProps {
  data: DayCount[];
}

const CHART_HEIGHT = 160;
const BAR_MAX_WIDTH = 20;

function formatDayLabel(dateStr: string) {
  const date = new Date(`${dateStr}T00:00:00`);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function SubmissionsChart({ data }: SubmissionsChartProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((d) => d.count));
  const slotWidth = 100 / data.length;
  const barWidthPercent = Math.min(BAR_MAX_WIDTH, slotWidth * 0.6);

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 100 ${CHART_HEIGHT}`}
        preserveAspectRatio="none"
        className="h-40 w-full overflow-visible"
        role="img"
        aria-label="Contact form submissions per day, last 14 days"
      >
        <defs>
          <linearGradient id="submissions-bar-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.95" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.55" />
          </linearGradient>
          <linearGradient id="submissions-bar-fill-hover" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="1" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.75" />
          </linearGradient>
        </defs>

        {/* Baseline */}
        <line
          x1="0"
          y1={CHART_HEIGHT - 1}
          x2="100"
          y2={CHART_HEIGHT - 1}
          stroke="var(--border)"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />

        {data.map((d, i) => {
          const barHeight = (d.count / max) * (CHART_HEIGHT - 24);
          const x = i * slotWidth + (slotWidth - barWidthPercent) / 2;
          const y = CHART_HEIGHT - 1 - barHeight;
          const isHovered = hovered === i;

          return (
            <g key={d.date}>
              {/* Wider invisible hit target, taller than the bar itself */}
              <rect
                x={i * slotWidth}
                y={0}
                width={slotWidth}
                height={CHART_HEIGHT}
                fill="transparent"
                pointerEvents="all"
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              />
              <rect
                x={x}
                y={y}
                width={barWidthPercent}
                height={Math.max(barHeight, d.count > 0 ? 2 : 0)}
                rx="2"
                fill={isHovered ? "url(#submissions-bar-fill-hover)" : "url(#submissions-bar-fill)"}
                className="pointer-events-none transition-[fill] duration-150"
              />
            </g>
          );
        })}
      </svg>

      <div className="mt-2 flex justify-between text-xs text-muted-foreground">
        <span>{formatDayLabel(data[0].date)}</span>
        <span>{formatDayLabel(data[data.length - 1].date)}</span>
      </div>

      <div className="mt-2 h-6 text-sm text-foreground">
        {hovered !== null && (
          <span>
            <span className="font-medium">{data[hovered].count}</span>{" "}
            <span className="text-muted-foreground">
              submission{data[hovered].count === 1 ? "" : "s"} on {formatDayLabel(data[hovered].date)}
            </span>
          </span>
        )}
      </div>
    </div>
  );
}
