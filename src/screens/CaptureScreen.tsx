import { useState } from 'react'
import { blankDraft, LeadForm } from '../components/LeadForm'
import type { LeadDraft } from '../components/LeadForm'
import { blankTaskDraft, TaskForm } from '../components/TaskForm'
import type { TaskDraft } from '../components/TaskForm'
import { card, eyebrow } from '../lib/ui'
import { useCrm } from '../store/CrmContext'
import type { LeadType, TaskKind } from '../types'

interface CaptureScreenProps {
  type: string
  onCreated: (id: string, type: string) => void
}

export function CaptureScreen({ type, onCreated }: CaptureScreenProps) {
  const { addLead, addTask } = useCrm()
  const [leadDraft, setLeadDraft] = useState<LeadDraft>(blankDraft())
  const [taskDraft, setTaskDraft] = useState<TaskDraft>(blankTaskDraft())

  const isTaskType = ['task', 'call', 'meeting'].includes(type)

  const titles: Record<string, string> = {
    lead: 'New lead',
    contact: 'New contact',
    opportunity: 'New opportunity',
    referral: 'New referral',
    task: 'New task',
    call: 'Log a call',
    meeting: 'Schedule a meeting',
  }

  const descriptions: Record<string, string> = {
    lead: 'Only the name is required. Add a next action and it will appear on Today.',
    contact: 'Contacts start in the C+ stage of your pipeline.',
    opportunity: 'Opportunities start in the Proposal stage.',
    referral: 'Referrals start in C+ and are tagged as referrals.',
    task: 'Tasks show up in your Today list.',
    call: 'Calls show up in your Today list.',
    meeting: 'Meetings show up in your Today list.',
  }

  const handleLeadSubmit = () => {
    const draft = { ...leadDraft, type: type as LeadType }
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
    onCreated('', type)
  }

  return (
    <div className="animate-rise mx-auto w-full max-w-2xl">
      <p className={eyebrow}>Capture</p>
      <h1 className="mt-1 text-[30px] font-semibold tracking-[-0.03em] text-white">
        {titles[type] || `New ${type}`}
      </h1>
      <p className="mt-1 mb-8 text-[14px] text-neutral-400">{descriptions[type]}</p>
      <div className={`${card} p-7`}>
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
            showStage={type === 'lead'}
          />
        )}
      </div>
    </div>
  )
}
