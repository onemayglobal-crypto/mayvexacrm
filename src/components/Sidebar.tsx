import { Bell, Plus } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { BarChart3, House, Kanban } from 'lucide-react'
import type { Tab } from '../types'

const tabs: { id: Tab; label: string; icon: LucideIcon }[] = [
  { id: 'today', label: 'Today', icon: House },
  { id: 'pipeline', label: 'Pipeline', icon: Kanban },
  { id: 'capture', label: 'Capture', icon: Plus },
  { id: 'insights', label: 'Insights', icon: BarChart3 },
]

interface SidebarProps {
  active: Tab
  onChange: (tab: Tab) => void
  unread: number
  onBell: () => void
}

export function Sidebar({ active, onChange, unread, onBell }: SidebarProps) {
  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-[#262628] bg-[#121213]">
      <div className="flex items-center justify-between px-5 pt-6 pb-4">
        <div>
          <p className="text-xs tracking-[0.16em] text-neutral-500 uppercase">MayVexa CRM</p>
          <p className="mt-1 text-lg font-medium text-neutral-50">Command center</p>
        </div>
        <button
          type="button"
          onClick={onBell}
          aria-label={`${unread} notifications`}
          className="relative flex size-9 items-center justify-center rounded-full bg-[#1f1f22] text-neutral-300"
        >
          <Bell size={18} />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex size-[16px] items-center justify-center rounded-full bg-[#e5484d] text-[10px] font-semibold text-white">
              {unread}
            </span>
          )}
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = active === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[15px] ${
                isActive
                  ? 'bg-[#1f1f22] text-neutral-50'
                  : 'text-neutral-400 hover:bg-[#1a1a1c] hover:text-neutral-200'
              }`}
            >
              <span
                className={`flex size-9 items-center justify-center rounded-lg ${
                  id === 'capture' ? 'bg-[#2f7ef0] text-white' : 'bg-[#1a1a1c]'
                }`}
              >
                <Icon size={18} strokeWidth={1.8} />
              </span>
              {label}
            </button>
          )
        })}
      </nav>

      <p className="px-5 pb-5 text-xs text-neutral-600">Frontend only · saved in this browser</p>
    </aside>
  )
}
