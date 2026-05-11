export default function ProgressRing({ progress = 0, color = '#639922', size = 36 }) {
  const cx = size / 2
  const cy = size / 2
  const r = size / 2 - 4
  const circumference = 2 * Math.PI * r
  const filled = Math.max(0, Math.min(1, progress)) * circumference
  const gap = circumference - filled

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke="#E5DDD2"
        strokeWidth="2.5"
      />
      {filled > 0 && (
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeDasharray={`${filled} ${gap}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
        />
      )}
    </svg>
  )
}
