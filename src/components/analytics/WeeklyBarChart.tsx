// src/components/analytics/WeeklyBarChart.tsx
import type { WeeklyCount } from '@/types';

interface WeeklyBarChartProps {
  title: string;
  data: WeeklyCount[];
}

export function WeeklyBarChart({ title, data }: WeeklyBarChartProps) {
  const max = Math.max(1, ...data.map((d) => d.count));
  const width = 480;
  const height = 160;
  const barGap = 8;
  const barWidth = (width - barGap * (data.length - 1)) / data.length;

  return (
    <div>
      <p className="mb-2 text-xs font-medium text-capaciti-grey">{title}</p>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label={title}>
        {data.map((d, i) => {
          const barHeight = (d.count / max) * (height - 24);
          const x = i * (barWidth + barGap);
          const y = height - barHeight - 20;
          return (
            <g key={d.label}>
              <rect x={x} y={y} width={barWidth} height={barHeight} rx={3} className="fill-capaciti-blue" />
              <text x={x + barWidth / 2} y={height - 6} textAnchor="middle" className="fill-capaciti-grey text-[9px]">
                {d.label}
              </text>
              {d.count > 0 && (
                <text x={x + barWidth / 2} y={y - 4} textAnchor="middle" className="fill-capaciti-navy text-[10px] font-medium">
                  {d.count}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}