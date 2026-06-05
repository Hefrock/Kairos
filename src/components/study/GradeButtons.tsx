import { useEffect } from 'react'
import type { Card, Grade } from '@/types'
import { applyGrade, nextReviewLabel } from '@/lib/srs/sm2'

interface GradeButtonsProps {
  card: Card
  visible: boolean
  onGrade: (g: Grade) => void
}

const GRADES: { grade: Grade; label: string; cls: string }[] = [
  {
    grade: 0, label: 'Again',
    cls: 'border-red-300 text-red-600 bg-red-50 hover:bg-red-100 dark:border-red-700 dark:text-red-400 dark:bg-red-900/20 dark:hover:bg-red-900/40',
  },
  {
    grade: 1, label: 'Hard',
    cls: 'border-orange-300 text-orange-600 bg-orange-50 hover:bg-orange-100 dark:border-orange-700 dark:text-orange-400 dark:bg-orange-900/20 dark:hover:bg-orange-900/40',
  },
  {
    grade: 2, label: 'Good',
    cls: 'border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:border-emerald-700 dark:text-emerald-400 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/40',
  },
  {
    grade: 3, label: 'Easy',
    cls: 'border-gold/40 text-gold bg-gold/5 hover:bg-gold/15 dark:bg-gold/10 dark:hover:bg-gold/20',
  },
]

export default function GradeButtons({ card, visible, onGrade }: GradeButtonsProps) {
  useEffect(() => {
    if (!visible) return
    function onKey(e: KeyboardEvent) {
      const i = parseInt(e.key) - 1
      if (i >= 0 && i <= 3) onGrade(i as Grade)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [visible, onGrade])

  if (!visible) return null

  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-3 mt-4">
      {GRADES.map(({ grade, label, cls }) => {
        const next = applyGrade(card, grade)
        const hint = nextReviewLabel(next)
        return (
          <button
            key={grade}
            onClick={() => onGrade(grade)}
            className={`flex flex-col items-center gap-0.5 py-3 rounded-xl border transition-all active:scale-95 ${cls}`}
          >
            <span className="text-sm font-medium">{label}</span>
            <span className="text-[10px] opacity-55 font-body tabular-nums">{hint}</span>
          </button>
        )
      })}
    </div>
  )
}
