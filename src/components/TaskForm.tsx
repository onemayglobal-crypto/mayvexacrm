import type { FormEvent } from 'react'
import { useCrm } from '../store/CrmContext'
import type { TaskKind } from '../types'

const field =
  'h-10 w-full rounded-lg border border-[#323235] bg-[#141415] px-3 text-[14px] text-neutral-100 outline-none focus:border-[#2f7ef0]'
const label = 'mb-1 block text-[12px] text-neutral-400'

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

export function TaskForm({ value, onChange, onSubmit, submitLabel }: TaskFormProps) {
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
    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
      <label className="col-span-2">
        <span className={label}>Title</span>
        <input
          className={field}
          value={value.title}
          onChange={(e) => set('title', e.target.value)}
          required
          autoFocus
        />
      </label>
      <label className="col-span-2">
        <span className={label}>Detail / Notes</span>
        <textarea
          className={`${field} h-24 py-2`}
          value={value.detail}
          onChange={(e) => set('detail', e.target.value)}
        />
      </label>
      <label>
        <span className={label}>Due Date</span>
        <input
          className={field}
          type="date"
          value={value.dueDate}
          onChange={(e) => set('dueDate', e.target.value)}
          required
        />
      </label>
      <label>
        <span className={label}>Related Lead (Optional)</span>
        <select
          className={field}
          value={value.leadId}
          onChange={(e) => set('leadId', e.target.value)}
        >
          <option value="">None</option>
          {leads.map((lead) => (
            <option key={lead.id} value={lead.id}>
              {lead.name} ({lead.company})
            </option>
          ))}
        </select>
      </label>
      <div className="col-span-2 mt-2 flex justify-end">
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
