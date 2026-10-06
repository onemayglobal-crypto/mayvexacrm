import { useState, useEffect } from 'react'
import { blankDraft, LeadForm } from '../components/LeadForm'
import type { LeadDraft } from '../components/LeadForm'
import { blankTaskDraft, TaskForm } from '../components/TaskForm'
import type { TaskDraft } from '../components/TaskForm'
import { useCrm } from '../store/CrmContext'
import type { TaskKind } from '../types'

interface CaptureScreenProps {
  type: string
  onCreated: (id: string, type: string) => void
}

export function CaptureScreen({ type, onCreated }: CaptureScreenProps) {
  const { addLead, addTask } = useCrm()
  const [leadDraft, setLeadDraft] = useState<LeadDraft>(blankDraft())
  const [taskDraft, setTaskDraft] = useState<TaskDraft>(blankTaskDraft())
  const [saved, setSaved] = useState('')

  useEffect(() => {
    // Reset drafts when type changes
    setLeadDraft(blankDraft())
    setTaskDraft(blankTaskDraft())
    setSaved('')
  }, [type])

  const isTaskType = ['task', 'call', 'meeting'].includes(type)

  const titles: Record<string, string> = {
    lead: 'Add a new lead',
    contact: 'Add a new contact',
    opportunity: 'Add a new opportunity',
    referral: 'Add a new referral',
    task: 'Add a new task',
    call: 'Log a call',
    meeting: 'Schedule a meeting',
  }

  const descriptions: Record<string, string> = {
    lead: 'Saves in this browser and drops the lead into Pipeline. If you set a next action, a Today task is created automatically.',
    contact: 'Adds a contact to your pipeline as a New lead.',
    opportunity: 'Adds a high-intent opportunity to your pipeline.',
    referral: 'Adds a referred lead to your pipeline.',
    task: 'Creates a general task on your Today screen.',
    call: 'Schedules a call task on your Today screen.',
    meeting: 'Schedules a meeting task on your Today screen.',
  }

  const handleLeadSubmit = () => {
    const draft = { ...leadDraft }
    if (type === 'contact') {
      draft.stage = 'C+'
    } else if (type === 'opportunity') {
      draft.stage = 'Proposal'
    } else if (type === 'referral') {
      draft.stage = 'C+'
      draft.notes = draft.notes ? `Referral. ${draft.notes}` : 'Referral.'
    }

    const lead = addLead(draft)
    setLeadDraft(blankDraft())
    setSaved(`${lead.name} is now in ${lead.stage}.`)
    onCreated(lead.id, type)
  }

  const handleTaskSubmit = () => {
    let kind: TaskKind = 'todo'
    let actionLabel = 'Done'
    
    if (type === 'call') {
      kind = 'call'
      actionLabel = 'Called'
    } else if (type === 'meeting') {
      kind = 'meeting'
      actionLabel = 'Met'
    }

    const dueDateIso = taskDraft.dueDate ? new Date(taskDraft.dueDate).toISOString() : new Date().toISOString()

    addTask({
      kind,
      title: taskDraft.title,
      detail: taskDraft.detail,
      actionLabel,
      doneLabel: 'Undo',
      done: false,
      dueDate: dueDateIso,
      leadId: taskDraft.leadId || undefined,
    })
    
    setTaskDraft(blankTaskDraft())
    setSaved(`Task "${taskDraft.title}" added to Today.`)
    onCreated('', type)
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <p className="text-sm text-neutral-400 capitalize">Capture {type}</p>
      <h1 className="mt-1 text-3xl font-medium">{titles[type] || `Add a new ${type}`}</h1>
      <p className="mt-2 mb-6 max-w-xl text-sm leading-relaxed text-neutral-400">
        {descriptions[type]}
      </p>
      {saved && (
        <p className="mb-4 rounded-xl border border-[#2f9e57]/40 bg-[#2f9e57]/10 px-4 py-3 text-sm text-[#4fd17e]">
          {saved}
        </p>
      )}
      <div className="rounded-2xl border border-[#262628] bg-[#1b1b1d] p-6">
        {isTaskType ? (
          <TaskForm
            kind={type as TaskKind}
            value={taskDraft}
            onChange={setTaskDraft}
            submitLabel={`Save ${type}`}
            onSubmit={handleTaskSubmit}
          />
        ) : (
          <LeadForm
            value={leadDraft}
            onChange={setLeadDraft}
            submitLabel={`Add ${type}`}
            onSubmit={handleLeadSubmit}
          />
        )}
      </div>
    </div>
  )
}
