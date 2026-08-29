import { cn, scoreToColor, scoreToLabel } from "@/lib/utils";

interface ScoreRingProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { outer: "w-16 h-16", text: "text-lg", label: "text-[10px]", r: 26, cx: 32, cy: 32, strokeW: 4 },
  md: { outer: "w-24 h-24", text: "text-2xl", label: "text-xs", r: 38, cx: 48, cy: 48, strokeW: 5 },
  lg: { outer: "w-32 h-32", text: "text-3xl", label: "text-sm", r: 52, cx: 64, cy: 64, strokeW: 6 },
};

export function ScoreRing({ score, size = "md", showLabel = true, className }: ScoreRingProps) {
  const s = sizeMap[size];
  const circumference = 2 * Math.PI * s.r;
  const offset = circumference - (score / 100) * circumference;

  const getStrokeColor = () => {
    if (score >= 80) return "#34d399"; // emerald
    if (score >= 60) return "#fbbf24"; // yellow
    if (score >= 40) return "#fb923c"; // orange
    return "#f87171"; // red
  };

  return (
    <div className={cn("relative inline-flex items-center justify-center", s.outer, className)}>
      <svg
        className="w-full h-full -rotate-90"
        viewBox={`0 0 ${s.cx * 2} ${s.cy * 2}`}
      >
        <circle
          cx={s.cx}
          cy={s.cy}
          r={s.r}
          fill="none"
          stroke="hsl(240, 5%, 12%)"
          strokeWidth={s.strokeW}
        />
        <circle
          cx={s.cx}
          cy={s.cy}
          r={s.r}
          fill="none"
          stroke={getStrokeColor()}
          strokeWidth={s.strokeW}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("font-bold leading-none", s.text, scoreToColor(score))}>
          {Math.round(score)}
        </span>
        {showLabel && (
          <span className={cn("text-muted-foreground mt-0.5 leading-none", s.label)}>
            {scoreToLabel(score)}
          </span>
        )}
      </div>
    </div>
  );
}
