"use client";

import { useState } from "react";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";

interface DayAmount {
  date: string;
  amount: number;
}

interface DonationsChartProps {
  data: DayAmount[];
  totalAmount: number;
  donationCount: number;
  trendPercent: number | null; 
}

const CHART_HEIGHT = 160;
const BAR_MAX_WIDTH = 20;

function formatDayLabel(dateStr: string) {
  const date = new Date(`${dateStr}T00:00:00`);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatAmount(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

function smoothPath(points: { x: number; y: number }[]) {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const curr = points[i];
    const next = points[i + 1];
    const midX = (curr.x + next.x) / 2;
    const midY = (curr.y + next.y) / 2;
    d += ` Q ${curr.x} ${curr.y} ${midX} ${midY}`;
  }
  const last = points[points.length - 1];
  d += ` L ${last.x} ${last.y}`;
  return d;
}

export function DonationsChart({ data, totalAmount, donationCount, trendPercent }: DonationsChartProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  const max = Math.max(1, ...data.map((d) => d.amount));
  const baseline = CHART_HEIGHT - 1;
  const slotWidth = 100 / data.length;
  const barWidthPercent = Math.min(BAR_MAX_WIDTH, slotWidth * 0.55);

  const points = data.map((d, i) => ({
    x: i * slotWidth + slotWidth / 2,
    y: baseline - (d.amount / max) * (CHART_HEIGHT - 28),
  }));
  const linePath = smoothPath(points);

  const gridLines = [0.25, 0.5, 0.75].map((f) => (CHART_HEIGHT - 28) * f + 4);

  const trendUp = trendPercent !== null && trendPercent > 0.5;
  const trendDown = trendPercent !== null && trendPercent < -0.5;
  const TrendIcon = trendUp ? TrendingUp : trendDown ? TrendingDown : Minus;
  const trendColor = trendUp ? "text-green-600" : trendDown ? "text-destructive" : "text-muted-foreground";

  return (
    <div className="w-full">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Total collected · last 14 days</p>
          <div className="mt-1 flex items-baseline gap-3">
            <span className="text-3xl font-bold tracking-tight">{formatAmount(totalAmount)}</span>
            {trendPercent !== null && (
              <span className={`flex items-center gap-1 text-sm font-medium ${trendColor}`}>
                <TrendIcon className="size-4" />
                {Math.abs(trendPercent).toFixed(0)}% vs previous 14 days
              </span>
            )}
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          {donationCount} donation{donationCount === 1 ? "" : "s"}
        </p>
      </div>

      <svg
        viewBox={`0 0 100 ${CHART_HEIGHT}`}
        preserveAspectRatio="none"
        className="h-44 w-full overflow-visible"
        role="img"
        aria-label="Donations collected per day, last 14 days"
      >
        <defs>
          <linearGradient id="donations-bar-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-2)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="var(--chart-2)" stopOpacity="0.18" />
          </linearGradient>
          <linearGradient id="donations-bar-fill-hover" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-2)" stopOpacity="0.75" />
            <stop offset="100%" stopColor="var(--chart-2)" stopOpacity="0.3" />
          </linearGradient>
        </defs>

        {gridLines.map((y) => (
          <line
            key={y}
            x1="0"
            y1={y}
            x2="100"
            y2={y}
            stroke="var(--border)"
            strokeWidth="1"
            strokeDasharray="2 3"
            vectorEffect="non-scaling-stroke"
          />
        ))}

        {/* Baseline */}
        <line
          x1="0"
          y1={baseline}
          x2="100"
          y2={baseline}
          stroke="var(--border)"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />

        {/* Bars */}
        {data.map((d, i) => {
          const barHeight = (d.amount / max) * (CHART_HEIGHT - 28);
          const x = i * slotWidth + (slotWidth - barWidthPercent) / 2;
          const y = baseline - barHeight;
          const isHovered = hovered === i;

          return (
            <g key={d.date}>
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
                height={Math.max(barHeight, d.amount > 0 ? 2 : 0)}
                rx="2"
                fill={isHovered ? "url(#donations-bar-fill-hover)" : "url(#donations-bar-fill)"}
                className="pointer-events-none transition-[fill] duration-150"
              />
            </g>
          );
        })}

        {/* Trend line on top of the bars */}
        <path
          d={linePath}
          fill="none"
          stroke="var(--chart-2)"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          className="pointer-events-none"
        />
        {points.map((p, i) => (
          <circle
            key={data[i].date}
            cx={p.x}
            cy={p.y}
            r={hovered === i ? 3 : 1.75}
            fill="var(--chart-2)"
            stroke="var(--card)"
            strokeWidth="1.25"
            className="pointer-events-none transition-all duration-150"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>

      <div className="mt-2 flex justify-between text-xs text-muted-foreground">
        <span>{formatDayLabel(data[0].date)}</span>
        <span>{formatDayLabel(data[Math.floor(data.length / 2)].date)}</span>
        <span>{formatDayLabel(data[data.length - 1].date)}</span>
      </div>

      <div className="mt-2 h-6 text-sm text-foreground">
        {hovered !== null && (
          <span>
            <span className="font-medium">{formatAmount(data[hovered].amount)}</span>{" "}
            <span className="text-muted-foreground">collected on {formatDayLabel(data[hovered].date)}</span>
          </span>
        )}
      </div>
    </div>
  );
}
