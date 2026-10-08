import type { FormEvent } from 'react'
import { field, fieldLabel, primaryBtn } from '../lib/ui'
import { useCrm } from '../store/CrmContext'
import type { TaskKind } from '../types'

export interface TaskDraft {
  title: string
  detail: string
  leadId: string
  dueDate: string
}

interface TaskFormProps {
  kind: TaskKind
  value: TaskDraft
  onChange: (next: TaskDraft) => void
  onSubmit: () => void
  submitLabel: string
}

export function blankTaskDraft(): TaskDraft {
  return {
    title: '',
    detail: '',
    leadId: '',
    dueDate: new Date().toISOString().slice(0, 10),
  }
}

const placeholders: Partial<Record<TaskKind, string>> = {
  call: 'e.g. Call Rahul about pricing',
  meeting: 'e.g. Product demo with Acme',
}

export function TaskForm({ kind, value, onChange, onSubmit, submitLabel }: TaskFormProps) {
  const { store } = useCrm()
  const set = <K extends keyof TaskDraft>(key: K, next: TaskDraft[K]) =>
    onChange({ ...value, [key]: next })

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!value.title.trim()) return
    onSubmit()
  }

  const leads = store.leads.filter((l) => l.stage !== 'Won' && l.stage !== 'Lost')

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <label className="block">
        <span className={fieldLabel}>What needs to happen?</span>
        <input
          className={field}
          value={value.title}
          onChange={(e) => set('title', e.target.value)}
          placeholder={placeholders[kind] ?? 'e.g. Send follow-up email'}
          required
          autoFocus
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className={fieldLabel}>Due date</span>
          <input
            className={field}
            type="date"
            value={value.dueDate}
            onChange={(e) => set('dueDate', e.target.value)}
            required
          />
        </label>
        <label className="block">
          <span className={fieldLabel}>Related lead</span>
          <select className={field} value={value.leadId} onChange={(e) => set('leadId', e.target.value)}>
            <option value="">None</option>
            {leads.map((lead) => (
              <option key={lead.id} value={lead.id}>
                {lead.name}
                {lead.company ? ` · ${lead.company}` : ''}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="block">
        <span className={fieldLabel}>Notes (optional)</span>
        <textarea
          className={`${field} h-24 resize-none py-2.5`}
          value={value.detail}
          onChange={(e) => set('detail', e.target.value)}
          placeholder="Add context for later"
        />
      </label>
      <div className="flex justify-end border-t border-white/[0.06] pt-6">
        <button type="submit" className={`${primaryBtn} px-6`}>
          {submitLabel}
        </button>
      </div>
    </form>
  )
}
