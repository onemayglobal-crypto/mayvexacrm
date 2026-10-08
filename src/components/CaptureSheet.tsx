import { Briefcase, Calendar, CheckSquare, Phone, Share2, UserPlus, Users, X } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface CaptureSheetProps {
  onClose: () => void
  onSelect: (type: string) => void
}

const groups: { title: string; items: { type: string; label: string; hint: string; icon: LucideIcon; color: string }[] }[] = [
  {
    title: 'People & deals',
    items: [
      { type: 'lead', label: 'Lead', hint: 'A new potential customer', icon: UserPlus, color: '#34d399' },
      { type: 'contact', label: 'Contact', hint: 'Someone to stay in touch with', icon: Users, color: '#38bdf8' },
      { type: 'opportunity', label: 'Opportunity', hint: 'A deal ready for a proposal', icon: Briefcase, color: '#f472b6' },
      { type: 'referral', label: 'Referral', hint: 'Introduced by someone', icon: Share2, color: '#a3e635' },
    ],
  },
  {
    title: 'Activities',
    items: [
      { type: 'call', label: 'Call', hint: 'Log or plan a call', icon: Phone, color: '#fbbf24' },
      { type: 'meeting', label: 'Meeting', hint: 'Schedule time together', icon: Calendar, color: '#a78bfa' },
      { type: 'task', label: 'Task', hint: 'Anything else to do', icon: CheckSquare, color: '#94a3b8' },
    ],
  },
]

export function CaptureSheet({ onClose, onSelect }: CaptureSheetProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
      <button type="button" className="absolute inset-0" aria-label="Close" onClick={onClose} />
      <div className="animate-rise relative max-h-[90svh] w-full max-w-xl overflow-y-auto rounded-3xl border border-white/[0.08] bg-[#0b0d14] shadow-[0_30px_80px_rgba(0,0,0,0.6)]">
        <div className="absolute inset-x-20 top-0 h-px bg-gradient-to-r from-transparent via-[#7c5cff] to-transparent" />
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <div>
            <h2 className="text-[18px] font-semibold text-white">Create new</h2>
            <p className="text-[13px] text-neutral-500">What would you like to add?</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex size-9 items-center justify-center rounded-xl text-neutral-400 hover:bg-white/[0.06] hover:text-white"
          >
            <X size={18} />
          </button>
        </div>
        <div className="space-y-5 p-6">
          {groups.map((group) => (
            <div key={group.title}>
              <p className="mb-2 text-[11px] font-semibold tracking-[0.16em] text-neutral-500 uppercase">
                {group.title}
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {group.items.map(({ type, label, hint, icon: Icon, color }) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => onSelect(type)}
                    className="flex items-center gap-3 rounded-2xl border border-white/[0.05] bg-white/[0.02] p-3 text-left transition-colors hover:border-white/[0.14] hover:bg-white/[0.05]"
                  >
                    <span
                      className="flex size-10 shrink-0 items-center justify-center rounded-xl"
                      style={{ background: `${color}1a`, color }}
                    >
                      <Icon size={18} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[14px] font-medium text-neutral-100">{label}</span>
                      <span className="block truncate text-[12px] text-neutral-500">{hint}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
