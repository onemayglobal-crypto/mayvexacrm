import {
  Briefcase,
  Calendar,
  CheckSquare,
  Phone,
  Share2,
  UserPlus,
  Users,
  X,
} from 'lucide-react'
import type { ReactNode } from 'react'

interface CaptureSheetProps {
  onClose: () => void
  onSelect: (type: string) => void
}

export function CaptureSheet({ onClose, onSelect }: CaptureSheetProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <button type="button" className="absolute inset-0" aria-label="Close" onClick={onClose} />
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-[#323235] bg-[#161617] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#262628] px-6 py-4">
          <h2 className="text-lg font-medium text-neutral-50">Create new...</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-full bg-[#1f1f22] text-neutral-400 hover:text-neutral-50"
          >
            <X size={18} />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3 p-6 sm:grid-cols-3">
          <Option
            icon={<UserPlus size={24} />}
            label="Lead"
            color="text-[#4fd17e]"
            bg="bg-[#2f9e57]/10"
            onClick={() => onSelect('lead')}
          />
          <Option
            icon={<Users size={24} />}
            label="Contact"
            color="text-[#7eb0ff]"
            bg="bg-[#3d8bfd]/10"
            onClick={() => onSelect('contact')}
          />
          <Option
            icon={<Phone size={24} />}
            label="Call"
            color="text-[#f0c36a]"
            bg="bg-[#e8a93a]/10"
            onClick={() => onSelect('call')}
          />
          <Option
            icon={<Calendar size={24} />}
            label="Meeting"
            color="text-[#c084fc]"
            bg="bg-[#a855f7]/10"
            onClick={() => onSelect('meeting')}
          />
          <Option
            icon={<Briefcase size={24} />}
            label="Opportunity"
            color="text-[#f07a7a]"
            bg="bg-[#e5484d]/10"
            onClick={() => onSelect('opportunity')}
          />
          <Option
            icon={<Share2 size={24} />}
            label="Referral"
            color="text-[#3ecf6e]"
            bg="bg-[#2f9e57]/10"
            onClick={() => onSelect('referral')}
          />
          <Option
            icon={<CheckSquare size={24} />}
            label="Task"
            color="text-neutral-300"
            bg="bg-[#2a2a2c]"
            onClick={() => onSelect('task')}
          />
        </div>
      </div>
    </div>
  )
}

function Option({
  icon,
  label,
  color,
  bg,
  onClick,
}: {
  icon: ReactNode
  label: string
  color: string
  bg: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-[#2a2a2c] bg-[#1b1b1d] p-5 transition-colors hover:border-[#323235] hover:bg-[#1f1f22]"
    >
      <div className={`flex size-12 items-center justify-center rounded-full ${bg} ${color}`}>
        {icon}
      </div>
      <span className="text-[14px] font-medium text-neutral-200">{label}</span>
    </button>
  )
}
