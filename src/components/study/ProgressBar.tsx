interface ProgressBarProps {
  current: number
  total: number
}

export default function ProgressBar({ current, total }: ProgressBarProps) {
  const pct = total > 0 ? (current / total) * 100 : 0
  return (
    <div className="flex items-center gap-3 mb-3">
      <div className="flex-1 h-1 bg-ink/8 rounded-full overflow-hidden">
        <div
          className="h-full bg-gold rounded-full transition-all duration-300 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-ink/30 font-body tabular-nums shrink-0 w-12 text-right">
        {current} / {total}
      </span>
    </div>
  )
}
