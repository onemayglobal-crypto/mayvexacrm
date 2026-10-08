import { Briefcase, Share2, UserPlus, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { LeadType, Stage } from '../types'

export const typeMeta: Record<LeadType, { label: string; icon: LucideIcon; color: string }> = {
  lead: { label: 'Lead', icon: UserPlus, color: '#34d399' },
  contact: { label: 'Contact', icon: Users, color: '#38bdf8' },
  opportunity: { label: 'Opportunity', icon: Briefcase, color: '#f472b6' },
  referral: { label: 'Referral', icon: Share2, color: '#a3e635' },
}

export const stageColor: Record<Stage, string> = {
  'A+': '#34d399',
  'B+': '#fbbf24',
  'C+': '#94a3b8',
  Proposal: '#38bdf8',
  Decision: '#818cf8',
  Won: '#22c55e',
  Lost: '#f87171',
}

export const card =
  'rounded-2xl border border-white/[0.06] bg-white/[0.025] shadow-[0_1px_0_rgba(255,255,255,0.03)_inset]'

export const cardHover = 'transition-colors hover:border-white/[0.12] hover:bg-white/[0.04]'

export const primaryBtn =
  'inline-flex h-10 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-[#7c5cff] px-4 text-[14px] font-medium text-white shadow-[0_8px_24px_rgba(124,92,255,0.35)] transition-all hover:bg-[#8b6dff] hover:shadow-[0_10px_30px_rgba(124,92,255,0.5)] active:scale-[0.98]'

export const ghostBtn =
  'inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 text-[14px] text-neutral-200 transition-colors hover:border-white/[0.16] hover:bg-white/[0.06] hover:text-white'

export const iconBtn =
  'inline-flex size-9 items-center justify-center rounded-xl text-neutral-400 transition-colors hover:bg-white/[0.06] hover:text-white'

export const field =
  'h-11 w-full rounded-xl border border-white/[0.08] bg-[#0b0d14] px-3.5 text-[14px] text-neutral-100 outline-none transition-colors placeholder:text-neutral-600 focus:border-[#7c5cff] focus:ring-4 focus:ring-[#7c5cff]/15'

export const fieldLabel = 'mb-1.5 block text-[12px] font-medium text-neutral-400'

export const eyebrow = 'text-[12px] font-medium uppercase tracking-[0.18em] text-neutral-500'

export function chip(active: boolean) {
  return `h-9 rounded-xl border px-3.5 text-[13px] font-medium transition-colors ${
    active
      ? 'border-[#7c5cff]/60 bg-[#7c5cff]/15 text-white'
      : 'border-white/[0.08] bg-white/[0.02] text-neutral-400 hover:border-white/[0.16] hover:text-neutral-200'
  }`
}

export function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}
