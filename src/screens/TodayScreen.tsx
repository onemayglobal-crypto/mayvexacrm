import { useState } from 'react'
import {
  ArrowRight,
  ArrowUpRight,
  Calendar,
  Check,
  CircleAlert,
  Clock,
  Flame,
  ListTodo,
  MessageCircle,
  Pencil,
  Phone,
  Plus,
  X,
} from 'lucide-react'
import { GradeBadge } from '../components/GradeBadge'
import { daysFrom, rupeesToLakhs } from '../lib/format'
import { card, eyebrow, field, ghostBtn, iconBtn, initials, primaryBtn } from '../lib/ui'
import { useCrm } from '../store/CrmContext'
import type { Task } from '../types'

function formatToday(date: Date) {
  return date.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
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
  const [taskTitle, setTaskTitle] = useState('')
  const [showDone, setShowDone] = useState(false)

  const percent = store.settings.monthlyGoal
    ? Math.min(100, Math.round((monthlyAchieved / store.settings.monthlyGoal) * 100))
    : 0
  const onTrack = monthlyAchieved >= store.settings.monthlyGoal * (now.getDate() / 30)

  const openLeads = store.leads.filter((lead) => lead.stage !== 'Won' && lead.stage !== 'Lost')
  const priority = [...openLeads].sort((a, b) => b.score - a.score)[0]

  const bToA = store.leads.filter(
    (lead) => lead.grade === 'B' && lead.meetings >= 2 && !lead.objectionsOpen && lead.stage !== 'Won',
  )

  const openTasks = store.tasks.filter((task) => !task.done)
  const doneTasks = store.tasks.filter((task) => task.done)

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
      kind: 'todo',
      title: taskTitle.trim(),
      detail: 'Added from Today',
      actionLabel: 'Done',
      doneLabel: 'Undo',
      done: false,
      dueDate: new Date().toISOString(),
    })
    setTaskTitle('')
  }

  return (
    <div className="animate-rise mx-auto max-w-6xl space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[14px] text-neutral-500">{formatToday(now)}</p>
          <h1 className="mt-1 text-[34px] font-semibold tracking-[-0.03em] text-white">{greeting(now)}</h1>
          <p className="mt-1 text-[15px] text-neutral-400">
            {openTasks.length === 0
              ? 'Your list is clear. A good day to find new leads.'
              : `${openTasks.length} task${openTasks.length === 1 ? '' : 's'} waiting for you today.`}
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#f97316]/20 bg-[#f97316]/10 px-3 py-1.5 text-[13px] font-medium text-[#fdba74]">
          <Flame size={14} /> {store.settings.streakDays}-day streak
        </span>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <div className={`${card} group p-5`}>
          <div className="flex items-center justify-between">
            <p className="text-[13px] text-neutral-400">Monthly goal</p>
            <button
              type="button"
              onClick={() => {
                setGoalDraft(String(store.settings.monthlyGoal / 100000))
                setEditingGoal((open) => !open)
              }}
              className="text-neutral-600 opacity-0 transition-opacity group-hover:opacity-100 hover:text-white"
              aria-label="Edit monthly goal"
            >
              <Pencil size={14} />
            </button>
          </div>
          {editingGoal ? (
            <form
              className="mt-3 flex items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault()
                saveGoal()
              }}
            >
              <div className="relative flex-1">
                <span className="absolute top-1/2 left-3 -translate-y-1/2 text-neutral-500">₹</span>
                <input
                  autoFocus
                  className={`${field} h-10 pr-8 pl-7`}
                  value={goalDraft}
                  onChange={(e) => setGoalDraft(e.target.value)}
                />
                <span className="absolute top-1/2 right-3 -translate-y-1/2 text-neutral-500">L</span>
              </div>
              <button type="submit" className={`${primaryBtn} px-3`}>
                Save
              </button>
            </form>
          ) : (
            <>
              <p className="mt-2 text-[28px] font-semibold tracking-tight text-white">
                {rupeesToLakhs(monthlyAchieved)}
                <span className="text-[16px] font-normal text-neutral-500">
                  {' '}
                  / {rupeesToLakhs(store.settings.monthlyGoal)}
                </span>
              </p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full bg-[#7c5cff] shadow-[0_0_12px_rgba(124,92,255,0.6)]"
                  style={{ width: `${Math.max(3, percent)}%` }}
                />
              </div>
              <p className={`mt-2 text-[12px] ${onTrack ? 'text-[#4ade80]' : 'text-[#fbbf24]'}`}>
                {percent}% · {onTrack ? 'On track' : 'Behind pace'}
              </p>
            </>
          )}
        </div>
        <Metric
          label="Weighted pipeline"
          value={rupeesToLakhs(weightedPipeline)}
          hint={`${openLeads.length} open deals`}
        />
        <Metric
          label="Meetings this week"
          value={String(meetingsThisWeek)}
          hint="Leads contacted since Monday"
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr]">
        <div className="space-y-4">
          <h2 className={eyebrow}>Focus</h2>
          {priority ? (
            <section className="relative overflow-hidden rounded-3xl border border-[#7c5cff]/25 bg-gradient-to-br from-[#121a33] via-[#0e1220] to-[#0b0d14] p-6">
              <div className="pointer-events-none absolute -top-24 -right-24 size-64 rounded-full bg-[#7c5cff]/15 blur-3xl" />
              <div className="relative flex items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-2xl bg-white/[0.08] text-[14px] font-semibold text-white">
                  {initials(priority.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => onOpenLead(priority.id)}
                    className="truncate text-[17px] font-medium text-white hover:underline"
                  >
                    {priority.name}
                  </button>
                  <p className="truncate text-[13px] text-neutral-400">{priority.company || 'No company'}</p>
                </div>
                <GradeBadge grade={priority.grade} />
              </div>
              <p className="relative mt-6 text-[12px] font-medium tracking-[0.14em] text-[#a594ff] uppercase">
                Your #1 move today
              </p>
              <h3 className="relative mt-1.5 text-[22px] font-semibold tracking-tight text-white">
                {priority.nextAction || 'Follow up'}
              </h3>
              {reason && (
                <p className="relative mt-2 line-clamp-2 text-[14px] leading-relaxed text-neutral-400">{reason}</p>
              )}
              <div className="relative mt-6 flex flex-wrap gap-2">
                {priority.phone && (
                  <a href={`tel:${priority.phone}`} className={primaryBtn}>
                    <Phone size={15} /> Call
                  </a>
                )}
                {priority.phone && (
                  <a
                    href={`https://wa.me/${priority.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${priority.name.split(' ')[0]}, `)}`}
                    target="_blank"
                    rel="noreferrer"
                    className={ghostBtn}
                  >
                    <MessageCircle size={15} /> WhatsApp
                  </a>
                )}
                <button type="button" onClick={() => onOpenLead(priority.id)} className={ghostBtn}>
                  View lead <ArrowRight size={15} />
                </button>
              </div>
            </section>
          ) : (
            <section className={`${card} p-8 text-center text-[14px] text-neutral-500`}>
              No open leads yet. Press <span className="text-neutral-300">+ New</span> to add your first one.
            </section>
          )}

          {bToA.length > 0 && (
            <button
              type="button"
              onClick={onInsights}
              className={`${card} flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:border-white/[0.12]`}
            >
              <span className="flex size-9 items-center justify-center rounded-xl bg-[#34d399]/10 text-[#34d399]">
                <ArrowUpRight size={17} />
              </span>
              <span className="flex-1 text-[14px] text-neutral-300">
                {bToA.length === 1 ? '1 lead is' : `${bToA.length} leads are`} ready to move from B to A
              </span>
              <span className="text-[13px] text-[#a594ff]">Review</span>
            </button>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-baseline justify-between">
            <h2 className={eyebrow}>Tasks</h2>
            <span className="text-[12px] text-neutral-500">{openTasks.length} open</span>
          </div>
          <section className={`${card} p-2`}>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                submitTask()
              }}
              className="flex items-center gap-2 border-b border-white/[0.05] px-3 pb-2"
            >
              <Plus size={16} className="shrink-0 text-neutral-500" />
              <input
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="Add a task and press Enter"
                className="h-11 flex-1 bg-transparent text-[14px] text-neutral-100 outline-none placeholder:text-neutral-600"
              />
              {taskTitle.trim() && (
                <button type="submit" className="text-[13px] font-medium text-[#a594ff]">
                  Add
                </button>
              )}
            </form>
            <ul className="py-1">
              {openTasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  onToggle={() => toggleTask(task.id)}
                  onDelete={() => deleteTask(task.id)}
                />
              ))}
              {openTasks.length === 0 && (
                <li className="px-3 py-8 text-center text-[13px] text-neutral-500">Nothing left. Nice work.</li>
              )}
            </ul>
            {doneTasks.length > 0 && (
              <div className="border-t border-white/[0.05] pt-1">
                <button
                  type="button"
                  onClick={() => setShowDone((open) => !open)}
                  className="w-full px-3 py-2.5 text-left text-[12px] text-neutral-500 hover:text-neutral-300"
                >
                  {showDone ? 'Hide' : 'Show'} {doneTasks.length} completed
                </button>
                {showDone && (
                  <ul className="pb-1">
                    {doneTasks.map((task) => (
                      <TaskRow
                        key={task.id}
                        task={task}
                        onToggle={() => toggleTask(task.id)}
                        onDelete={() => deleteTask(task.id)}
                      />
                    ))}
                  </ul>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

function Metric({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className={`${card} p-5`}>
      <p className="text-[13px] text-neutral-400">{label}</p>
      <p className="mt-2 text-[28px] font-semibold tracking-tight text-white">{value}</p>
      <p className="mt-2 text-[12px] text-neutral-500">{hint}</p>
    </div>
  )
}

const kindMeta: Record<Task['kind'], { icon: typeof Phone; color: string }> = {
  overdue: { icon: CircleAlert, color: 'text-[#f87171]' },
  waiting: { icon: Clock, color: 'text-[#fbbf24]' },
  call: { icon: Phone, color: 'text-[#38bdf8]' },
  meeting: { icon: Calendar, color: 'text-[#a78bfa]' },
  followup: { icon: ListTodo, color: 'text-[#a594ff]' },
  todo: { icon: ListTodo, color: 'text-neutral-400' },
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
  const { icon: Icon, color } = kindMeta[task.kind]

  return (
    <li className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-white/[0.03]">
      <button
        type="button"
        onClick={onToggle}
        aria-label={task.done ? 'Mark as not done' : 'Mark as done'}
        className={`flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
          task.done
            ? 'border-transparent bg-[#7c5cff] text-white'
            : 'border-white/20 text-transparent hover:border-[#a594ff] hover:text-[#a594ff]'
        }`}
      >
        <Check size={12} strokeWidth={3} />
      </button>
      <div className="min-w-0 flex-1">
        <p className={`truncate text-[14px] ${task.done ? 'text-neutral-500 line-through' : 'text-neutral-100'}`}>
          {task.title}
        </p>
        <p className="mt-0.5 flex items-center gap-1.5 truncate text-[12px] text-neutral-500">
          <Icon size={12} className={`shrink-0 ${color}`} />
          {task.detail}
        </p>
      </div>
      <button
        type="button"
        aria-label="Delete task"
        onClick={onDelete}
        className={`${iconBtn} size-7 opacity-0 group-hover:opacity-100`}
      >
        <X size={14} />
      </button>
    </li>
  )
}
