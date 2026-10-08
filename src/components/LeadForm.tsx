import { useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { chip, field, fieldLabel, primaryBtn, stageColor, typeMeta } from '../lib/ui'
import type { Lead } from '../types'
import { EMPTY_LEAD, GRADES, inferLeadType, LEAD_TYPES, STAGES } from '../types'

export type LeadDraft = Omit<Lead, 'id' | 'createdAt' | 'closedAt'>

interface LeadFormProps {
  value: LeadDraft
  onChange: (next: LeadDraft) => void
  onSubmit: () => void
  submitLabel: string
  onDelete?: () => void
  showStage?: boolean
  detailsOpen?: boolean
}

export function blankDraft(): LeadDraft {
  return { ...EMPTY_LEAD }
}

export function draftFromLead(lead: Lead): LeadDraft {
  return {
    name: lead.name,
    company: lead.company,
    phone: lead.phone,
    email: lead.email,
    value: lead.value,
    grade: lead.grade,
    score: lead.score,
    stage: lead.stage,
    type: inferLeadType(lead),
    nextAction: lead.nextAction,
    notes: lead.notes,
    lastContact: lead.lastContact,
    proposalSent: lead.proposalSent,
    proposalExpires: lead.proposalExpires,
    meetings: lead.meetings,
    objectionsOpen: lead.objectionsOpen,
  }
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="space-y-4">
      <legend className="mb-3 text-[12px] font-semibold tracking-[0.14em] text-neutral-500 uppercase">
        {title}
      </legend>
      {children}
    </fieldset>
  )
}

export function LeadForm({
  value,
  onChange,
  onSubmit,
  submitLabel,
  onDelete,
  showStage = true,
  detailsOpen = false,
}: LeadFormProps) {
  const [moreOpen, setMoreOpen] = useState(detailsOpen)
  const set = <K extends keyof LeadDraft>(key: K, next: LeadDraft[K]) =>
    onChange({ ...value, [key]: next })

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!value.name.trim()) return
    onSubmit()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Section title="Contact">
        <label className="block">
          <span className={fieldLabel}>Full name</span>
          <input
            className={field}
            value={value.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="e.g. Priya Sharma"
            required
            autoFocus
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className={fieldLabel}>Company</span>
            <input
              className={field}
              value={value.company}
              onChange={(e) => set('company', e.target.value)}
              placeholder="Company name"
            />
          </label>
          <label className="block">
            <span className={fieldLabel}>Deal value</span>
            <div className="relative">
              <span className="absolute top-1/2 left-3.5 -translate-y-1/2 text-[14px] text-neutral-500">₹</span>
              <input
                className={`${field} pl-8`}
                type="number"
                min={0}
                value={value.value || ''}
                onChange={(e) => set('value', Number(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
          </label>
          <label className="block">
            <span className={fieldLabel}>Phone</span>
            <input
              className={field}
              value={value.phone}
              onChange={(e) => set('phone', e.target.value)}
              placeholder="+91 98765 43210"
            />
          </label>
          <label className="block">
            <span className={fieldLabel}>Email</span>
            <input
              className={field}
              type="email"
              value={value.email}
              onChange={(e) => set('email', e.target.value)}
              placeholder="name@company.com"
            />
          </label>
        </div>
      </Section>

      <Section title="Qualification">
        {showStage && (
          <div>
            <span className={fieldLabel}>Type</span>
            <div className="flex flex-wrap gap-2">
              {LEAD_TYPES.map((t) => {
                const { label, icon: Icon, color } = typeMeta[t]
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => set('type', t)}
                    className={`${chip((value.type ?? 'lead') === t)} inline-flex items-center gap-2`}
                  >
                    <Icon size={13} style={{ color }} />
                    {label}
                  </button>
                )
              })}
            </div>
          </div>
        )}
        {showStage && (
          <div>
            <span className={fieldLabel}>Stage</span>
            <div className="flex flex-wrap gap-2">
              {STAGES.map((stage) => (
                <button
                  key={stage}
                  type="button"
                  onClick={() => set('stage', stage)}
                  className={`${chip(value.stage === stage)} inline-flex items-center gap-2`}
                >
                  <span className="size-1.5 rounded-full" style={{ background: stageColor[stage] }} />
                  {stage}
                </button>
              ))}
            </div>
          </div>
        )}
        <div>
          <span className={fieldLabel}>Grade</span>
          <div className="flex gap-2">
            {GRADES.map((grade) => (
              <button
                key={grade}
                type="button"
                onClick={() => set('grade', grade)}
                className={`${chip(value.grade === grade)} min-w-12`}
              >
                {grade}
              </button>
            ))}
          </div>
        </div>
        <label className="block">
          <span className={fieldLabel}>Next action</span>
          <input
            className={field}
            value={value.nextAction}
            onChange={(e) => set('nextAction', e.target.value)}
            placeholder="e.g. Send revised proposal"
          />
        </label>
      </Section>

      <div className="rounded-2xl border border-white/[0.06]">
        <button
          type="button"
          onClick={() => setMoreOpen((open) => !open)}
          className="flex w-full items-center justify-between px-4 py-3.5 text-[13px] font-medium text-neutral-300 hover:text-white"
        >
          More details
          <ChevronDown size={16} className={`transition-transform ${moreOpen ? 'rotate-180' : ''}`} />
        </button>
        {moreOpen && (
          <div className="space-y-4 border-t border-white/[0.06] p-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className={fieldLabel}>Score (1–99)</span>
                <input
                  className={field}
                  type="number"
                  min={1}
                  max={99}
                  value={value.score}
                  onChange={(e) => set('score', Number(e.target.value))}
                />
              </label>
              <label className="block">
                <span className={fieldLabel}>Meetings held</span>
                <input
                  className={field}
                  type="number"
                  min={0}
                  value={value.meetings}
                  onChange={(e) => set('meetings', Number(e.target.value) || 0)}
                />
              </label>
              <label className="block">
                <span className={fieldLabel}>Last contact</span>
                <input
                  className={field}
                  type="date"
                  value={value.lastContact?.slice(0, 10) ?? ''}
                  onChange={(e) =>
                    set('lastContact', e.target.value ? new Date(e.target.value).toISOString() : undefined)
                  }
                />
              </label>
              <label className="block">
                <span className={fieldLabel}>Proposal expires</span>
                <input
                  className={field}
                  type="date"
                  value={value.proposalExpires?.slice(0, 10) ?? ''}
                  onChange={(e) =>
                    set(
                      'proposalExpires',
                      e.target.value ? new Date(e.target.value).toISOString() : undefined,
                    )
                  }
                />
              </label>
            </div>
            <label className="block">
              <span className={fieldLabel}>Notes</span>
              <textarea
                className={`${field} h-24 resize-none py-2.5`}
                value={value.notes}
                onChange={(e) => set('notes', e.target.value)}
                placeholder="Anything worth remembering"
              />
            </label>
            <label className="flex items-center gap-2.5 text-[13px] text-neutral-300">
              <input
                type="checkbox"
                className="size-4 accent-[#7c5cff]"
                checked={value.objectionsOpen}
                onChange={(e) => set('objectionsOpen', e.target.checked)}
              />
              An objection is still open
            </label>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-white/[0.06] pt-6">
        {onDelete ? (
          <button
            type="button"
            onClick={onDelete}
            className="h-10 rounded-xl px-3 text-[13px] text-[#f87171] transition-colors hover:bg-[#f87171]/10"
          >
            Delete lead
          </button>
        ) : (
          <span />
        )}
        <button type="submit" className={`${primaryBtn} px-6`}>
          {submitLabel}
        </button>
      </div>
    </form>
  )
}
