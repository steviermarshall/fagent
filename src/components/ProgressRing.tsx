interface ProgressRingProps {
  value: number;
  max: number;
  color?: string;
  size?: number;
  thickness?: number;
}

const ProgressRing = ({ value, max, color = "#34d399", size = 64, thickness = 5 }: ProgressRingProps) => {
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(value / (max || 1), 1);
  const offset = circumference * (1 - pct);

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth={thickness}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={thickness}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{
          transition: "stroke-dashoffset 0.8s ease-out",
          filter: `drop-shadow(0 0 4px ${color}50)`,
        }}
      />
    </svg>
  );
};

export default ProgressRing;
