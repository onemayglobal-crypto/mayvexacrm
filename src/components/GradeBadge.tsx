import type { Grade } from '../types'

const styles: Record<Grade, string> = {
  'A+': 'bg-[#34d399]/12 text-[#6ee7b7] ring-[#34d399]/25',
  A: 'bg-[#38bdf8]/12 text-[#7dd3fc] ring-[#38bdf8]/25',
  B: 'bg-[#fbbf24]/12 text-[#fcd34d] ring-[#fbbf24]/25',
  C: 'bg-white/[0.06] text-neutral-300 ring-white/10',
}

export function GradeBadge({ grade }: { grade: Grade }) {
  return (
    <span className={`inline-flex h-6 min-w-6 items-center justify-center rounded-lg px-1.5 text-[11px] font-semibold ring-1 ring-inset ${styles[grade]}`}>
      {grade}
    </span>
  )
}
