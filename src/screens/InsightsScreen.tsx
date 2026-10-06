import { GradeBadge } from '../components/GradeBadge'
import { rupeesToLakhs } from '../lib/format'
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

  const promote = (id: string) => {
    const lead = store.leads.find((item) => item.id === id)
    if (!lead) return
    updateLead(id, { grade: 'A', score: Math.min(99, lead.score + 8) })
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm text-neutral-400">Insights</p>
        <h1 className="text-3xl font-medium">What the pipeline is telling you</h1>
      </header>

      <section className="grid gap-4 md:grid-cols-4">
        <Stat label="Open deals" value={String(open.length)} />
        <Stat label="Weighted pipeline" value={rupeesToLakhs(weightedPipeline)} />
        <Stat label="Won this month" value={rupeesToLakhs(monthlyAchieved)} />
        <Stat label="Win rate" value={`${conversion}%`} />
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        <section className="rounded-2xl border border-[#262628] bg-[#1b1b1d] p-5">
          <h2 className="mb-4 text-sm text-neutral-400">Value by stage</h2>
          <div className="space-y-3">
            {STAGES.map((stage) => {
              const leads = store.leads.filter((lead) => lead.stage === stage)
              const value = leads.reduce((sum, lead) => sum + lead.value, 0)
              return (
                <div key={stage}>
                  <div className="mb-1 flex justify-between text-xs text-neutral-400">
                    <span>
                      {stage} · {leads.length}
                    </span>
                    <span>{rupeesToLakhs(value)}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[#2a2a2c]">
                    <div
                      className="h-full rounded-full bg-[#2f7ef0]"
                      style={{ width: `${Math.max(4, (value / maxStage) * 100)}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-[#262628] bg-[#1b1b1d] p-5">
          <h2 className="mb-4 text-sm text-neutral-400">Open pipeline by grade</h2>
          <div className="space-y-3">
            {GRADES.map((grade) => {
              const leads = open.filter((lead) => lead.grade === grade)
              const weighted = leads.reduce(
                (sum, lead) => sum + lead.value * GRADE_WEIGHT[lead.grade],
                0,
              )
              return (
                <div
                  key={grade}
                  className="flex items-center justify-between rounded-xl border border-[#2a2a2c] px-3 py-3"
                >
                  <div className="flex items-center gap-3">
                    <GradeBadge grade={grade} />
                    <span className="text-sm text-neutral-300">{leads.length} leads</span>
                  </div>
                  <span className="text-sm">{rupeesToLakhs(weighted)} weighted</span>
                </div>
              )
            })}
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-[#2d63b8] bg-[#191b20] p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium">Ready to move B → A</h2>
            <p className="text-sm text-neutral-400">
              Two or more meetings, no open objection. Promote updates grade immediately.
            </p>
          </div>
          <button type="button" onClick={onPipeline} className="text-sm text-[#7eb0ff]">
            Open pipeline
          </button>
        </div>
        <div className="space-y-2">
          {bToA.map((lead) => (
            <div
              key={lead.id}
              className="flex items-center gap-3 rounded-xl border border-[#27456b] bg-[#14181f] px-4 py-3"
            >
              <button
                type="button"
                onClick={() => onOpenLead(lead.id)}
                className="min-w-0 flex-1 text-left"
              >
                <p className="font-medium">{lead.name}</p>
                <p className="text-xs text-neutral-400">
                  {lead.company} · {lead.meetings} meetings · {rupeesToLakhs(lead.value)}
                </p>
              </button>
              <button
                type="button"
                onClick={() => promote(lead.id)}
                className="h-10 rounded-lg bg-[#2f7ef0] px-4 text-sm text-white"
              >
                Promote to A
              </button>
            </div>
          ))}
          {bToA.length === 0 && (
            <p className="text-sm text-neutral-500">No B leads currently qualify.</p>
          )}
        </div>
      </section>

      {overdue.length > 0 && (
        <section className="rounded-2xl border border-[#5a2428] bg-[#1b1516] p-5">
          <h2 className="mb-2 text-sm text-[#f07a7a]">Overdue promises</h2>
          <ul className="space-y-1 text-sm text-neutral-300">
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
    <div className="rounded-2xl border border-[#262628] bg-[#1b1b1d] p-5">
      <p className="text-sm text-neutral-400">{label}</p>
      <p className="mt-1 text-2xl font-medium">{value}</p>
    </div>
  )
}
