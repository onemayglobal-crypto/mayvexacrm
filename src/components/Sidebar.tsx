import { BarChart3, Bell, House, Kanban, LogOut, Plus } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { Tab } from '../types'

const tabs: { id: Tab; label: string; icon: LucideIcon }[] = [
  { id: 'today', label: 'Today', icon: House },
  { id: 'pipeline', label: 'Pipeline', icon: Kanban },
  { id: 'insights', label: 'Insights', icon: BarChart3 },
]

interface SidebarProps {
  active: Tab
  onChange: (tab: Tab) => void
  unread: number
  onBell: () => void
  onLogout: () => void
}

export function Sidebar({ active, onChange, unread, onBell, onLogout }: SidebarProps) {
  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-white/[0.05] bg-[#090b12]">
      <div className="flex items-center justify-between px-6 pt-7 pb-8">
        <p className="text-[22px] font-bold tracking-[-0.04em]">
          <span className="text-white">May</span>
          <span className="text-[#8f7cff]">Vexa</span>
        </p>
        <button
          type="button"
          onClick={onBell}
          aria-label={`${unread} notifications`}
          className="relative flex size-9 items-center justify-center rounded-xl text-neutral-400 transition-colors hover:bg-white/[0.06] hover:text-white"
        >
          <Bell size={18} />
          {unread > 0 && (
            <span className="absolute top-1 right-1 size-2 rounded-full bg-[#f87171] ring-2 ring-[#090b12]" />
          )}
        </button>
      </div>

      <div className="px-4">
        <button
          type="button"
          onClick={() => onChange('capture')}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#7c5cff] text-[14px] font-medium text-white shadow-[0_8px_24px_rgba(124,92,255,0.35)] transition-all hover:bg-[#8b6dff] hover:shadow-[0_10px_30px_rgba(124,92,255,0.5)] active:scale-[0.98]"
        >
          <Plus size={17} /> New
        </button>
      </div>

      <nav className="mt-6 flex flex-1 flex-col gap-1 px-4">
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = active === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              className={`relative flex h-11 items-center gap-3 rounded-xl px-3 text-left text-[14px] font-medium transition-colors ${
                isActive
                  ? 'bg-white/[0.06] text-white'
                  : 'text-neutral-500 hover:bg-white/[0.03] hover:text-neutral-200'
              }`}
            >
              {isActive && (
                <span className="absolute top-1/2 left-0 h-5 w-[3px] -translate-y-1/2 rounded-full bg-[#7c5cff]" />
              )}
              <Icon size={18} strokeWidth={1.8} className={isActive ? 'text-[#a594ff]' : ''} />
              {label}
            </button>
          )
        })}
      </nav>

      <div className="m-4 flex items-center gap-3 rounded-2xl border border-white/[0.05] bg-white/[0.02] p-3">
        <span className="flex size-9 items-center justify-center rounded-full bg-[#7c5cff] text-[13px] font-semibold text-white">
          D
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-medium text-neutral-200">Demo user</p>
          <p className="truncate text-[12px] text-neutral-500">demo@mayvexa.com</p>
        </div>
        <button
          type="button"
          onClick={onLogout}
          aria-label="Sign out"
          title="Sign out"
          className="flex size-8 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-white/[0.06] hover:text-white"
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  )
}
