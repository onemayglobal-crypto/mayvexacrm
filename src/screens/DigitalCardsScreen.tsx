import { useState } from 'react'
import { Building2, Contact2, Mail, Phone, QrCode, Share2 } from 'lucide-react'
import { GradeBadge } from '../components/GradeBadge'
import { TypeTag } from '../components/TypeTag'
import { rupeesToLakhs } from '../lib/format'
import { useCrm } from '../store/CrmContext'
import type { Grade } from '../types'
import { GRADES } from '../types'

interface DigitalCardsScreenProps {
  onOpenLead: (id: string) => void
}

export function DigitalCardsScreen({ onOpenLead }: DigitalCardsScreenProps) {
  const { store } = useCrm()
  const [filter, setFilter] = useState<Grade | 'All'>('All')

  const filteredLeads = store.leads.filter((l) => filter === 'All' || l.grade === filter)

  // A helper function to create a mock share action
  const handleShare = (name: string) => {
    alert(`Digital card for ${name} copied to clipboard!`)
  }

  return (
    <div className="animate-rise mx-auto max-w-6xl space-y-10 pb-12">
      {/* Header */}
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-xl bg-[#7c5cff]/20 text-[#a594ff]">
              <Contact2 size={18} />
            </span>
            <h1 className="text-[28px] font-bold tracking-tight text-white">Digital Cards</h1>
          </div>
          <p className="mt-2 text-[14px] text-neutral-400">
            Shareable digital business profiles for your clients based on success rate and category.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 rounded-xl bg-white/[0.03] p-1.5">
          <button
            onClick={() => setFilter('All')}
            className={`rounded-lg px-4 py-1.5 text-[13px] font-medium transition-all ${
              filter === 'All'
                ? 'bg-[#7c5cff] text-white shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            All
          </button>
          {GRADES.map((g) => (
            <button
              key={g}
              onClick={() => setFilter(g)}
              className={`rounded-lg px-4 py-1.5 text-[13px] font-medium transition-all ${
                filter === g
                  ? 'bg-[#7c5cff] text-white shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </header>

      {/* Grid of Cards */}
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {filteredLeads.map((lead) => {
          // Determine gradient colors based on Grade for a multi-color liquid effect
          let gradientFrom = 'from-[#7c5cff]'
          let gradientVia = 'via-[#4a00e0]'
          let gradientTo = 'to-[#8e2de2]'
          let glowColor = 'bg-[#7c5cff]/30'

          if (lead.grade === 'A+') {
            gradientFrom = 'from-[#11998e]'
            gradientVia = 'via-[#38ef7d]'
            gradientTo = 'to-[#11998e]'
            glowColor = 'bg-[#38ef7d]/30'
          } else if (lead.grade === 'A') {
            gradientFrom = 'from-[#2193b0]'
            gradientVia = 'via-[#6dd5ed]'
            gradientTo = 'to-[#2193b0]'
            glowColor = 'bg-[#6dd5ed]/30'
          } else if (lead.grade === 'B') {
            gradientFrom = 'from-[#f12711]'
            gradientVia = 'via-[#f5af19]'
            gradientTo = 'to-[#f12711]'
            glowColor = 'bg-[#f5af19]/30'
          } else if (lead.grade === 'C') {
            gradientFrom = 'from-[#8e9eab]'
            gradientVia = 'via-[#eef2f3]'
            gradientTo = 'to-[#8e9eab]'
            glowColor = 'bg-[#eef2f3]/30'
          }

          return (
            <div
              key={lead.id}
              className={`group relative overflow-visible rounded-[2rem] p-[1px] shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_25px_50px_rgba(0,0,0,0.6)] hover:scale-[1.02]`}
            >
              {/* 3D Physical Edge (Back layer for thickness) */}
              <div className={`absolute inset-0 rounded-[2rem] bg-gradient-to-br ${gradientFrom} ${gradientTo} opacity-60 shadow-[4px_4px_15px_rgba(0,0,0,0.8)]`} />
              
              {/* Multi-color Animated Gradient Border (Front layer) */}
              <div className={`absolute inset-0 rounded-[2rem] bg-gradient-to-br ${gradientFrom} ${gradientVia} ${gradientTo} opacity-90 transition-opacity duration-500 group-hover:opacity-100`} />
              
              {/* Liquid Glass Inner Card with Beveled 3D Edges */}
              <div className="relative h-full w-full overflow-hidden rounded-[calc(2rem-1px)] bg-gradient-to-br from-[#1a1d2d]/85 via-[#07090f]/90 to-[#020305]/95 backdrop-blur-3xl p-7 pb-24 shadow-[inset_1px_1px_3px_rgba(255,255,255,0.5),inset_-3px_-3px_8px_rgba(0,0,0,0.9),inset_0_0_20px_rgba(0,0,0,0.6)]">
                
                {/* Corner Shades / Bevel Lighting */}
                <div className="pointer-events-none absolute -left-8 -top-8 size-32 rounded-full bg-white/10 blur-2xl" />
                <div className="pointer-events-none absolute -bottom-8 -right-8 size-32 rounded-full bg-black/90 blur-2xl" />

                {/* Liquid Glow Orbs */}
                <div className={`pointer-events-none absolute -right-10 -top-10 size-48 rounded-full ${glowColor} blur-[50px] transition-all duration-700 group-hover:scale-150 group-hover:opacity-70`} />
                <div className={`pointer-events-none absolute -bottom-12 -left-12 size-40 rounded-full ${glowColor} blur-[40px] opacity-50 transition-all duration-700 group-hover:scale-125 group-hover:opacity-80`} />
                
                {/* Sweeping Glare Effect */}
                <div className="pointer-events-none absolute -inset-[200%] rotate-45 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/15 to-transparent opacity-0 transition-all duration-1000 ease-in-out group-hover:translate-x-[100%] group-hover:opacity-100" />

                {/* Name & Company */}
                <div className="relative z-10 flex items-start justify-between">
                  <div>
                    <h3 className="text-[22px] font-bold text-white tracking-tight drop-shadow-sm">{lead.name}</h3>
                    <p className="mt-1.5 flex items-center gap-2 text-[13px] font-medium text-neutral-300">
                      <Building2 size={14} className="text-white/60" />
                      {lead.company}
                    </p>
                  </div>
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_4px_10px_rgba(0,0,0,0.3)] backdrop-blur-md transition-transform duration-500 group-hover:scale-110">
                    <QrCode size={22} />
                  </div>
                </div>

                {/* Contact Info */}
                <div className="relative z-10 mt-8 space-y-4">
                  <div className="flex items-center gap-3.5 text-[14px] text-neutral-200">
                    <div className="flex size-8 items-center justify-center rounded-full bg-white/10 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_2px_5px_rgba(0,0,0,0.2)] backdrop-blur-sm">
                      <Phone size={13} />
                    </div>
                    <span className="font-medium tracking-wide drop-shadow-sm">{lead.phone}</span>
                  </div>
                  <div className="flex items-center gap-3.5 text-[14px] text-neutral-200">
                    <div className="flex size-8 items-center justify-center rounded-full bg-white/10 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_2px_5px_rgba(0,0,0,0.2)] backdrop-blur-sm">
                      <Mail size={13} />
                    </div>
                    <span className="truncate font-medium drop-shadow-sm">{lead.email}</span>
                  </div>
                </div>

                {/* Bottom Section */}
                <div className="relative z-10 mt-6 flex items-end justify-between border-t border-white/10 pt-5">
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center gap-2">
                      <GradeBadge grade={lead.grade} />
                      {lead.type && <TypeTag type={lead.type} />}
                    </div>
                    <span className="text-[10px] font-bold text-white/60 uppercase tracking-[0.15em] drop-shadow-sm">
                      Success Rate &amp; Category
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-[20px] font-black text-white drop-shadow-lg">{rupeesToLakhs(lead.value)}</p>
                    <p className="mt-0.5 text-[10px] font-bold text-white/60 uppercase tracking-[0.15em] drop-shadow-sm">Value</p>
                  </div>
                </div>

                {/* Action Overlay (Hover state) */}
                <div className="absolute inset-x-0 bottom-0 z-20 flex translate-y-full items-center justify-between bg-gradient-to-r from-white/15 to-white/5 px-7 py-5 backdrop-blur-2xl transition-transform duration-500 ease-out group-hover:translate-y-0 border-t border-white/20 shadow-[0_-10px_20px_rgba(0,0,0,0.2)]">
                  <button
                    onClick={() => onOpenLead(lead.id)}
                    className="text-[13px] font-bold text-white hover:text-white/80 transition-colors drop-shadow-md"
                  >
                    View CRM Record
                  </button>
                  <button
                    onClick={() => handleShare(lead.name)}
                    className="flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2 text-[12px] font-bold text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_4px_12px_rgba(0,0,0,0.2)] backdrop-blur-md hover:bg-white/30 transition-all active:scale-95"
                  >
                    <Share2 size={14} /> Share
                  </button>
                </div>
              </div>
            </div>
          )
        })}

        {filteredLeads.length === 0 && (
          <div className="col-span-full py-12 text-center text-neutral-500">
            No digital cards found for this success rate.
          </div>
        )}
      </div>
    </div>
  )
}
