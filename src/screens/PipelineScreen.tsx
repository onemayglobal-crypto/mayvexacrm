import { useMemo, useState } from 'react'
import type { DragEvent } from 'react'
import { CalendarClock, Check, MessageCircle, Phone, Plus, Search, Sparkles, X } from 'lucide-react'
import { analyzeLeadWithAi } from '../lib/aiScoring'
import { GradeBadge } from '../components/GradeBadge'
import { TypeTag } from '../components/TypeTag'
import { daysFrom, rupeesToLakhs } from '../lib/format'
import { eyebrow, field, primaryBtn, stageColor, typeMeta } from '../lib/ui'
import { useCrm } from '../store/CrmContext'
import type { Grade, Lead, LeadType, Stage } from '../types'
import { GRADES, inferLeadType, LEAD_TYPES, STAGES } from '../types'

interface PipelineScreenProps {
  onOpenLead: (id: string) => void
  onCapture: () => void
}

export function PipelineScreen({ onOpenLead, onCapture }: PipelineScreenProps) {
  const { store, updateLead } = useCrm()
  const [query, setQuery] = useState('')
  const [dragOver, setDragOver] = useState<Stage | null>(null)
  const [grade, setGrade] = useState<Grade | 'All'>('All')
  const [kind, setKind] = useState<LeadType | 'All'>('All')
  const [filterOpen, setFilterOpen] = useState(false)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return store.leads.filter((lead) => {
      if (grade !== 'All' && lead.grade !== grade) return false
      if (kind !== 'All' && inferLeadType(lead) !== kind) return false
      if (!q) return true
      return [lead.name, lead.company, lead.nextAction, lead.notes].join(' ').toLowerCase().includes(q)
    })
  }, [store.leads, query, grade, kind])

  const typeOptions: { value: LeadType | 'All'; count: number }[] = [
    { value: 'All', count: store.leads.length },
    ...LEAD_TYPES.map((t) => ({
      value: t,
      count: store.leads.filter((lead) => inferLeadType(lead) === t).length,
    })),
  ]

  const gradeOptions: { value: Grade | 'All'; label: string; count: number }[] = [
    { value: 'All', label: 'All grades', count: store.leads.length },
    ...GRADES.map((g) => ({
      value: g,
      label: `Grade ${g}`,
      count: store.leads.filter((lead) => lead.grade === g).length,
    })),
  ]

  const open = store.leads.filter((lead) => lead.stage !== 'Won' && lead.stage !== 'Lost')
  const openValue = open.reduce((sum, lead) => sum + lead.value, 0)

  const drop = (stage: Stage) => (event: DragEvent) => {
    event.preventDefault()
    const id = event.dataTransfer.getData('text/plain')
    setDragOver(null)
    const lead = store.leads.find((item) => item.id === id)
    if (lead && lead.stage !== stage) updateLead(id, { stage })
  }

  return (
    <div className="animate-rise flex h-full flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className={eyebrow}>Pipeline</p>
          <h1 className="mt-1 text-[30px] font-semibold tracking-[-0.03em] text-white">Where every deal stands</h1>
          <p className="mt-1 text-[14px] text-neutral-400">
            {open.length} open deals worth <span className="text-neutral-200">{rupeesToLakhs(openValue)}</span>
            <span className="text-neutral-600"> · drag a card to move it</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {kind !== 'All' && (
            <button
              type="button"
              onClick={() => setKind('All')}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#7c5cff]/40 bg-[#7c5cff]/10 pr-2.5 pl-2 text-[13px] text-neutral-200 hover:border-[#7c5cff]/70"
              aria-label={`Clear ${typeMeta[kind].label} filter`}
            >
              <TypeTag type={kind} />
              <X size={14} className="text-neutral-400" />
            </button>
          )}
          {grade !== 'All' && (
            <button
              type="button"
              onClick={() => setGrade('All')}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#7c5cff]/40 bg-[#7c5cff]/10 pr-2.5 pl-2 text-[13px] text-neutral-200 hover:border-[#7c5cff]/70"
              aria-label={`Clear grade ${grade} filter`}
            >
              <span className="pl-1">Grade</span>
              <GradeBadge grade={grade} />
              <X size={14} className="text-neutral-400" />
            </button>
          )}
          <div
            className="relative w-64 shrink-0"
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node)) setFilterOpen(false)
            }}
          >
            <Search size={15} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-neutral-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setFilterOpen(true)}
              onClick={() => setFilterOpen(true)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setFilterOpen(false)
              }}
              placeholder="Search leads"
              className={`${field} h-10 pl-10`}
            />
            {filterOpen && (
              <div className="animate-rise absolute top-12 left-0 z-30 max-h-[70svh] w-full min-w-60 overflow-y-auto rounded-2xl border border-white/[0.08] bg-[#0e111a] p-2 shadow-[0_24px_60px_rgba(0,0,0,0.5)] backdrop-blur-xl">
                <p className="px-3 pt-1.5 pb-2 text-[11px] font-semibold tracking-[0.16em] text-neutral-500 uppercase">
                  Filter by type
                </p>
                {typeOptions.map((option) => {
                  const active = kind === option.value
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setKind(option.value)
                        setFilterOpen(false)
                      }}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-[13px] transition-colors ${
                        active ? 'bg-white/[0.06] text-white' : 'text-neutral-300 hover:bg-white/[0.04]'
                      }`}
                    >
                      {option.value === 'All' ? (
                        <>
                          <span className="flex h-6 min-w-6 items-center justify-center rounded-lg bg-white/[0.06] text-[11px] text-neutral-400">
                            ∗
                          </span>
                          <span className="flex-1">All types</span>
                        </>
                      ) : (
                        <span className="flex-1">
                          <TypeTag type={option.value} />
                        </span>
                      )}
                      <span className="text-[12px] text-neutral-500">{option.count}</span>
                      {active && <Check size={14} className="text-[#a594ff]" />}
                    </button>
                  )
                })}
                <div className="my-2 h-px bg-white/[0.06]" />
                <p className="px-3 pt-1.5 pb-2 text-[11px] font-semibold tracking-[0.16em] text-neutral-500 uppercase">
                  Filter by grade
                </p>
                {gradeOptions.map((option) => {
                  const active = grade === option.value
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setGrade(option.value)
                        setFilterOpen(false)
                      }}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-[13px] transition-colors ${
                        active ? 'bg-white/[0.06] text-white' : 'text-neutral-300 hover:bg-white/[0.04]'
                      }`}
                    >
                      {option.value === 'All' ? (
                        <span className="flex h-6 min-w-6 items-center justify-center rounded-lg bg-white/[0.06] text-[11px] text-neutral-400">
                          ∗
                        </span>
                      ) : (
                        <GradeBadge grade={option.value} />
                      )}
                      <span className="flex-1">{option.label}</span>
                      <span className="text-[12px] text-neutral-500">{option.count}</span>
                      {active && <Check size={14} className="text-[#a594ff]" />}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
          <button type="button" onClick={onCapture} className={primaryBtn}>
            <Plus size={16} /> New lead
          </button>
        </div>
      </header>

      <div className="-mx-2 flex min-h-0 flex-1 gap-3 overflow-x-auto px-2 pb-4">
        {STAGES.map((stage) => {
          const leads = filtered.filter((lead) => lead.stage === stage)
          const value = leads.reduce((sum, lead) => sum + lead.value, 0)
          const isOver = dragOver === stage
          return (
            <section
              key={stage}
              onDragOver={(e) => {
                e.preventDefault()
                if (dragOver !== stage) setDragOver(stage)
              }}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOver(null)
              }}
              onDrop={drop(stage)}
              className={`flex w-[272px] shrink-0 flex-col rounded-2xl border transition-colors ${
                isOver
                  ? 'border-[#7c5cff]/50 bg-[#7c5cff]/[0.06]'
                  : 'border-white/[0.04] bg-white/[0.015]'
              }`}
            >
              <header className="flex items-center justify-between px-4 pt-4 pb-3">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full" style={{ background: stageColor[stage] }} />
                  <h2 className="text-[14px] font-medium text-neutral-100">{stage}</h2>
                  <span className="rounded-md bg-white/[0.06] px-1.5 text-[11px] font-medium text-neutral-400">
                    {leads.length}
                  </span>
                </div>
                <p className="text-[12px] text-neutral-500">{rupeesToLakhs(value)}</p>
              </header>
              <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-2 pb-2">
                {leads.map((lead) => (
                  <LeadCard key={lead.id} lead={lead} onOpen={() => onOpenLead(lead.id)} />
                ))}
                {leads.length === 0 && (
                  <div
                    className={`flex h-24 items-center justify-center rounded-xl border border-dashed text-[12px] ${
                      isOver ? 'border-[#7c5cff]/50 text-[#a594ff]' : 'border-white/[0.06] text-neutral-600'
                    }`}
                  >
                    {isOver ? 'Drop to move here' : 'No deals'}
                  </div>
                )}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}

function LeadCard({ lead, onOpen }: { lead: Lead; onOpen: () => void }) {
  const digits = lead.phone.replace(/\D/g, '')
  const isLost = lead.stage === 'Lost'
  const since = daysFrom(lead.lastContact)
  const lastSeen = since == null ? null : Math.max(0, -since)
  const ai = analyzeLeadWithAi(lead)

  return (
    <article
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', lead.id)
        e.dataTransfer.effectAllowed = 'move'
      }}
      onClick={onOpen}
      className={`group cursor-pointer rounded-xl border border-white/[0.06] bg-[#0e111a] p-3.5 transition-all hover:-translate-y-px hover:border-white/[0.14] hover:shadow-[0_10px_30px_rgba(0,0,0,0.35)] active:cursor-grabbing ${
        isLost ? 'opacity-60' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-[14px] font-medium text-white">{lead.name}</p>
          <p className="truncate text-[12px] text-neutral-500">{lead.company || 'No company'}</p>
        </div>
        <GradeBadge grade={lead.grade} />
      </div>

      <div className="mt-2.5">
        <TypeTag type={inferLeadType(lead)} />
      </div>

      {lead.nextAction && (
        <div className="mt-3 rounded-lg border border-white/[0.05] bg-white/[0.02] px-2.5 py-2">
          <p className="flex items-center justify-between text-[10px] font-semibold tracking-[0.12em] text-neutral-500 uppercase">
            <span className="flex items-center gap-1">
              <CalendarClock size={11} /> Follow-up
            </span>
            {lastSeen != null && (
              <span className="font-normal tracking-normal normal-case">
                {lastSeen === 0 ? 'Contacted today' : `Last contact ${lastSeen}d ago`}
              </span>
            )}
          </p>
          <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-neutral-200">{lead.nextAction}</p>
        </div>
      )}

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-semibold text-neutral-100">{rupeesToLakhs(lead.value)}</span>
          <span
            className="flex items-center gap-1 rounded bg-[#7c5cff]/10 px-1.5 py-0.5 text-[11px] font-semibold text-[#c4b5fd]"
            title={`AI Win Probability: ${ai.winProbability}% (Score: ${ai.aiScore}/100)`}
          >
            <Sparkles size={10} className="text-[#a594ff]" />
            {ai.winProbability}%
          </span>
        </div>
        <div className="flex gap-1.5">
          {lead.phone && (
            <a
              href={`tel:${lead.phone}`}
              onClick={(e) => e.stopPropagation()}
              aria-label={`Call ${lead.name}`}
              title={`Call ${lead.phone}`}
              className="flex h-7 items-center gap-1 rounded-lg border border-[#38bdf8]/25 bg-[#38bdf8]/10 px-2 text-[11px] font-medium text-[#7dd3fc] transition-colors hover:border-[#38bdf8]/50 hover:bg-[#38bdf8]/20"
            >
              <Phone size={12} /> Call
            </a>
          )}
          {digits && (
            <a
              href={`https://wa.me/${digits}`}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              aria-label={`WhatsApp ${lead.name}`}
              title="WhatsApp"
              className="flex size-7 items-center justify-center rounded-lg border border-[#4ade80]/25 bg-[#4ade80]/10 text-[#86efac] transition-colors hover:border-[#4ade80]/50 hover:bg-[#4ade80]/20"
            >
              <MessageCircle size={13} />
            </a>
          )}
        </div>
      </div>
    </article>
  )
}
