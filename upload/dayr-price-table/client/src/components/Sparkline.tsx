import { TrendingUp, TrendingDown } from "lucide-react";

interface SparklineProps {
  data: number[];
  trend: "up" | "down" | "stable";
  change: number;
}

export function Sparkline({ data, trend, change }: SparklineProps) {
  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 60;
  const height = 24;
  const padding = 2;

  // Normalizar dados para SVG
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * (width - padding * 2) + padding;
    const y = height - ((value - min) / range) * (height - padding * 2) - padding;
    return `${x},${y}`;
  });

  const trendColor =
    trend === "up" ? "#f97316" : trend === "down" ? "#ef4444" : "#64748b";
  const trendIcon =
    trend === "up" ? (
      <TrendingUp className="w-3 h-3 text-orange-500" />
    ) : trend === "down" ? (
      <TrendingDown className="w-3 h-3 text-red-500" />
    ) : null;

  return (
    <div className="flex items-center gap-2">
      <svg width={width} height={height} className="flex-shrink-0">
        <polyline
          points={points.join(" ")}
          fill="none"
          stroke={trendColor}
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div className="flex items-center gap-1 text-xs">
        {trendIcon}
        <span
          className={
            trend === "up"
              ? "text-orange-500 font-bold"
              : trend === "down"
                ? "text-red-500 font-bold"
                : "text-slate-400"
          }
        >
          {change > 0 ? "+" : ""}{change}%
        </span>
      </div>
    </div>
  );
}
