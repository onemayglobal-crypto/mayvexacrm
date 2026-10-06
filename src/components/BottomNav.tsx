import { BarChart3, House, Kanban, Plus } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type Tab = 'today' | 'pipeline' | 'capture' | 'insights'

const tabs: { id: Tab; label: string; icon?: LucideIcon }[] = [
  { id: 'today', label: 'Today', icon: House },
  { id: 'pipeline', label: 'Pipeline', icon: Kanban },
  { id: 'capture', label: 'Capture' },
  { id: 'insights', label: 'Insights', icon: BarChart3 },
]

interface BottomNavProps {
  active: Tab
  onChange: (tab: Tab) => void
}

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-[420px] bg-[#141415]/95 px-3 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur">
      <ul className="grid grid-cols-4 gap-1.5">
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = active === id
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => onChange(id)}
                className={`relative flex h-[58px] w-full flex-col items-center justify-end gap-1 rounded-xl border pb-2 text-[13px] transition-colors ${
                  isActive
                    ? 'border-neutral-600 bg-[#1f1f21] text-neutral-50'
                    : 'border-[#2a2a2c] bg-[#19191a] text-neutral-300'
                }`}
              >
                {Icon ? (
                  <Icon size={19} strokeWidth={1.75} />
                ) : (
                  <span className="absolute -top-5 left-1/2 flex size-11 -translate-x-1/2 items-center justify-center rounded-full bg-[#2f7ef0] text-white shadow-lg shadow-blue-900/40">
                    <Plus size={22} strokeWidth={2.25} />
                  </span>
                )}
                {label}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
