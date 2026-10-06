import type { Grade } from '../types'

const styles: Record<Grade, string> = {
  'A+': 'border-[#2f9e57] bg-[#2f9e57]/10 text-[#4fd17e]',
  A: 'border-[#3d8bfd] bg-[#3d8bfd]/10 text-[#7eb0ff]',
  B: 'border-[#e8a93a] bg-[#e8a93a]/10 text-[#f0c36a]',
  C: 'border-[#6b6b70] bg-[#2a2a2c] text-neutral-300',
}

export function GradeBadge({ grade }: { grade: Grade }) {
  return (
    <span className={`rounded-md border px-2 py-0.5 text-[12px] font-medium ${styles[grade]}`}>
      {grade}
    </span>
  )
}
