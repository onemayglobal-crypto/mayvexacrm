import type { FormEvent } from 'react'
import type { Grade, Lead, Stage } from '../types'
import { EMPTY_LEAD, GRADES, STAGES } from '../types'

const field =
  'h-10 w-full rounded-lg border border-[#323235] bg-[#141415] px-3 text-[14px] text-neutral-100 outline-none focus:border-[#2f7ef0]'
const label = 'mb-1 block text-[12px] text-neutral-400'

export type LeadDraft = Omit<Lead, 'id' | 'createdAt' | 'closedAt'>

interface LeadFormProps {
  value: LeadDraft
  onChange: (next: LeadDraft) => void
  onSubmit: () => void
  submitLabel: string
  onDelete?: () => void
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
    nextAction: lead.nextAction,
    notes: lead.notes,
    lastContact: lead.lastContact,
    proposalSent: lead.proposalSent,
    proposalExpires: lead.proposalExpires,
    meetings: lead.meetings,
    objectionsOpen: lead.objectionsOpen,
  }
}

export function LeadForm({ value, onChange, onSubmit, submitLabel, onDelete }: LeadFormProps) {
  const set = <K extends keyof LeadDraft>(key: K, next: LeadDraft[K]) =>
    onChange({ ...value, [key]: next })

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!value.name.trim()) return
    onSubmit()
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
      <label className="col-span-2">
        <span className={label}>Name</span>
        <input
          className={field}
          value={value.name}
          onChange={(e) => set('name', e.target.value)}
          required
        />
      </label>
      <label>
        <span className={label}>Company</span>
        <input
          className={field}
          value={value.company}
          onChange={(e) => set('company', e.target.value)}
        />
      </label>
      <label>
        <span className={label}>Deal value (₹)</span>
        <input
          className={field}
          type="number"
          min={0}
          value={value.value || ''}
          onChange={(e) => set('value', Number(e.target.value) || 0)}
        />
      </label>
      <label>
        <span className={label}>Phone</span>
        <input
          className={field}
          value={value.phone}
          onChange={(e) => set('phone', e.target.value)}
        />
      </label>
      <label>
        <span className={label}>Email</span>
        <input
          className={field}
          type="email"
          value={value.email}
          onChange={(e) => set('email', e.target.value)}
        />
      </label>
      <label>
        <span className={label}>Pipeline</span>
        <select
          className={field}
          value={value.stage}
          onChange={(e) => set('stage', e.target.value as Stage)}
        >
          {STAGES.map((stage) => (
            <option key={stage} value={stage}>
              {stage}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span className={label}>Grade</span>
        <select
          className={field}
          value={value.grade}
          onChange={(e) => set('grade', e.target.value as Grade)}
        >
          {GRADES.map((grade) => (
            <option key={grade} value={grade}>
              {grade}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span className={label}>Score (1–99)</span>
        <input
          className={field}
          type="number"
          min={1}
          max={99}
          value={value.score}
          onChange={(e) => set('score', Number(e.target.value))}
        />
      </label>
      <label>
        <span className={label}>Meetings</span>
        <input
          className={field}
          type="number"
          min={0}
          value={value.meetings}
          onChange={(e) => set('meetings', Number(e.target.value) || 0)}
        />
      </label>
      <label className="col-span-2">
        <span className={label}>Next action</span>
        <input
          className={field}
          value={value.nextAction}
          onChange={(e) => set('nextAction', e.target.value)}
        />
      </label>
      <label>
        <span className={label}>Last contact</span>
        <input
          className={field}
          type="date"
          value={value.lastContact?.slice(0, 10) ?? ''}
          onChange={(e) =>
            set('lastContact', e.target.value ? new Date(e.target.value).toISOString() : undefined)
          }
        />
      </label>
      <label>
        <span className={label}>Proposal expires</span>
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
      <label className="col-span-2">
        <span className={label}>Notes</span>
        <textarea
          className={`${field} h-24 py-2`}
          value={value.notes}
          onChange={(e) => set('notes', e.target.value)}
        />
      </label>
      <label className="col-span-2 flex items-center gap-2 text-[14px] text-neutral-300">
        <input
          type="checkbox"
          checked={value.objectionsOpen}
          onChange={(e) => set('objectionsOpen', e.target.checked)}
        />
        Open objection remaining
      </label>
      <div className="col-span-2 mt-2 flex items-center justify-between gap-3">
        {onDelete ? (
          <button
            type="button"
            onClick={onDelete}
            className="h-10 rounded-lg border border-[#5a2428] px-4 text-[14px] text-[#f07a7a]"
          >
            Delete lead
          </button>
        ) : (
          <span />
        )}
        <button
          type="submit"
          className="h-10 rounded-lg bg-[#2f7ef0] px-5 text-[14px] font-medium text-white"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  )
}
