import { useMemo, useState } from 'react'
import {
  ArrowUpRight,
  Calendar,
  CheckSquare,
  ChevronRight,
  CircleAlert,
  Clock,
  Flame,
  ListTodo,
  MessageCircle,
  Pencil,
  Phone,
  Plus,
  TrendingUp,
  X,
} from 'lucide-react'
import { GradeBadge } from '../components/GradeBadge'
import { ProgressRing } from '../components/ProgressRing'
import { daysFrom, rupeesToLakhs } from '../lib/format'
import { useCrm } from '../store/CrmContext'
import type { Task } from '../types'

const card = 'rounded-2xl border border-[#262628] bg-[#1b1b1d]'
const ghost =
  'flex h-10 items-center justify-center gap-2 rounded-lg border border-[#323235] bg-[#1f1f22] text-[14px] text-neutral-100 hover:bg-[#2a2a2d]'

function formatToday(date: Date) {
  return date.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

function greeting(date: Date) {
  const hour = date.getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

interface TodayScreenProps {
  onOpenLead: (id: string) => void
  onInsights: () => void
}

export function TodayScreen({ onOpenLead, onInsights }: TodayScreenProps) {
  const {
    store,
    toggleTask,
    addTask,
    deleteTask,
    updateSettings,
    weightedPipeline,
    monthlyAchieved,
    meetingsThisWeek,
  } = useCrm()
  const now = new Date()
  const [editingGoal, setEditingGoal] = useState(false)
  const [goalDraft, setGoalDraft] = useState(String(store.settings.monthlyGoal / 100000))
  const [addingTask, setAddingTask] = useState(false)
  const [taskTitle, setTaskTitle] = useState('')
  const [taskDetail, setTaskDetail] = useState('')

  const percent = store.settings.monthlyGoal
    ? Math.min(100, Math.round((monthlyAchieved / store.settings.monthlyGoal) * 100))
    : 0
  const onTrack = monthlyAchieved >= store.settings.monthlyGoal * (now.getDate() / 30)

  const priority = useMemo(() => {
    return store.leads
      .filter((lead) => lead.stage !== 'Won' && lead.stage !== 'Lost')
      .sort((a, b) => b.score - a.score)[0]
  }, [store.leads])

  const bToA = store.leads.filter(
    (lead) => lead.grade === 'B' && lead.meetings >= 2 && !lead.objectionsOpen && lead.stage !== 'Won',
  )

  const expireIn = daysFrom(priority?.proposalExpires)
  const reason = priority
    ? [
        priority.value
          ? `Proposal of ${rupeesToLakhs(priority.value)}${
              expireIn != null ? ` expires in ${expireIn} day${expireIn === 1 ? '' : 's'}` : ''
            }.`
          : '',
        priority.notes,
      ]
        .filter(Boolean)
        .join(' ')
    : ''

  const saveGoal = () => {
    const lakhs = Number(goalDraft)
    if (!Number.isFinite(lakhs) || lakhs <= 0) return
    updateSettings({ monthlyGoal: Math.round(lakhs * 100000) })
    setEditingGoal(false)
  }

  const submitTask = () => {
    if (!taskTitle.trim()) return
    addTask({
      kind: 'followup',
      title: taskTitle.trim(),
      detail: taskDetail.trim() || 'Manual task',
      actionLabel: 'Done',
      doneLabel: 'Undo',
      done: false,
      dueDate: new Date().toISOString(),
    })
    setTaskTitle('')
    setTaskDetail('')
    setAddingTask(false)
  }

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <p className="text-sm text-neutral-400">{formatToday(now)}</p>
          <h1 className="text-3xl font-medium text-neutral-50">{greeting(now)}</h1>
        </div>
        <p className="text-sm text-neutral-500">{store.leads.length} leads in this browser</p>
      </header>

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-4">
          <section className={`${card} flex items-center gap-6 p-5`}>
            <ProgressRing percent={percent} size={84} stroke={8} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm text-neutral-400">Monthly goal</p>
                <button
                  type="button"
                  onClick={() => {
                    setGoalDraft(String(store.settings.monthlyGoal / 100000))
                    setEditingGoal((open) => !open)
                  }}
                  className="text-neutral-500 hover:text-neutral-200"
                  aria-label="Edit monthly goal"
                >
                  <Pencil size={14} />
                </button>
              </div>
              {editingGoal ? (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-neutral-400">₹</span>
                  <input
                    className="h-10 w-24 rounded-lg border border-[#323235] bg-[#141415] px-2"
                    value={goalDraft}
                    onChange={(e) => setGoalDraft(e.target.value)}
                  />
                  <span className="text-neutral-400">L target</span>
                  <button type="button" onClick={saveGoal} className={`${ghost} px-3`}>
                    Save
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-2xl font-medium text-neutral-50">
                    {rupeesToLakhs(monthlyAchieved)} of {rupeesToLakhs(store.settings.monthlyGoal)}
                  </p>
                  <p
                    className={`mt-1 flex items-center gap-1 text-sm ${
                      onTrack ? 'text-[#3ecf6e]' : 'text-[#f0c36a]'
                    }`}
                  >
                    <TrendingUp size={14} />
                    {onTrack ? 'On track' : 'Behind pace'}
                  </p>
                </>
              )}
            </div>
            <div className="flex flex-col items-center gap-1 text-sm text-neutral-300">
              <Flame size={22} className="text-[#f2722b]" />
              {store.settings.streakDays} days
            </div>
          </section>

          <section className="grid grid-cols-2 gap-4">
            <div className={`${card} p-5`}>
              <p className="text-sm text-neutral-400">Weighted pipeline</p>
              <p className="mt-1 text-2xl font-medium">{rupeesToLakhs(weightedPipeline)}</p>
            </div>
            <div className={`${card} p-5`}>
              <p className="text-sm text-neutral-400">Meetings this week</p>
              <p className="mt-1 text-2xl font-medium">{meetingsThisWeek}</p>
            </div>
          </section>

          <div>
            <h2 className="mb-2 text-sm text-neutral-400">Your #1 move today</h2>
            {priority ? (
              <section className="rounded-2xl border border-[#2d63b8] bg-[#191b20] p-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <GradeBadge grade={priority.grade} />
                    <button
                      type="button"
                      onClick={() => onOpenLead(priority.id)}
                      className="text-lg text-neutral-50 hover:underline"
                    >
                      {priority.name}
                    </button>
                    {priority.company && (
                      <span className="text-sm text-neutral-500">{priority.company}</span>
                    )}
                  </div>
                  <span className="flex items-center gap-1 rounded-md bg-[#3d1517] px-2 py-0.5 text-[12px] font-medium text-[#f26d6d]">
                    <Flame size={12} />
                    {priority.score}
                  </span>
                </div>
                <h3 className="mt-3 text-lg font-medium">
                  {priority.nextAction || 'Follow up'}
                </h3>
                <p className="mt-1 text-[15px] leading-relaxed text-neutral-400">{reason}</p>
                <div className="mt-4 flex gap-2">
                  {priority.phone && (
                    <a href={`tel:${priority.phone}`} className={`${ghost} flex-1`}>
                      <Phone size={15} /> Call
                    </a>
                  )}
                  {priority.phone && (
                    <a
                      href={`https://wa.me/${priority.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${priority.name.split(' ')[0]}, `)}`}
                      target="_blank"
                      rel="noreferrer"
                      className={`${ghost} flex-1`}
                    >
                      <MessageCircle size={15} /> WhatsApp
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => onOpenLead(priority.id)}
                    className={`${ghost} w-12`}
                    aria-label="Open lead"
                  >
                    <ChevronRight size={17} />
                  </button>
                </div>
              </section>
            ) : (
              <p className={`${card} p-5 text-neutral-400`}>No open leads yet. Capture one to begin.</p>
            )}
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm text-neutral-400">Then</h2>
            <button
              type="button"
              onClick={() => setAddingTask((open) => !open)}
              className="flex items-center gap-1 text-sm text-[#7eb0ff]"
            >
              <Plus size={14} /> Add task
            </button>
          </div>
          <div className="space-y-2">
            {addingTask && (
              <section className={`${card} space-y-2 p-4`}>
                <input
                  className="h-10 w-full rounded-lg border border-[#323235] bg-[#141415] px-3"
                  placeholder="Task title"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                />
                <input
                  className="h-10 w-full rounded-lg border border-[#323235] bg-[#141415] px-3"
                  placeholder="Detail"
                  value={taskDetail}
                  onChange={(e) => setTaskDetail(e.target.value)}
                />
                <div className="flex justify-end gap-2">
                  <button type="button" className={`${ghost} px-3`} onClick={() => setAddingTask(false)}>
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="h-10 rounded-lg bg-[#2f7ef0] px-4 text-sm text-white"
                    onClick={submitTask}
                  >
                    Save task
                  </button>
                </div>
              </section>
            )}
            {store.tasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                onToggle={() => toggleTask(task.id)}
                onDelete={() => deleteTask(task.id)}
              />
            ))}
            {store.tasks.length === 0 && !addingTask && (
              <p className={`${card} p-5 text-neutral-500`}>No tasks. Add one or capture a lead.</p>
            )}
            <section className="flex items-center gap-3 rounded-2xl bg-[#0c2747] px-4 py-4">
              <ArrowUpRight size={19} className="shrink-0 text-[#5ea2ff]" />
              <p className="min-w-0 flex-1 text-[15px] text-[#6aa9ff]">
                {bToA.length === 1
                  ? '1 lead ready to move B to A'
                  : `${bToA.length} leads ready to move B to A`}
              </p>
              <button
                type="button"
                onClick={onInsights}
                className="h-10 rounded-lg border border-[#27456b] bg-[#0f2340] px-4 text-sm"
              >
                Review
              </button>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

function TaskRow({
  task,
  onToggle,
  onDelete,
}: {
  task: Task
  onToggle: () => void
  onDelete: () => void
}) {
  const Icon = task.kind === 'overdue' ? CircleAlert : task.kind === 'waiting' ? Clock : task.kind === 'call' ? Phone : task.kind === 'meeting' ? Calendar : task.kind === 'todo' ? CheckSquare : ListTodo
  const iconColor =
    task.kind === 'overdue'
      ? 'text-[#f07a7a]'
      : task.kind === 'waiting'
        ? 'text-[#e8a93a]'
        : 'text-[#7eb0ff]'

  return (
    <section className={`${card} flex items-center gap-3 px-4 py-3 ${task.done ? 'opacity-55' : ''}`}>
      <Icon size={18} className={`shrink-0 ${iconColor}`} />
      <div className="min-w-0 flex-1">
        <p className={`text-[15px] ${task.done ? 'line-through' : ''}`}>{task.title}</p>
        <p className="text-[13px] text-neutral-400">{task.detail}</p>
      </div>
      <button type="button" onClick={onToggle} className={`${ghost} shrink-0 px-4`}>
        {task.done ? task.doneLabel : task.actionLabel}
      </button>
      <button type="button" aria-label="Delete task" onClick={onDelete} className="text-neutral-500">
        <X size={16} />
      </button>
    </section>
  )
}
