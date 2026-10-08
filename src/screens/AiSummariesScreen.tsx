import { useMemo, useState } from 'react'
import {
  ArrowRight,
  Bot,
  Brain,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  Flame,
  MessageCircle,
  Play,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Terminal,
  TrendingUp,
  Workflow,
} from 'lucide-react'
import { GradeBadge } from '../components/GradeBadge'
import { TypeTag } from '../components/TypeTag'
import { rupeesToLakhs } from '../lib/format'
import { analyzeLeadWithAi, generateExecutiveAiBriefing } from '../lib/aiScoring'
import { card, eyebrow, primaryBtn, stageColor } from '../lib/ui'
import { useCrm } from '../store/CrmContext'
import { inferLeadType } from '../types'

interface AiSummariesScreenProps {
  onOpenLead: (id: string) => void
  onPipeline: () => void
  onCommandMode?: () => void
}

export function AiSummariesScreen({ onOpenLead, onPipeline, onCommandMode }: AiSummariesScreenProps) {
  const { store } = useCrm()
  const [selectedLeadId, setSelectedLeadId] = useState<string>(() => {
    const top = store.leads.find((l) => l.stage === 'Decision' || l.stage === 'Proposal')
    return top ? top.id : store.leads[0]?.id || ''
  })
  const [viewFilter, setViewFilter] = useState<'all' | 'high_intent' | 'at_risk' | 'quotation_ready'>('all')
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [simulatingStep, setSimulatingStep] = useState(false)
  const [simulatedOverrides, setSimulatedOverrides] = useState<Record<string, number>>({})

  // Compute analyses for all leads
  const analyses = useMemo(() => {
    return store.leads.map((l) => analyzeLeadWithAi(l))
  }, [store.leads])

  const briefing = useMemo(() => {
    return generateExecutiveAiBriefing(store.leads)
  }, [store.leads])

  const selectedLead = store.leads.find((l) => l.id === selectedLeadId) || store.leads[0]
  const selectedAnalysis = useMemo(() => {
    if (!selectedLead) return null
    return analyzeLeadWithAi(selectedLead)
  }, [selectedLead])

  // Filtered leads list
  const filteredAnalyses = useMemo(() => {
    return analyses.filter((a) => {
      const lead = store.leads.find((l) => l.id === a.leadId)
      if (!lead) return false
      if (viewFilter === 'high_intent') return a.intentLevel === 'Very High' || a.intentLevel === 'High'
      if (viewFilter === 'at_risk') return a.velocity === 'At Risk'
      if (viewFilter === 'quotation_ready') return ['Proposal', 'Decision', 'Won'].includes(lead.stage)
      return true
    })
  }, [analyses, store.leads, viewFilter])

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard?.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  // Trigger simulated autonomous agent progression
  const triggerAutonomousStep = () => {
    if (!selectedLead) return
    setSimulatingStep(true)
    setTimeout(() => {
      setSimulatingStep(false)
      const currentStep = simulatedOverrides[selectedLead.id] || 6
      setSimulatedOverrides((prev) => ({
        ...prev,
        [selectedLead.id]: Math.min(12, currentStep + 1),
      }))
    }, 700)
  }

  return (
    <div className="animate-rise mx-auto max-w-6xl space-y-10 pb-12">
      {/* Hero: MayVexa Autonomous Vision */}
      <header className="relative overflow-hidden rounded-3xl border border-[#7c5cff]/20 bg-gradient-to-br from-[#121124] via-[#0b0c14] to-[#08090f] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <div className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-[#7c5cff]/15 blur-3xl" />
        <div className="relative flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-[#7c5cff]/20 text-[#a594ff]">
                <Sparkles size={16} />
              </span>
              <p className="text-[12px] font-semibold tracking-[0.2em] text-[#a594ff] uppercase">
                Agentic Workflow Engine
              </p>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#34d399]/25 bg-[#34d399]/10 px-2.5 py-0.5 text-[11px] font-medium text-[#6ee7b7]">
                <span className="size-1.5 animate-pulse rounded-full bg-[#34d399]" />
                Autonomous Active
              </span>
            </div>
            <h1 className="mt-3 text-[32px] font-bold tracking-tight text-white">
              AI Lead Scoring & Autonomous Summaries
            </h1>
            <p className="mt-2 text-[15px] leading-relaxed text-neutral-300">
              Enterprise CRM is shifting from static chatbots to <strong>autonomous agentic workflows</strong>.
              While traditional CRMs depend on manual handoffs, MayVexa agents continuously qualify, research,
              predict probabilities, draft outreach, and prepare outcome reports.
            </p>
          </div>

          <div className="flex flex-col items-start gap-3 sm:items-end">
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 text-left sm:text-right backdrop-blur-md">
              <p className="text-[11px] text-neutral-400 uppercase tracking-wider">Monitored Portfolio</p>
              <p className="text-[28px] font-bold text-white tracking-tight">{store.leads.length} Deals</p>
              <p className="text-[12px] text-[#a594ff]">
                {briefing.autonomousActionsToday} autonomous runs today
              </p>
            </div>
            <button
              onClick={onPipeline}
              className="inline-flex items-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.04] px-3.5 py-2 text-[12px] font-medium text-neutral-200 transition hover:bg-white/[0.08] hover:text-white"
            >
              <span>View Pipeline Board</span>
              <ArrowRight size={14} className="text-[#a594ff]" />
            </button>
          </div>
        </div>

        {/* Live Metrics Row */}
        <div className="relative mt-8 grid gap-4 border-t border-white/[0.06] pt-6 sm:grid-cols-2 lg:grid-cols-4">
          <MetricTile
            label="High-Intent Deals"
            value={String(briefing.highIntentDeals)}
            sub="Win probability &gt; 70%"
            icon={<Flame size={16} className="text-[#fbbf24]" />}
          />
          <MetricTile
            label="Projected AI Close"
            value={rupeesToLakhs(briefing.projectedRevenue)}
            sub="Monte-Carlo simulated revenue"
            icon={<TrendingUp size={16} className="text-[#34d399]" />}
          />
          <MetricTile
            label="Deals At Risk"
            value={String(briefing.riskDealsCount)}
            sub="Stale contact or active objection"
            icon={<ShieldAlert size={16} className="text-[#f87171]" />}
          />
          <MetricTile
            label="Deloitte Enterprise Paradigm"
            value="Autonomous"
            sub="Outcome-aligned execution"
            icon={<Workflow size={16} className="text-[#38bdf8]" />}
          />
        </div>
      </header>

      {/* Signature Feature Callout: Command Mode */}
      {onCommandMode && (
        <section className="relative overflow-hidden rounded-3xl border border-[#7c5cff]/30 bg-gradient-to-r from-[#17142b] via-[#0f101d] to-[#0d0e1a] p-6 shadow-[0_10px_35px_rgba(0,0,0,0.4)]">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#7c5cff]/20 text-[#a594ff] shadow-[0_0_20px_rgba(124,92,255,0.4)]">
                <Terminal size={24} />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-[#7c5cff]/20 px-2.5 py-0.5 text-[11px] font-bold text-[#c4b5fd] uppercase tracking-wider">
                    The Killer Feature
                  </span>
                  <span className="text-[12px] text-[#34d399] font-medium">Outcome Execution Engine</span>
                </div>
                <h3 className="mt-1 text-[18px] font-bold text-white">
                  Command Mode: “Don’t tell me what to do. Do it.”
                </h3>
                <p className="mt-1 max-w-2xl text-[13px] text-neutral-300">
                  Type directives like: <em>“Find all leads uncontacted &gt; 5 days with ₹10L+ potential, research decision makers &amp; prepare personalized outreach.”</em> MayVexa executes the workflow with enterprise permissions &amp; audit trails.
                </p>
              </div>
            </div>

            <button
              onClick={onCommandMode}
              className="inline-flex items-center gap-2 rounded-xl bg-[#7c5cff] px-4 py-2.5 text-[13px] font-semibold text-white shadow-[0_8px_20px_rgba(124,92,255,0.4)] transition-all hover:bg-[#8b6dff] active:scale-95"
            >
              <span>Launch Command Mode</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </section>
      )}

      {/* The 12-Step Agentic Workflow Architecture vs Traditional CRM */}
      <section className={`${card} overflow-hidden p-7`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Workflow size={18} className="text-[#7c5cff]" />
              <h2 className="text-[18px] font-semibold text-white">
                How MayVexa Replaces Traditional CRM Handoffs
              </h2>
            </div>
            <p className="mt-1 text-[13px] text-neutral-400">
              The end-to-end 12-step autonomous loop executed by specialized MayVexa agents.
            </p>
          </div>
          <span className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-[12px] text-neutral-300">
            Autonomous Cycle Time: <strong className="text-white">~3.2 minutes</strong>
          </span>
        </div>

        {/* Workflow comparison banner */}
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/[0.06] bg-[#0c0d14] p-4">
            <p className="text-[11px] font-semibold tracking-wider text-neutral-500 uppercase">
              Traditional CRM (Manual &amp; Fragile)
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[12px] text-neutral-400">
              <span className="rounded-md bg-white/[0.05] px-2 py-1">Lead</span>
              <span>→</span>
              <span className="rounded-md bg-white/[0.05] px-2 py-1">Salesperson</span>
              <span>→</span>
              <span className="rounded-md bg-white/[0.05] px-2 py-1">Follow-up</span>
              <span>→</span>
              <span className="rounded-md bg-white/[0.05] px-2 py-1">Quotation</span>
              <span>→</span>
              <span className="rounded-md bg-white/[0.05] px-2 py-1">Reminder</span>
              <span>→</span>
              <span className="rounded-md bg-white/[0.05] px-2 py-1">Closing</span>
            </div>
            <p className="mt-3 text-[12px] text-neutral-500">
              Human delays at every hop. Quotations lag by days; scoring is guesswork.
            </p>
          </div>

          <div className="rounded-2xl border border-[#7c5cff]/30 bg-[#7c5cff]/[0.05] p-4">
            <p className="flex items-center justify-between text-[11px] font-semibold tracking-wider text-[#a594ff] uppercase">
              <span>MayVexa (Autonomous &amp; Outcome-Driven)</span>
              <span className="text-[#34d399] font-normal">Self-executing</span>
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-1 text-[11px] font-medium text-neutral-200">
              {[
                'Lead enters',
                'AI qualifies',
                'Researches',
                'Scores',
                'Drafts message',
                'Schedules',
                'Updates CRM',
                'Predicts prob',
                'Alerts',
                'Prepares quote',
                'Follows up',
                'Reports outcome',
              ].map((step, idx) => (
                <span key={step} className="inline-flex items-center">
                  <span className="rounded-md border border-[#7c5cff]/20 bg-[#7c5cff]/15 px-2 py-0.5 text-white">
                    {idx + 1}. {step}
                  </span>
                  {idx < 11 && <span className="mx-1 text-[#7c5cff]">→</span>}
                </span>
              ))}
            </div>
            <p className="mt-3 text-[12px] text-neutral-300">
              Autonomous execution from ingestion to deal outcome report.
            </p>
          </div>
        </div>

        {/* Lead Selector for Workflow Inspection */}
        <div className="mt-8 border-t border-white/[0.06] pt-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className={eyebrow}>Live Agent Execution Trace</p>
              <h3 className="mt-1 text-[16px] font-semibold text-white">
                Inspect Active 12-Step Chain for:
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {store.leads.slice(0, 6).map((lead) => {
                const active = lead.id === selectedLeadId
                return (
                  <button
                    key={lead.id}
                    type="button"
                    onClick={() => setSelectedLeadId(lead.id)}
                    className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-[13px] font-medium transition-all ${
                      active
                        ? 'border-[#7c5cff] bg-[#7c5cff]/15 text-white shadow-[0_0_15px_rgba(124,92,255,0.25)]'
                        : 'border-white/[0.06] bg-white/[0.02] text-neutral-400 hover:border-white/[0.14] hover:text-neutral-200'
                    }`}
                  >
                    <span>{lead.name}</span>
                    <GradeBadge grade={lead.grade} />
                  </button>
                )
              })}
            </div>
          </div>

          {selectedAnalysis && (
            <div className="mt-6 rounded-2xl border border-white/[0.06] bg-[#0b0c14] p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.05] pb-4">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-[#7c5cff]/15 text-[#a594ff]">
                    <Bot size={20} />
                  </span>
                  <div>
                    <h4 className="text-[16px] font-semibold text-white">
                      {selectedLead.name} · {selectedLead.company}
                    </h4>
                    <p className="text-[12px] text-neutral-400">
                      Current Stage: <strong className="text-neutral-200">{selectedLead.stage}</strong> ·
                      Value: <strong className="text-neutral-200">{rupeesToLakhs(selectedLead.value)}</strong> ·
                      AI Score: <strong className="text-[#a594ff]">{selectedAnalysis.aiScore}/100</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={triggerAutonomousStep}
                    disabled={simulatingStep}
                    className={`${primaryBtn} h-9 text-[13px]`}
                  >
                    {simulatingStep ? (
                      <>
                        <RefreshCw size={13} className="animate-spin" /> Simulating Agent...
                      </>
                    ) : (
                      <>
                        <Play size={13} /> Run Autonomous Step
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenLead(selectedLead.id)}
                    className="flex h-9 items-center gap-1.5 rounded-xl border border-white/[0.08] px-3 text-[13px] text-neutral-300 hover:text-white"
                  >
                    Edit Record <ArrowRight size={13} />
                  </button>
                </div>
              </div>

              {/* 12-Step Live Chain Timeline */}
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {selectedAnalysis.workflowSteps.map((step) => {
                  const overrideLevel = simulatedOverrides[selectedLead.id] || 0
                  const isCompleted = step.id <= Math.max(step.status === 'completed' ? step.id : 0, overrideLevel)
                  const isInProgress = !isCompleted && (step.status === 'in_progress' || step.id === overrideLevel + 1)

                  return (
                    <div
                      key={step.id}
                      className={`relative flex flex-col justify-between rounded-xl border p-3.5 transition-all ${
                        isCompleted
                          ? 'border-[#34d399]/25 bg-[#34d399]/[0.03]'
                          : isInProgress
                          ? 'border-[#7c5cff]/40 bg-[#7c5cff]/[0.08] ring-1 ring-[#7c5cff]/30'
                          : 'border-white/[0.05] bg-white/[0.015] opacity-60'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-neutral-500">STEP {step.id}</span>
                          <span
                            className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-medium ${
                              isCompleted
                                ? 'bg-[#34d399]/15 text-[#6ee7b7]'
                                : isInProgress
                                ? 'bg-[#7c5cff]/20 text-[#c4b5fd]'
                                : 'bg-white/[0.05] text-neutral-400'
                            }`}
                          >
                            {isCompleted ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                            {isCompleted ? 'Done' : isInProgress ? 'Active' : 'Queued'}
                          </span>
                        </div>
                        <p className="mt-1.5 text-[13px] font-semibold text-white">{step.title}</p>
                        <p className="text-[11px] text-[#a594ff] font-medium">{step.actor}</p>
                        <p className="mt-1.5 text-[12px] leading-relaxed text-neutral-300">{step.detail}</p>
                      </div>
                      <p className="mt-3 text-[10px] text-neutral-500">{step.timestamp}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Executive AI Briefing Digest */}
      <section className={`${card} p-7`}>
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.06] pb-5">
          <div>
            <div className="flex items-center gap-2">
              <Brain size={18} className="text-[#a594ff]" />
              <h2 className="text-[18px] font-semibold text-white">Executive AI Briefing &amp; Digest</h2>
            </div>
            <p className="mt-1 text-[13px] text-neutral-400">{briefing.headline}</p>
          </div>
          <span className="rounded-lg bg-white/[0.04] px-2.5 py-1 text-[12px] text-neutral-400">
            Generated {briefing.generatedAt}
          </span>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {briefing.bulletPoints.map((item, idx) => {
            const isOpp = item.type === 'opportunity'
            const isRisk = item.type === 'risk'
            return (
              <div
                key={idx}
                className={`rounded-2xl border p-4 transition-all ${
                  isOpp
                    ? 'border-[#34d399]/25 bg-[#34d399]/[0.03]'
                    : isRisk
                    ? 'border-[#f87171]/25 bg-[#f87171]/[0.03]'
                    : 'border-white/[0.06] bg-white/[0.02]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p
                      className={`text-[11px] font-semibold tracking-wider uppercase ${
                        isOpp ? 'text-[#34d399]' : isRisk ? 'text-[#f87171]' : 'text-[#a594ff]'
                      }`}
                    >
                      {item.type}
                    </p>
                    <h4 className="mt-1 text-[14px] font-semibold text-white">{item.title}</h4>
                    <p className="mt-1 text-[13px] leading-relaxed text-neutral-300">{item.description}</p>
                  </div>
                  {item.leadId && (
                    <button
                      type="button"
                      onClick={() => onOpenLead(item.leadId!)}
                      className="shrink-0 rounded-lg border border-white/[0.08] bg-white/[0.04] p-1.5 text-neutral-400 hover:text-white"
                      title="Inspect deal"
                    >
                      <ArrowRight size={14} />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* AI Lead Scoring & Deal Intelligence Cards */}
      <section className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className={eyebrow}>Explainable AI Scoring Engine</p>
            <h2 className="mt-1 text-[24px] font-semibold text-white">Deal Summaries &amp; Scores</h2>
            <p className="text-[14px] text-neutral-400">
              Multi-factor scoring breakdown, company research, and auto-generated output drafts.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: `All Deals (${analyses.length})` },
              { id: 'high_intent', label: `High Win Prob (${briefing.highIntentDeals})` },
              { id: 'at_risk', label: `At Risk (${briefing.riskDealsCount})` },
              { id: 'quotation_ready', label: 'Quotation Ready' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setViewFilter(tab.id as typeof viewFilter)}
                className={`rounded-xl border px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
                  viewFilter === tab.id
                    ? 'border-[#7c5cff] bg-[#7c5cff]/20 text-white'
                    : 'border-white/[0.08] bg-white/[0.02] text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Lead Intelligence Grid */}
        <div className="space-y-6">
          {filteredAnalyses.map((analysis) => {
            const lead = store.leads.find((l) => l.id === analysis.leadId)
            if (!lead) return null

            return (
              <article
                key={lead.id}
                className={`${card} overflow-hidden transition-all hover:border-white/[0.12]`}
              >
                {/* Header bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.06] bg-white/[0.015] px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className="flex size-10 items-center justify-center rounded-xl bg-white/[0.06] text-[14px] font-bold text-white">
                      {lead.name
                        .split(' ')
                        .map((p) => p[0])
                        .slice(0, 2)
                        .join('')}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-[17px] font-semibold text-white">{lead.name}</h3>
                        <GradeBadge grade={lead.grade} />
                        <TypeTag type={inferLeadType(lead)} />
                        <span
                          className="size-2 rounded-full"
                          style={{ background: stageColor[lead.stage] }}
                          title={`Stage: ${lead.stage}`}
                        />
                      </div>
                      <p className="text-[13px] text-neutral-400">
                        {lead.company} · {rupeesToLakhs(lead.value)} · Stage: {lead.stage}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 rounded-xl border border-[#7c5cff]/30 bg-[#7c5cff]/10 px-3 py-1.5">
                      <Sparkles size={14} className="text-[#a594ff]" />
                      <div className="text-right">
                        <p className="text-[10px] text-neutral-400 uppercase">AI Score</p>
                        <p className="text-[16px] font-bold text-white leading-none">
                          {analysis.aiScore}<span className="text-[11px] font-normal text-neutral-400">/100</span>
                        </p>
                      </div>
                    </div>

                    <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-right">
                      <p className="text-[10px] text-neutral-400 uppercase">Win Probability</p>
                      <p
                        className={`text-[16px] font-bold leading-none ${
                          analysis.winProbability >= 70
                            ? 'text-[#34d399]'
                            : analysis.winProbability >= 50
                            ? 'text-[#fbbf24]'
                            : 'text-[#f87171]'
                        }`}
                      >
                        {analysis.winProbability}%
                      </p>
                    </div>

                    <span
                      className={`rounded-lg px-2.5 py-1 text-[12px] font-medium ${
                        analysis.intentLevel === 'Very High'
                          ? 'bg-[#34d399]/15 text-[#6ee7b7]'
                          : analysis.intentLevel === 'High'
                          ? 'bg-[#38bdf8]/15 text-[#7dd3fc]'
                          : 'bg-[#fbbf24]/15 text-[#fcd34d]'
                      }`}
                    >
                      {analysis.intentLevel} Intent
                    </span>

                    <button
                      type="button"
                      onClick={() => onOpenLead(lead.id)}
                      className="rounded-xl border border-white/[0.08] bg-white/[0.02] px-3 py-1.5 text-[13px] text-neutral-300 hover:text-white"
                    >
                      Open Lead
                    </button>
                  </div>
                </div>

                {/* Body details */}
                <div className="grid gap-6 p-6 lg:grid-cols-[1.3fr_1fr]">
                  {/* Left: Summary, Researched Intel & Scoring Factors */}
                  <div className="space-y-5">
                    <div>
                      <p className="text-[11px] font-semibold tracking-wider text-neutral-500 uppercase">
                        AI Executive Summary
                      </p>
                      <p className="mt-1.5 text-[14px] leading-relaxed text-neutral-200">
                        {analysis.summary}
                      </p>
                    </div>

                    {/* Researched Company Intel */}
                    <div className="rounded-xl border border-white/[0.05] bg-[#0c0d14] p-3.5">
                      <p className="text-[11px] font-semibold tracking-wider text-[#a594ff] uppercase">
                        AI Company Intel · {lead.company}
                      </p>
                      <div className="mt-2 grid grid-cols-2 gap-3 text-[12px]">
                        <div>
                          <span className="text-neutral-500">Industry:</span>{' '}
                          <span className="text-neutral-300">{analysis.companyIntel.industry}</span>
                        </div>
                        <div>
                          <span className="text-neutral-500">Scale:</span>{' '}
                          <span className="text-neutral-300">{analysis.companyIntel.headcount}</span>
                        </div>
                        <div>
                          <span className="text-neutral-500">Tech Stack:</span>{' '}
                          <span className="text-neutral-300">
                            {analysis.companyIntel.techStack.join(', ')}
                          </span>
                        </div>
                        <div>
                          <span className="text-neutral-500">Financials:</span>{' '}
                          <span className="text-neutral-300">{analysis.companyIntel.fundingOrRevenue}</span>
                        </div>
                      </div>
                      <p className="mt-2 text-[12px] text-neutral-400">
                        <strong className="text-neutral-300">Key Friction:</strong>{' '}
                        {analysis.companyIntel.keyPainPoint}
                      </p>
                    </div>

                    {/* Explainable Scoring Factors */}
                    <div>
                      <p className="text-[11px] font-semibold tracking-wider text-neutral-500 uppercase">
                        Predictive Drivers &amp; Deductions
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {analysis.scoringBreakdown.map((b, bIdx) => (
                          <span
                            key={bIdx}
                            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[12px] font-medium ${
                              b.impact === 'positive'
                                ? 'bg-[#34d399]/10 text-[#6ee7b7] border border-[#34d399]/20'
                                : b.impact === 'negative'
                                ? 'bg-[#f87171]/10 text-[#fca5a5] border border-[#f87171]/20'
                                : 'bg-white/[0.05] text-neutral-300 border border-white/10'
                            }`}
                          >
                            <span>{b.points > 0 ? `+${b.points}` : b.points}</span>
                            <span>{b.factor}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right: Auto-generated Deliverables (Message & Quotation) */}
                  <div className="space-y-4">
                    {/* Auto-Drafted Outreach */}
                    <div className="rounded-2xl border border-white/[0.08] bg-[#0b0d14] p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[12px] font-medium text-white">
                          <MessageCircle size={14} className="text-[#34d399]" />
                          <span>AI-Drafted {analysis.personalizedMessage.channel} Outreach</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(analysis.personalizedMessage.body, `msg-${lead.id}`)}
                          className="flex items-center gap-1 text-[11px] text-[#a594ff] hover:text-white"
                        >
                          <Copy size={12} />
                          {copiedKey === `msg-${lead.id}` ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                      <pre className="mt-2.5 max-h-36 overflow-y-auto whitespace-pre-wrap font-sans text-[12px] leading-relaxed text-neutral-300">
                        {analysis.personalizedMessage.body}
                      </pre>
                      {lead.phone && (
                        <div className="mt-3 pt-3 border-t border-white/[0.05] flex justify-end">
                          <a
                            href={`https://wa.me/${lead.phone.replace(/\D/g, '')}?text=${encodeURIComponent(analysis.personalizedMessage.body)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#4ade80] hover:underline"
                          >
                            Send via WhatsApp <ExternalLink size={12} />
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Auto-Prepared Quotation Draft */}
                    <div className="rounded-2xl border border-[#7c5cff]/20 bg-[#7c5cff]/[0.03] p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[11px] font-semibold tracking-wider text-[#a594ff] uppercase">
                            AI Commercial Proposal
                          </p>
                          <h4 className="mt-0.5 text-[13px] font-semibold text-white">
                            {analysis.quotation.planName}
                          </h4>
                        </div>
                        <span className="text-[16px] font-bold text-white">
                          {rupeesToLakhs(analysis.quotation.proposedValue)}
                        </span>
                      </div>
                      <ul className="mt-2.5 space-y-1 text-[11px] text-neutral-400">
                        {analysis.quotation.scopeItems.slice(0, 3).map((item, i) => (
                          <li key={i} className="flex items-center gap-1.5">
                            <span className="size-1 rounded-full bg-[#7c5cff]" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-3 flex items-center justify-between border-t border-white/[0.05] pt-2 text-[11px] text-neutral-400">
                        <span>Validity: {analysis.quotation.validityDays} days</span>
                        <span className="text-[#34d399]">{analysis.quotation.discountSuggested}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </section>
    </div>
  )
}

function MetricTile({
  label,
  value,
  sub,
  icon,
}: {
  label: string
  value: string
  sub: string
  icon: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] p-4">
      <div className="flex items-center justify-between">
        <p className="text-[12px] text-neutral-400">{label}</p>
        {icon}
      </div>
      <p className="mt-2 text-[24px] font-bold tracking-tight text-white">{value}</p>
      <p className="mt-1 text-[11px] text-neutral-500">{sub}</p>
    </div>
  )
}
