import { useMemo, useState } from 'react'
import { ChevronRight, Flame, MessageCircle, Phone, Search } from 'lucide-react'
import { GradeBadge } from '../components/GradeBadge'
import { rupeesToLakhs } from '../lib/format'
import { useCrm } from '../store/CrmContext'
import type { Lead, Stage } from '../types'
import { STAGES } from '../types'

const card = 'rounded-2xl border border-[#262628] bg-[#1b1b1d]'
const ghost =
  'flex h-10 items-center justify-center gap-2 rounded-lg border border-[#323235] bg-[#1f1f22] text-[14px] text-neutral-100 hover:bg-[#2a2a2d]'

const columnTone: Record<Stage, string> = {
  'A+': 'text-[#4fd17e]',
  'B+': 'text-[#f0c36a]',
  'C+': 'text-neutral-300',
  Proposal: 'text-[#7eb0ff]',
  Decision: 'text-[#7eb0ff]',
  Won: 'text-[#3ecf6e]',
  Lost: 'text-[#f07a7a]',
}

interface PipelineScreenProps {
  onOpenLead: (id: string) => void
  onCapture: () => void
}

export function PipelineScreen({ onOpenLead, onCapture }: PipelineScreenProps) {
  const { store, updateLead } = useCrm()
  const [query, setQuery] = useState('')
  const [focus, setFocus] = useState<Stage | 'All'>('All')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return store.leads.filter((lead) => {
      if (focus !== 'All' && lead.stage !== focus) return false
      if (!q) return true
      return [lead.name, lead.company, lead.nextAction, lead.notes]
        .join(' ')
        .toLowerCase()
        .includes(q)
    })
  }, [store.leads, query, focus])

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-neutral-400">Pipeline</p>
          <h1 className="text-3xl font-medium text-neutral-50">Where every lead stands</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="relative">
            <Search size={15} className="absolute top-3 left-3 text-neutral-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, company, notes"
              className="h-10 w-72 rounded-lg border border-[#323235] bg-[#1f1f22] pr-3 pl-9 text-[14px] outline-none focus:border-[#2f7ef0]"
            />
          </label>
          <button type="button" onClick={onCapture} className={`${ghost} px-4`}>
            New lead
          </button>
        </div>
      </header>

      <div className="flex flex-wrap gap-2">
        <FilterChip active={focus === 'All'} onClick={() => setFocus('All')} label="All" />
        {STAGES.map((stage) => (
          <FilterChip
            key={stage}
            active={focus === stage}
            onClick={() => setFocus(stage)}
            label={`${stage} · ${store.leads.filter((lead) => lead.stage === stage).length}`}
          />
        ))}
      </div>

      <div className="grid auto-cols-[minmax(280px,1fr)] grid-flow-col gap-3 overflow-x-auto pb-4">
        {STAGES.map((stage) => {
          const leads = filtered.filter((lead) => lead.stage === stage)
          const value = leads.reduce((sum, lead) => sum + lead.value, 0)
          return (
            <section key={stage} className={`${card} flex min-h-[560px] flex-col p-3`}>
              <header className="mb-3 flex items-baseline justify-between px-1">
                <h2 className={`text-[15px] font-medium ${columnTone[stage]}`}>
                  {stage} <span className="text-neutral-500">{leads.length}</span>
                </h2>
                <p className="text-[13px] text-neutral-400">{rupeesToLakhs(value)}</p>
              </header>
              <div className="flex flex-1 flex-col gap-2">
                {leads.map((lead) => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    onOpen={() => onOpenLead(lead.id)}
                    onMove={(next) => updateLead(lead.id, { stage: next })}
                  />
                ))}
                {leads.length === 0 && (
                  <p className="px-2 py-8 text-center text-[13px] text-neutral-600">No leads here</p>
                )}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}

function FilterChip({
  active,
  label,
  onClick,
}: {
  active: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-10 rounded-xl border px-4 text-[14px] ${
        active
          ? 'border-neutral-600 bg-[#1f1f21] text-neutral-50'
          : 'border-[#2a2a2c] bg-[#19191a] text-neutral-300 hover:text-neutral-100'
      }`}
    >
      {label}
    </button>
  )
}

function LeadCard({
  lead,
  onOpen,
  onMove,
}: {
  lead: Lead
  onOpen: () => void
  onMove: (stage: Stage) => void
}) {
  const digits = lead.phone.replace(/\D/g, '')
  const isDecision = lead.stage === 'Decision'
  const isLost = lead.stage === 'Lost'

  return (
    <article
      className={`p-3 ${
        isDecision
          ? 'rounded-xl border border-[#2d63b8] bg-[#191b20]'
          : `${card} ${isLost ? 'opacity-70' : ''}`
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <GradeBadge grade={lead.grade} />
          <button
            type="button"
            onClick={onOpen}
            className="truncate text-[17px] text-neutral-50 hover:underline"
          >
            {lead.name}
          </button>
        </div>
        <span className="flex shrink-0 items-center gap-1 rounded-md bg-[#3d1517] px-2 py-0.5 text-[12px] font-medium text-[#f26d6d]">
          <Flame size={12} />
          {lead.score}
        </span>
      </div>
      {lead.company && <p className="mt-1 text-[13px] text-neutral-500">{lead.company}</p>}
      <h3 className="mt-2.5 text-[15px] font-medium text-neutral-50">
        {lead.nextAction || 'Follow up'}
      </h3>
      <p className="mt-0.5 line-clamp-2 text-[14px] leading-snug text-neutral-400">
        {lead.notes || rupeesToLakhs(lead.value)}
      </p>
      <p className="mt-2 text-[13px] text-neutral-300">{rupeesToLakhs(lead.value)}</p>
      <div className="mt-3 grid grid-cols-[1fr_1.2fr_auto] gap-2">
        {lead.phone ? (
          <a href={`tel:${lead.phone}`} className={ghost}>
            <Phone size={15} /> Call
          </a>
        ) : (
          <span />
        )}
        {digits ? (
          <a
            href={`https://wa.me/${digits}`}
            target="_blank"
            rel="noreferrer"
            className={ghost}
          >
            <MessageCircle size={15} /> WhatsApp
          </a>
        ) : (
          <span />
        )}
        <button type="button" onClick={onOpen} aria-label="Open lead" className={`${ghost} w-12`}>
          <ChevronRight size={17} />
        </button>
      </div>
      <select
        className="mt-2 h-10 w-full rounded-lg border border-[#323235] bg-[#1f1f22] px-3 text-[13px] text-neutral-200"
        value={lead.stage}
        onChange={(e) => onMove(e.target.value as Stage)}
      >
        {STAGES.map((stage) => (
          <option key={stage} value={stage}>
            Move to {stage}
          </option>
        ))}
      </select>
    </article>
  )
}
