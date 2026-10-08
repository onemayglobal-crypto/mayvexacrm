import { ArrowUpRight, CircleAlert } from 'lucide-react'
import { GradeBadge } from '../components/GradeBadge'
import { rupeesToLakhs } from '../lib/format'
import { card, eyebrow, initials, primaryBtn, stageColor } from '../lib/ui'
import { useCrm } from '../store/CrmContext'
import { GRADE_WEIGHT, GRADES, STAGES } from '../types'

interface InsightsScreenProps {
  onOpenLead: (id: string) => void
  onPipeline: () => void
}

export function InsightsScreen({ onOpenLead, onPipeline }: InsightsScreenProps) {
  const { store, updateLead, weightedPipeline, monthlyAchieved } = useCrm()
  const open = store.leads.filter((lead) => lead.stage !== 'Won' && lead.stage !== 'Lost')
  const won = store.leads.filter((lead) => lead.stage === 'Won')
  const lost = store.leads.filter((lead) => lead.stage === 'Lost')
  const conversion =
    won.length + lost.length === 0
      ? 0
      : Math.round((won.length / (won.length + lost.length)) * 100)

  const bToA = store.leads.filter(
    (lead) =>
      lead.grade === 'B' &&
      lead.meetings >= 2 &&
      !lead.objectionsOpen &&
      lead.stage !== 'Won' &&
      lead.stage !== 'Lost',
  )

  const overdue = store.tasks.filter((task) => !task.done && task.kind === 'overdue')
  const maxStage = Math.max(
    1,
    ...STAGES.map((stage) =>
      store.leads.filter((lead) => lead.stage === stage).reduce((sum, lead) => sum + lead.value, 0),
    ),
  )
  const totalWeighted = Math.max(1, weightedPipeline)

  const promote = (id: string) => {
    const lead = store.leads.find((item) => item.id === id)
    if (!lead) return
    updateLead(id, { grade: 'A', score: Math.min(99, lead.score + 8) })
  }

  return (
    <div className="animate-rise mx-auto max-w-6xl space-y-8">
      <header>
        <p className={eyebrow}>Insights</p>
        <h1 className="mt-1 text-[30px] font-semibold tracking-[-0.03em] text-white">
          What your pipeline is telling you
        </h1>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Open deals" value={String(open.length)} />
        <Stat label="Weighted pipeline" value={rupeesToLakhs(weightedPipeline)} />
        <Stat label="Won this month" value={rupeesToLakhs(monthlyAchieved)} />
        <Stat label="Win rate" value={`${conversion}%`} />
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <section className={`${card} p-6`}>
          <h2 className="mb-5 text-[14px] font-medium text-neutral-200">Value by stage</h2>
          <div className="space-y-4">
            {STAGES.map((stage) => {
              const leads = store.leads.filter((lead) => lead.stage === stage)
              const value = leads.reduce((sum, lead) => sum + lead.value, 0)
              return (
                <div key={stage} className="grid grid-cols-[88px_1fr_56px] items-center gap-3">
                  <span className="flex items-center gap-2 text-[13px] text-neutral-300">
                    <span className="size-1.5 rounded-full" style={{ background: stageColor[stage] }} />
                    {stage}
                    <span className="text-neutral-600">{leads.length}</span>
                  </span>
                  <div className="h-2 overflow-hidden rounded-full bg-white/[0.05]">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.max(2, (value / maxStage) * 100)}%`,
                        background: stageColor[stage],
                        opacity: 0.85,
                      }}
                    />
                  </div>
                  <span className="text-right text-[13px] text-neutral-400">{rupeesToLakhs(value)}</span>
                </div>
              )
            })}
          </div>
        </section>

        <section className={`${card} p-6`}>
          <h2 className="mb-5 text-[14px] font-medium text-neutral-200">Open pipeline by grade</h2>
          <div className="space-y-4">
            {GRADES.map((grade) => {
              const leads = open.filter((lead) => lead.grade === grade)
              const weighted = leads.reduce((sum, lead) => sum + lead.value * GRADE_WEIGHT[lead.grade], 0)
              return (
                <div key={grade} className="flex items-center gap-3">
                  <GradeBadge grade={grade} />
                  <div className="flex-1">
                    <div className="flex justify-between text-[13px]">
                      <span className="text-neutral-400">{leads.length} leads</span>
                      <span className="text-neutral-200">{rupeesToLakhs(weighted)}</span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
                      <div
                        className="h-full rounded-full bg-[#7c5cff]"
                        style={{ width: `${Math.max(2, (weighted / totalWeighted) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </div>

      <section className={`${card} p-6`}>
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="flex size-9 items-center justify-center rounded-xl bg-[#34d399]/10 text-[#34d399]">
              <ArrowUpRight size={17} />
            </span>
            <div>
              <h2 className="text-[15px] font-medium text-white">Ready to move from B to A</h2>
              <p className="text-[13px] text-neutral-500">Two or more meetings and no open objection.</p>
            </div>
          </div>
          <button type="button" onClick={onPipeline} className="text-[13px] text-[#a594ff] hover:text-white">
            Open pipeline
          </button>
        </div>
        <div className="divide-y divide-white/[0.05]">
          {bToA.map((lead) => (
            <div key={lead.id} className="flex items-center gap-3 py-3">
              <span className="flex size-9 items-center justify-center rounded-xl bg-white/[0.06] text-[12px] font-semibold text-neutral-200">
                {initials(lead.name)}
              </span>
              <button type="button" onClick={() => onOpenLead(lead.id)} className="min-w-0 flex-1 text-left">
                <p className="truncate text-[14px] font-medium text-neutral-100 hover:underline">{lead.name}</p>
                <p className="truncate text-[12px] text-neutral-500">
                  {lead.company} · {lead.meetings} meetings · {rupeesToLakhs(lead.value)}
                </p>
              </button>
              <button type="button" onClick={() => promote(lead.id)} className={`${primaryBtn} h-9`}>
                Promote to A
              </button>
            </div>
          ))}
          {bToA.length === 0 && <p className="py-4 text-[13px] text-neutral-500">No B leads qualify right now.</p>}
        </div>
      </section>

      {overdue.length > 0 && (
        <section className="rounded-2xl border border-[#f87171]/20 bg-[#f87171]/[0.04] p-6">
          <h2 className="mb-3 flex items-center gap-2 text-[14px] font-medium text-[#fca5a5]">
            <CircleAlert size={16} /> Overdue promises
          </h2>
          <ul className="space-y-1.5 text-[13px] text-neutral-300">
            {overdue.map((task) => (
              <li key={task.id}>{task.title}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className={`${card} p-5`}>
      <p className="text-[13px] text-neutral-400">{label}</p>
      <p className="mt-2 text-[28px] font-semibold tracking-tight text-white">{value}</p>
    </div>
  )
}
