import { typeMeta } from '../lib/ui'
import type { LeadType } from '../types'

export function TypeTag({ type }: { type: LeadType }) {
  const { label, icon: Icon, color } = typeMeta[type]
  return (
    <span
      className="inline-flex h-6 items-center gap-1 rounded-lg px-2 text-[11px] font-medium"
      style={{ background: `${color}14`, color, boxShadow: `inset 0 0 0 1px ${color}33` }}
    >
      <Icon size={11} />
      {label}
    </span>
  )
}
