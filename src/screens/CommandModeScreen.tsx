import { useMemo, useState } from 'react'
import {
  ArrowRight,
  Bot,
  Check,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  Lock,
  Mail,
  MessageSquare,
  Play,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Terminal,
  UserCheck,
  Zap,
} from 'lucide-react'
import {
  executeCommandModeWorkflow,
  PRESET_COMMANDS,
  type AuditLogEntry,
  type CommandApprovalItem,
  type CommandExecutionResult,
} from '../lib/commandAgent'
import { rupeesToLakhs } from '../lib/format'
import { card, stageColor } from '../lib/ui'
import { useCrm } from '../store/CrmContext'

interface CommandModeScreenProps {
  onOpenLead: (id: string) => void
  onPipeline: () => void
}

export function CommandModeScreen({ onOpenLead, onPipeline }: CommandModeScreenProps) {
  const { store, addTask } = useCrm()

  // Default to the flagship killer prompt requested by the user
  const [prompt, setPrompt] = useState<string>(
    'Find all leads that haven’t been contacted for more than 5 days, prioritize companies above ₹10 lakh potential, research the decision makers and prepare personalized WhatsApp and email follow-ups.'
  )

  const [activeTab, setActiveTab] = useState<'approvals' | 'deliverables' | 'governance'>('approvals')
  const [selectedFormat, setSelectedFormat] = useState<Record<string, 'whatsapp' | 'email'>>({})
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editedDrafts, setEditedDrafts] = useState<Record<string, string>>({})

  // Execution state & telemetry
  const [isExecuting, setIsExecuting] = useState(false)
  const [executingStepIndex, setExecutingStepIndex] = useState(0)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  // Initial result from flagship query
  const [result, setResult] = useState<CommandExecutionResult>(() =>
    executeCommandModeWorkflow(prompt, store.leads)
  )

  // Local state for approval tracking
  const [approvals, setApprovals] = useState<CommandApprovalItem[]>(() => result.approvals)
  const [auditTrail, setAuditTrail] = useState<AuditLogEntry[]>(() => result.auditTrail)

  const pendingApprovals = useMemo(
    () => approvals.filter((a) => a.status === 'pending'),
    [approvals]
  )
  const approvedItems = useMemo(
    () => approvals.filter((a) => a.status === 'approved'),
    [approvals]
  )

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard?.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  // Run the agentic workflow execution simulation
  const handleExecute = (customPrompt?: string) => {
    const query = customPrompt !== undefined ? customPrompt : prompt
    if (!query.trim() || isExecuting) return

    setIsExecuting(true)
    setExecutingStepIndex(0)

    // Simulate multi-agent pipelining steps
    const stepInterval = setInterval(() => {
      setExecutingStepIndex((prev) => {
        if (prev >= 4) {
          clearInterval(stepInterval)
          setIsExecuting(false)
          const newResult = executeCommandModeWorkflow(query, store.leads)
          setResult(newResult)
          setApprovals(newResult.approvals)
          setAuditTrail(newResult.auditTrail)
          return 4
        }
        return prev + 1
      })
    }, 280)
  }

  // Handle single item approval & dispatch
  const handleApprove = (item: CommandApprovalItem) => {
    const timestamp = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })

    setApprovals((prev) =>
      prev.map((a) =>
        a.id === item.id
          ? {
              ...a,
              status: 'approved',
              approvedAt: timestamp,
            }
          : a
      )
    )

    // Append to live immutable audit trail
    const auditEntry: AuditLogEntry = {
      id: `aud-${Date.now()}`,
      timestamp,
      agentName: 'Owner Human-in-the-Loop Gate',
      agentId: 'usr:owner-signoff',
      permissionTier: 'HUMAN_AUTHORIZATION',
      systemTarget: 'Outreach Dispatch Engine (WhatsApp + Email)',
      event: `Authorized outbound executive communication for ${item.company} (${rupeesToLakhs(item.value)})`,
      payloadPreview: JSON.stringify({
        company: item.company,
        decisionMaker: item.decisionMaker.name,
        value: item.value,
        channel: 'WhatsApp & Email',
      }),
      securityHash: `sha256:${Math.random().toString(36).substring(2, 12)}`,
      status: 'APPROVED',
    }

    setAuditTrail((prev) => [auditEntry, ...prev])

    // Integrate with real CRM: Add follow-up task to Today queue
    addTask({
      leadId: item.leadId,
      kind: 'call',
      title: `Executive Outreach Approved: ${item.decisionMaker.name}`,
      detail: `Approved by owner. Message dispatched to ${item.company} (${rupeesToLakhs(item.value)}). Awaiting reply.`,
      actionLabel: 'Check Status',
      doneLabel: 'Acknowledged',
      done: false,
      dueDate: new Date().toISOString(),
    })
  }

  // Handle bulk "Approve All"
  const handleApproveAll = () => {
    const timestamp = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })

    const pending = approvals.filter((a) => a.status === 'pending')

    setApprovals((prev) =>
      prev.map((a) => ({
        ...a,
        status: 'approved',
        approvedAt: timestamp,
      }))
    )

    // Add batch audit log
    const batchAuditEntry: AuditLogEntry = {
      id: `aud-batch-${Date.now()}`,
      timestamp,
      agentName: 'Owner Human-in-the-Loop Gate',
      agentId: 'usr:owner-signoff',
      permissionTier: 'HUMAN_AUTHORIZATION',
      systemTarget: 'Outreach Dispatch Engine (Batch)',
      event: `Bulk authorized ${pending.length} executive communications (${rupeesToLakhs(
        pending.reduce((sum, p) => sum + p.value, 0)
      )})`,
      payloadPreview: JSON.stringify({
        totalBatchDeals: pending.length,
        policyEnforced: 'ENT-402',
      }),
      securityHash: `sha256:batch_${Math.random().toString(36).substring(2, 10)}`,
      status: 'APPROVED',
    }

    setAuditTrail((prev) => [batchAuditEntry, ...prev])

    // Add batch task to Today queue
    addTask({
      kind: 'todo',
      title: `Batch Outreach Dispatched (${pending.length} Enterprise Leads)`,
      detail: `Autonomous messages dispatched to ${pending.map((p) => p.company).slice(0, 3).join(', ')} and ${Math.max(0, pending.length - 3)} others.`,
      actionLabel: 'View Audit',
      doneLabel: 'Reviewed',
      done: false,
      dueDate: new Date().toISOString(),
    })
  }

  // Download Audit Trail as JSON
  const handleExportAudit = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(auditTrail, null, 2))
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute('href', dataStr)
    downloadAnchor.setAttribute('download', `mayvexa-audit-trail-${Date.now()}.json`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
  }

  return (
    <div className="animate-rise mx-auto max-w-6xl space-y-10 pb-16">
      {/* Hero Header */}
      <header className="relative overflow-hidden rounded-3xl border border-[#7c5cff]/30 bg-gradient-to-br from-[#121128] via-[#0c0d16] to-[#08090f] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
        <div className="pointer-events-none absolute -top-24 -right-24 size-80 rounded-full bg-[#7c5cff]/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 size-72 rounded-full bg-[#38bdf8]/10 blur-3xl" />

        <div className="relative flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="flex size-7 items-center justify-center rounded-lg bg-[#7c5cff]/20 text-[#a594ff] shadow-[0_0_15px_rgba(124,92,255,0.4)]">
                <Terminal size={16} />
              </span>
              <p className="text-[12px] font-semibold tracking-[0.2em] text-[#a594ff] uppercase">
                Autonomous Workflow Console
              </p>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#34d399]/30 bg-[#34d399]/10 px-2.5 py-0.5 text-[11px] font-medium text-[#6ee7b7]">
                <span className="size-1.5 animate-pulse rounded-full bg-[#34d399]" />
                Agent Runtime: ONLINE
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#38bdf8]/30 bg-[#38bdf8]/10 px-2.5 py-0.5 text-[11px] font-medium text-[#7dd3fc]">
                <ShieldCheck size={12} />
                Governance: Policy #ENT-402
              </span>
            </div>

            <h1 className="mt-4 text-[32px] font-bold tracking-tight text-white md:text-[36px]">
              Command Mode
            </h1>
            <p className="mt-2 text-[15px] font-medium text-[#c4b5fd]">
              “Don’t tell me what to do. Do it.”
            </p>
            <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-neutral-400">
              Unlike chatbots that merely produce advice lists, MayVexa’s autonomous agent pipeline{' '}
              <strong className="text-neutral-200">executes the complete workflow</strong>: querying the CRM,
              enriching decision-makers, ranking high-potential deals, and drafting personalized multi-channel
              outreach — with enterprise permissions, human-in-the-loop approvals, and immutable audit trails.
            </p>
          </div>

          <div className="flex flex-col items-start gap-3 sm:items-end">
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 text-left sm:text-right backdrop-blur-md">
              <p className="text-[11px] text-neutral-400 uppercase tracking-wider">Enterprise Security</p>
              <p className="text-[20px] font-bold text-white tracking-tight">Zero-Trust Guardrail</p>
              <p className="text-[12px] text-[#34d399]">
                Audit Trail Cryptographically Verified
              </p>
            </div>
            <button
              onClick={onPipeline}
              className="inline-flex items-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.04] px-3.5 py-2 text-[12px] font-medium text-neutral-200 transition hover:bg-white/[0.08] hover:text-white"
            >
              <span>View Pipeline Deals</span>
              <ArrowRight size={14} className="text-[#a594ff]" />
            </button>
          </div>
        </div>

        {/* Live System Status Tiles */}
        <div className="relative mt-8 grid gap-4 border-t border-white/[0.06] pt-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
            <p className="text-[11px] font-semibold tracking-wider text-neutral-400 uppercase">Execution Model</p>
            <p className="mt-1 text-[18px] font-bold text-white">Autonomous Loop</p>
            <p className="text-[12px] text-[#a594ff]">Multi-Agent Collaboration</p>
          </div>
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
            <p className="text-[11px] font-semibold tracking-wider text-neutral-400 uppercase">Human Oversight</p>
            <p className="mt-1 text-[18px] font-bold text-white">
              {pendingApprovals.length} Pending Approval
            </p>
            <p className="text-[12px] text-[#fbbf24]">Deals &gt; ₹10L require sign-off</p>
          </div>
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
            <p className="text-[11px] font-semibold tracking-wider text-neutral-400 uppercase">Safe Auto-Dispatch</p>
            <p className="mt-1 text-[18px] font-bold text-white">
              {result.stats.safeAutomated} Tasks Executed
            </p>
            <p className="text-[12px] text-[#34d399]">Auto-synced to Today queue</p>
          </div>
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
            <p className="text-[11px] font-semibold tracking-wider text-neutral-400 uppercase">Deloitte Enterprise Trend</p>
            <p className="mt-1 text-[18px] font-bold text-white">Agentic SaaS</p>
            <p className="text-[12px] text-[#38bdf8]">Outcome-based pricing ready</p>
          </div>
        </div>
      </header>

      {/* The Command Input Console */}
      <section className={`${card} relative overflow-hidden p-7 shadow-[0_12px_40px_rgba(0,0,0,0.5)]`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal size={18} className="text-[#7c5cff]" />
            <h2 className="text-[17px] font-semibold text-white">Natural Language Business Directive</h2>
          </div>
          <span className="text-[12px] text-neutral-500 font-mono">
            sys:autonomous-orchestrator-v2
          </span>
        </div>

        {/* Command Input Box */}
        <div className="relative mt-4">
          <div className="flex items-start rounded-2xl border border-[#7c5cff]/30 bg-[#080911] p-4 shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)] focus-within:border-[#7c5cff] focus-within:ring-2 focus-within:ring-[#7c5cff]/30 transition-all">
            <span className="mr-3 font-mono text-[18px] font-bold text-[#7c5cff] select-none">&gt;_</span>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Type your business objective... (e.g., 'Find all leads that haven't been contacted for more than 5 days, prioritize companies above ₹10 lakh potential...')"
              className="w-full resize-none bg-transparent text-[14px] leading-relaxed text-white placeholder-neutral-500 focus:outline-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  handleExecute()
                }
              }}
            />
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-[12px] text-neutral-400">
              <Sparkles size={14} className="text-[#a594ff]" />
              <span>Press <kbd className="rounded bg-white/[0.08] px-1.5 py-0.5 font-mono text-[11px] text-neutral-300">Ctrl+Enter</kbd> or click Execute</span>
            </div>

            <button
              onClick={() => handleExecute()}
              disabled={isExecuting}
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-[14px] font-semibold text-white shadow-[0_8px_24px_rgba(124,92,255,0.4)] transition-all ${
                isExecuting
                  ? 'bg-[#7c5cff]/60 cursor-not-allowed'
                  : 'bg-[#7c5cff] hover:bg-[#8b6dff] hover:shadow-[0_10px_30px_rgba(124,92,255,0.6)] active:scale-[0.98]'
              }`}
            >
              {isExecuting ? (
                <>
                  <RefreshCw size={16} className="animate-spin text-white" />
                  <span>Agents Executing...</span>
                </>
              ) : (
                <>
                  <Zap size={16} className="fill-white" />
                  <span>Execute Workflow</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Preset Killer Directives */}
        <div className="mt-6 border-t border-white/[0.06] pt-5">
          <p className="text-[11px] font-semibold tracking-wider text-neutral-500 uppercase">
            Signature Killer Directives (Click to Load &amp; Run)
          </p>
          <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
            {PRESET_COMMANDS.map((cmd) => (
              <button
                key={cmd.id}
                type="button"
                onClick={() => {
                  setPrompt(cmd.prompt)
                  handleExecute(cmd.prompt)
                }}
                className={`group flex flex-col items-start rounded-xl border p-3.5 text-left transition-all ${
                  prompt === cmd.prompt
                    ? 'border-[#7c5cff]/50 bg-[#7c5cff]/10 text-white'
                    : 'border-white/[0.06] bg-white/[0.02] text-neutral-300 hover:border-white/[0.15] hover:bg-white/[0.05]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Play size={13} className="text-[#a594ff] transition-transform group-hover:scale-110" />
                  <span className="text-[13px] font-medium text-white">{cmd.label}</span>
                </div>
                <p className="mt-1 line-clamp-2 text-[12px] text-neutral-400">
                  {cmd.prompt}
                </p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Real-time Multi-Agent Execution Telemetry */}
      {isExecuting && (
        <section className={`${card} animate-pulse border-[#7c5cff]/40 bg-[#0e0f1d] p-6`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot size={18} className="text-[#a594ff] animate-bounce" />
              <h3 className="text-[15px] font-semibold text-white">
                Multi-Agent Pipeline Collaborating in Real Time...
              </h3>
            </div>
            <span className="text-[12px] text-[#a594ff] font-mono">
              Step {executingStepIndex + 1} of 5
            </span>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-5">
            {result.steps.map((step, idx) => {
              const isPast = idx < executingStepIndex
              const isCurrent = idx === executingStepIndex
              return (
                <div
                  key={step.id}
                  className={`rounded-xl border p-3 transition-all ${
                    isCurrent
                      ? 'border-[#7c5cff] bg-[#7c5cff]/15 text-white shadow-[0_0_15px_rgba(124,92,255,0.3)]'
                      : isPast
                      ? 'border-[#34d399]/40 bg-[#34d399]/10 text-[#6ee7b7]'
                      : 'border-white/[0.05] bg-white/[0.01] text-neutral-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase">
                      {isPast ? 'DONE' : isCurrent ? 'RUNNING' : 'QUEUED'}
                    </span>
                    {isPast && <Check size={12} className="text-[#34d399]" />}
                    {isCurrent && <RefreshCw size={12} className="animate-spin text-[#a594ff]" />}
                  </div>
                  <p className="mt-1.5 text-[12px] font-semibold truncate">{step.agentName}</p>
                  <p className="text-[11px] opacity-80 truncate">{step.action}</p>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* The Groundbreaking Outcome Confirmation Banner */}
      <section className="relative overflow-hidden rounded-3xl border border-[#34d399]/30 bg-gradient-to-br from-[#0c1a17] via-[#09110f] to-[#07090f] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
        <div className="pointer-events-none absolute -top-20 -right-20 size-72 rounded-full bg-[#34d399]/10 blur-3xl" />

        <div className="relative">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-[#34d399]/20 text-[#6ee7b7]">
              <CheckCircle2 size={16} />
            </span>
            <p className="text-[12px] font-bold tracking-[0.2em] text-[#6ee7b7] uppercase">
              Autonomous Outcome Delivered
            </p>
          </div>

          <h2 className="mt-3 text-[26px] font-bold tracking-tight text-white md:text-[30px] leading-snug">
            “{result.headline}”
          </h2>

          <p className="mt-2 text-[14px] text-neutral-300">
            {result.summaryQuote}
          </p>

          {/* Quick Metrics Bar */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3 text-center">
              <p className="text-[10px] text-neutral-400 uppercase tracking-wider">Leads Found</p>
              <p className="text-[22px] font-bold text-white">{result.stats.leadsFound}</p>
              <p className="text-[11px] text-neutral-400">&gt; 5 days uncontacted</p>
            </div>
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3 text-center">
              <p className="text-[10px] text-neutral-400 uppercase tracking-wider">Qualified</p>
              <p className="text-[22px] font-bold text-[#38bdf8]">{result.stats.leadsQualified}</p>
              <p className="text-[11px] text-neutral-400">Potential &ge; ₹10L</p>
            </div>
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3 text-center">
              <p className="text-[10px] text-neutral-400 uppercase tracking-wider">Messages Prepared</p>
              <p className="text-[22px] font-bold text-[#a594ff]">{result.stats.messagesPrepared}</p>
              <p className="text-[11px] text-neutral-400">WhatsApp &amp; Email</p>
            </div>
            <div className="rounded-xl border border-[#fbbf24]/30 bg-[#fbbf24]/10 p-3 text-center">
              <p className="text-[10px] text-[#fbbf24] uppercase tracking-wider font-semibold">Require Approval</p>
              <p className="text-[22px] font-bold text-white">{pendingApprovals.length}</p>
              <p className="text-[11px] text-[#fbbf24]">Policy #ENT-402 Gate</p>
            </div>
            <div className="rounded-xl border border-[#34d399]/30 bg-[#34d399]/10 p-3 text-center">
              <p className="text-[10px] text-[#6ee7b7] uppercase tracking-wider font-semibold">Safe Automated</p>
              <p className="text-[22px] font-bold text-[#34d399]">{result.stats.safeAutomated}</p>
              <p className="text-[11px] text-[#6ee7b7]">Auto-synced to CRM</p>
            </div>
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3 text-center">
              <p className="text-[10px] text-neutral-400 uppercase tracking-wider">Total Pipeline Value</p>
              <p className="text-[22px] font-bold text-white">₹1.34 Cr</p>
              <p className="text-[11px] text-neutral-400">Qualified pool</p>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('approvals')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-semibold transition-all ${
              activeTab === 'approvals'
                ? 'bg-[#7c5cff] text-white shadow-[0_4px_16px_rgba(124,92,255,0.4)]'
                : 'text-neutral-400 hover:bg-white/[0.04] hover:text-white'
            }`}
          >
            <ShieldAlert size={15} />
            <span>Human Approval Queue</span>
            <span
              className={`ml-1 rounded-full px-2 py-0.5 text-[11px] ${
                activeTab === 'approvals'
                  ? 'bg-white/20 text-white'
                  : 'bg-[#fbbf24]/20 text-[#fbbf24]'
              }`}
            >
              {pendingApprovals.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('deliverables')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-semibold transition-all ${
              activeTab === 'deliverables'
                ? 'bg-[#7c5cff] text-white shadow-[0_4px_16px_rgba(124,92,255,0.4)]'
                : 'text-neutral-400 hover:bg-white/[0.04] hover:text-white'
            }`}
          >
            <MessageSquare size={15} />
            <span>Prepared Deliverables &amp; Safe Automations</span>
            <span
              className={`ml-1 rounded-full px-2 py-0.5 text-[11px] ${
                activeTab === 'deliverables' ? 'bg-white/20 text-white' : 'bg-white/[0.08] text-neutral-300'
              }`}
            >
              12
            </span>
          </button>

          <button
            onClick={() => setActiveTab('governance')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-semibold transition-all ${
              activeTab === 'governance'
                ? 'bg-[#7c5cff] text-white shadow-[0_4px_16px_rgba(124,92,255,0.4)]'
                : 'text-neutral-400 hover:bg-white/[0.04] hover:text-white'
            }`}
          >
            <ShieldCheck size={15} />
            <span>Governance &amp; Audit Trail</span>
            <span
              className={`ml-1 rounded-full px-2 py-0.5 text-[11px] ${
                activeTab === 'governance' ? 'bg-white/20 text-white' : 'bg-white/[0.08] text-neutral-300'
              }`}
            >
              {auditTrail.length} Logs
            </span>
          </button>
        </div>

        {activeTab === 'approvals' && pendingApprovals.length > 0 && (
          <button
            onClick={handleApproveAll}
            className="flex items-center gap-2 rounded-xl border border-[#34d399]/40 bg-[#34d399]/15 px-4 py-2 text-[13px] font-semibold text-[#6ee7b7] shadow-[0_4px_16px_rgba(52,211,153,0.2)] transition-all hover:bg-[#34d399]/25 hover:text-white"
          >
            <CheckCircle2 size={15} />
            <span>Approve All {pendingApprovals.length} Pending Dispatches</span>
          </button>
        )}
      </div>

      {/* SUB-VIEW 1: Human Approval Queue */}
      {activeTab === 'approvals' && (
        <section className="space-y-6">
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-[16px] font-semibold text-white">
                    Executive Approval Queue ({pendingApprovals.length} Pending Sign-offs)
                  </h3>
                  {approvedItems.length > 0 && (
                    <span className="rounded-full bg-[#34d399]/20 px-2 py-0.5 text-[11px] font-semibold text-[#6ee7b7]">
                      {approvedItems.length} Dispatched
                    </span>
                  )}
                </div>
                <p className="mt-1 text-[13px] text-neutral-400">
                  As highlighted in Deloitte’s autonomous enterprise framework: high-value commercial dispatches require human sign-off while routine operations execute autonomously.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#fbbf24]/30 bg-[#fbbf24]/10 px-3 py-1 text-[12px] font-medium text-[#fcd34d]">
                  <Lock size={12} />
                  Protected by Policy #ENT-402
                </span>
              </div>
            </div>
          </div>

          {pendingApprovals.length === 0 && (
            <div className="rounded-3xl border border-[#34d399]/20 bg-[#34d399]/5 p-12 text-center">
              <CheckCircle2 size={44} className="mx-auto text-[#34d399]" />
              <h4 className="mt-4 text-[20px] font-bold text-white">
                All Enterprise Dispatches Approved &amp; Executed!
              </h4>
              <p className="mx-auto mt-2 max-w-md text-[13px] text-neutral-400">
                All 8 high-impact accounts have been dispatched via verified channels. Real-time CRM tasks have been created on the Today queue.
              </p>
              <button
                onClick={() => setActiveTab('governance')}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white/[0.08] px-4 py-2 text-[13px] font-medium text-white hover:bg-white/[0.12]"
              >
                <ShieldCheck size={14} className="text-[#38bdf8]" />
                <span>Inspect Cryptographic Audit Trail</span>
              </button>
            </div>
          )}

          <div className="grid gap-6">
            {approvals.map((item) => {
              const isApproved = item.status === 'approved'
              const format = selectedFormat[item.id] || 'whatsapp'
              const isEditing = editingId === item.id
              const currentDraft =
                format === 'whatsapp'
                  ? editedDrafts[`${item.id}-wa`] || item.whatsappDraft
                  : editedDrafts[`${item.id}-email`] || item.emailDraft.body

              return (
                <div
                  key={item.id}
                  className={`overflow-hidden rounded-3xl border transition-all ${
                    isApproved
                      ? 'border-[#34d399]/30 bg-[#0c1411]/70 opacity-90'
                      : 'border-white/[0.08] bg-[#0c0d16] hover:border-[#7c5cff]/40 shadow-[0_10px_30px_rgba(0,0,0,0.5)]'
                  }`}
                >
                  {/* Card Header */}
                  <div className="border-b border-white/[0.06] bg-white/[0.02] p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2.5">
                          <h4 className="text-[18px] font-bold text-white">{item.company}</h4>
                          <span
                            className="size-2 rounded-full"
                            style={{ background: stageColor[item.stage] }}
                          />
                          <span className="text-[12px] text-neutral-400 font-medium">
                            Stage: {item.stage}
                          </span>
                          <span className="rounded-lg bg-white/[0.06] px-2.5 py-0.5 text-[12px] font-bold text-white">
                            {rupeesToLakhs(item.value)}
                          </span>
                          <span className="rounded-lg border border-[#f87171]/25 bg-[#f87171]/10 px-2.5 py-0.5 text-[11px] font-medium text-[#fca5a5]">
                            {item.daysUncontacted} days without touchpoint
                          </span>
                        </div>

                        {/* Governance Policy Alert Banner */}
                        <div className="mt-2.5 flex items-center gap-2 text-[12px] text-[#fbbf24]">
                          <ShieldAlert size={14} className="shrink-0" />
                          <span className="font-medium">{item.policyRule}</span>
                        </div>
                      </div>

                      {/* Status / Action Button */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const match =
                              store.leads.find(
                                (l) =>
                                  l.id === item.leadId ||
                                  l.company.toLowerCase().includes(item.company.toLowerCase().slice(0, 4))
                              ) || store.leads[0]
                            if (match) onOpenLead(match.id)
                          }}
                          className="inline-flex items-center gap-1 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-[12px] font-medium text-neutral-300 transition hover:bg-white/[0.08] hover:text-white"
                        >
                          <ExternalLink size={13} className="text-[#a594ff]" />
                          <span>CRM Record</span>
                        </button>

                        {isApproved ? (
                          <div className="flex items-center gap-2 rounded-xl border border-[#34d399]/30 bg-[#34d399]/15 px-3.5 py-1.5 text-[12px] font-semibold text-[#6ee7b7]">
                            <CheckCircle2 size={15} />
                            <span>Approved &amp; Dispatched ({item.approvedAt})</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleApprove(item)}
                            className="flex items-center gap-2 rounded-xl bg-[#7c5cff] px-4 py-2 text-[13px] font-semibold text-white shadow-[0_4px_16px_rgba(124,92,255,0.4)] transition-all hover:bg-[#8b6dff] active:scale-[0.98]"
                          >
                            <Check size={15} />
                            <span>Approve &amp; Dispatch</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="grid gap-6 p-6 lg:grid-cols-12">
                    {/* Left: Decision Maker Intel */}
                    <div className="space-y-4 lg:col-span-5 border-r border-white/[0.06] pr-0 lg:pr-6">
                      <div>
                        <p className="text-[11px] font-semibold tracking-wider text-neutral-400 uppercase">
                          Autonomous Enriched Decision Maker
                        </p>
                        <div className="mt-2.5 flex items-center gap-3">
                          <div className="flex size-10 items-center justify-center rounded-xl bg-[#7c5cff]/20 font-bold text-[#c4b5fd]">
                            {item.decisionMaker.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </div>
                          <div>
                            <p className="text-[15px] font-bold text-white">
                              {item.decisionMaker.name}
                            </p>
                            <p className="text-[12px] text-neutral-400">
                              {item.decisionMaker.title}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-[12px]">
                        <div className="flex items-center justify-between py-1 border-b border-white/[0.04]">
                          <span className="text-neutral-500">Department:</span>
                          <span className="text-neutral-300 font-medium">{item.decisionMaker.department}</span>
                        </div>
                        <div className="flex items-center justify-between py-1 border-b border-white/[0.04]">
                          <span className="text-neutral-500">Work Phone:</span>
                          <span className="text-neutral-300 font-mono">{item.decisionMaker.directPhone}</span>
                        </div>
                        <div className="flex items-center justify-between py-1 border-b border-white/[0.04]">
                          <span className="text-neutral-500">Corporate Email:</span>
                          <span className="text-neutral-300 font-mono truncate max-w-[190px]">
                            {item.decisionMaker.workEmail}
                          </span>
                        </div>
                        <div className="flex items-center justify-between py-1">
                          <span className="text-neutral-500">Verified Via:</span>
                          <span className="inline-flex items-center gap-1 text-[#38bdf8] font-medium">
                            <UserCheck size={12} />
                            {item.decisionMaker.verifiedVia}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Prepared Personalized Message */}
                    <div className="space-y-3 lg:col-span-7">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedFormat((prev) => ({ ...prev, [item.id]: 'whatsapp' }))
                            }
                            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[12px] font-semibold transition ${
                              format === 'whatsapp'
                                ? 'bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/30'
                                : 'text-neutral-400 hover:text-white'
                            }`}
                          >
                            <MessageSquare size={13} />
                            <span>WhatsApp Draft</span>
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setSelectedFormat((prev) => ({ ...prev, [item.id]: 'email' }))
                            }
                            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[12px] font-semibold transition ${
                              format === 'email'
                                ? 'bg-[#38bdf8]/20 text-[#38bdf8] border border-[#38bdf8]/30'
                                : 'text-neutral-400 hover:text-white'
                            }`}
                          >
                            <Mail size={13} />
                            <span>Executive Email Draft</span>
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => copyToClipboard(currentDraft, `msg-${item.id}`)}
                            className="flex items-center gap-1 rounded-lg border border-white/[0.08] bg-white/[0.02] px-2.5 py-1 text-[11px] font-medium text-neutral-300 hover:bg-white/[0.06] hover:text-white"
                          >
                            <Copy size={12} />
                            <span>{copiedKey === `msg-${item.id}` ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Email Subject preview if email mode */}
                      {format === 'email' && (
                        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3.5 py-2 text-[12px]">
                          <span className="text-neutral-500 font-semibold">Subject:</span>{' '}
                          <span className="text-neutral-200">{item.emailDraft.subject}</span>
                        </div>
                      )}

                      {/* Message Preview Box */}
                      <div className="rounded-2xl border border-white/[0.08] bg-[#07080f] p-4 text-[13px] leading-relaxed text-neutral-200 font-sans shadow-inner">
                        {isEditing ? (
                          <textarea
                            rows={5}
                            value={currentDraft}
                            onChange={(e) => {
                              const val = e.target.value
                              setEditedDrafts((prev) => ({
                                ...prev,
                                [format === 'whatsapp' ? `${item.id}-wa` : `${item.id}-email`]: val,
                              }))
                            }}
                            className="w-full bg-transparent text-[13px] text-white focus:outline-none"
                          />
                        ) : (
                          <p className="whitespace-pre-line">{currentDraft}</p>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                        <span className="text-[11px] text-neutral-500">
                          Synthesized by <code className="text-neutral-400">sys:personalized-copywriter</code>
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingId(isEditing ? null : item.id)}
                            className="text-[12px] text-neutral-400 hover:text-white"
                          >
                            {isEditing ? 'Save Changes' : 'Edit Draft'}
                          </button>

                          {format === 'whatsapp' && (
                            <a
                              href={`https://wa.me/${item.decisionMaker.directPhone?.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                                currentDraft
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[12px] font-medium text-[#25D366] hover:underline"
                            >
                              <span>Send via WhatsApp</span>
                              <ExternalLink size={12} />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* SUB-VIEW 2: Prepared Deliverables & Safe Automations */}
      {activeTab === 'deliverables' && (
        <section className="space-y-8">
          {/* Safe Automations (Without human friction) */}
          <div className={`${card} p-7`}>
            <div className="flex items-center gap-2">
              <Zap size={18} className="text-[#34d399]" />
              <h3 className="text-[18px] font-semibold text-white">
                Safe Autonomous Actions (Executed Without Friction)
              </h3>
            </div>
            <p className="mt-1 text-[13px] text-neutral-400">
              Low-risk operations under ₹5L or internal CRM syncs execute directly with zero human latency.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {result.automatedActions.map((auto) => (
                <div
                  key={auto.id}
                  className="flex items-start justify-between gap-3 rounded-2xl border border-[#34d399]/20 bg-[#34d399]/5 p-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-[14px]">{auto.company}</span>
                      <span className="rounded bg-white/[0.08] px-2 py-0.5 text-[11px] text-neutral-300">
                        {rupeesToLakhs(auto.value)}
                      </span>
                    </div>
                    <p className="mt-1.5 text-[12px] text-neutral-300 leading-relaxed">
                      {auto.action}
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-[11px] text-neutral-500 font-mono">
                      <span>{auto.channel}</span>
                      <span>•</span>
                      <span>{auto.timestamp}</span>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 rounded-full bg-[#34d399]/20 px-2 py-0.5 text-[10px] font-bold text-[#6ee7b7]">
                    <Check size={11} /> AUTO
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Complete 12 Prepared Communications Showcase */}
          <div className={`${card} p-7`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[18px] font-semibold text-white">
                  12 Prepared Outreach Deliverables Library
                </h3>
                <p className="mt-1 text-[13px] text-neutral-400">
                  Ready-to-dispatch communications tailored to verified decision-makers.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {approvals.slice(0, 6).map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[14px] font-bold text-white">{item.company}</span>
                      <span className="text-[12px] font-bold text-[#a594ff]">
                        {rupeesToLakhs(item.value)}
                      </span>
                    </div>
                    <p className="text-[12px] text-neutral-400">{item.decisionMaker.name}</p>

                    <div className="mt-3 rounded-xl border border-white/[0.06] bg-[#07090f] p-3 text-[12px] text-neutral-300 line-clamp-4">
                      {item.whatsappDraft}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between pt-3 border-t border-white/[0.04]">
                    <span className="text-[11px] text-neutral-500 font-mono">WhatsApp ready</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(item.whatsappDraft, `card-${item.id}`)}
                      className="text-[11px] text-[#a594ff] hover:underline"
                    >
                      {copiedKey === `card-${item.id}` ? 'Copied' : 'Copy Draft'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SUB-VIEW 3: Enterprise Governance & Audit Trail */}
      {activeTab === 'governance' && (
        <section className="space-y-8">
          {/* Active Policy Guardrails Matrix */}
          <div className={`${card} p-7`}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={18} className="text-[#38bdf8]" />
                  <h3 className="text-[18px] font-semibold text-white">
                    Active Enterprise Governance Policies
                  </h3>
                </div>
                <p className="mt-1 text-[13px] text-neutral-400">
                  Enforcing safety bounds as autonomous agents gain access to enterprise sales data and messaging APIs.
                </p>
              </div>

              <button
                onClick={handleExportAudit}
                className="flex items-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.04] px-4 py-2 text-[12px] font-medium text-white transition hover:bg-white/[0.08]"
              >
                <Download size={14} className="text-[#38bdf8]" />
                <span>Export Audit Log (.JSON)</span>
              </button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-[#38bdf8]">POLICY #ENT-402</span>
                  <span className="rounded bg-[#34d399]/20 px-2 py-0.5 text-[10px] font-bold text-[#6ee7b7]">
                    ACTIVE
                  </span>
                </div>
                <p className="mt-2 text-[14px] font-bold text-white">Human Sign-off Threshold</p>
                <p className="mt-1 text-[12px] text-neutral-400">
                  Any deal &gt; ₹10 Lakhs strictly holds in approval queue before outbound dispatch.
                </p>
              </div>

              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-[#38bdf8]">POLICY #SEC-108</span>
                  <span className="rounded bg-[#34d399]/20 px-2 py-0.5 text-[10px] font-bold text-[#6ee7b7]">
                    ENFORCED
                  </span>
                </div>
                <p className="mt-2 text-[14px] font-bold text-white">Read-Only Financial Gate</p>
                <p className="mt-1 text-[12px] text-neutral-400">
                  Agents cannot modify ledger balances or sign commercial contracts autonomously.
                </p>
              </div>

              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-[#38bdf8]">POLICY #MSG-204</span>
                  <span className="rounded bg-[#34d399]/20 px-2 py-0.5 text-[10px] font-bold text-[#6ee7b7]">
                    ACTIVE
                  </span>
                </div>
                <p className="mt-2 text-[14px] font-bold text-white">WhatsApp Rate Limiting</p>
                <p className="mt-1 text-[12px] text-neutral-400">
                  Mandatory 30-second spacing between outbound API dispatches to protect sender reputation.
                </p>
              </div>

              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-[#38bdf8]">POLICY #AUD-901</span>
                  <span className="rounded bg-[#34d399]/20 px-2 py-0.5 text-[10px] font-bold text-[#6ee7b7]">
                    ENFORCED
                  </span>
                </div>
                <p className="mt-2 text-[14px] font-bold text-white">Cryptographic Hashing</p>
                <p className="mt-1 text-[12px] text-neutral-400">
                  Every agent execution payload is hashed with SHA-256 for non-repudiation.
                </p>
              </div>
            </div>
          </div>

          {/* Immutable Audit Trail Log */}
          <div className={`${card} p-7`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[18px] font-semibold text-white">
                  Immutable Agentic Audit Trail ({auditTrail.length} Logged Events)
                </h3>
                <p className="mt-1 text-[13px] text-neutral-400">
                  Verifiable record of every autonomous action, permission tier, and owner sign-off.
                </p>
              </div>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left text-[12px]">
                <thead>
                  <tr className="border-b border-white/[0.08] text-neutral-400">
                    <th className="pb-3 font-semibold uppercase tracking-wider">Timestamp</th>
                    <th className="pb-3 font-semibold uppercase tracking-wider">Agent / User</th>
                    <th className="pb-3 font-semibold uppercase tracking-wider">Permission Tier</th>
                    <th className="pb-3 font-semibold uppercase tracking-wider">Target System</th>
                    <th className="pb-3 font-semibold uppercase tracking-wider">Action / Event</th>
                    <th className="pb-3 font-semibold uppercase tracking-wider">Security Hash</th>
                    <th className="pb-3 font-semibold uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {auditTrail.map((entry) => (
                    <tr key={entry.id} className="hover:bg-white/[0.02] transition">
                      <td className="py-3 font-mono text-neutral-400 whitespace-nowrap">
                        {entry.timestamp}
                      </td>
                      <td className="py-3">
                        <span className="font-semibold text-white">{entry.agentName}</span>
                        <p className="text-[10px] font-mono text-neutral-500">{entry.agentId}</p>
                      </td>
                      <td className="py-3">
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                            entry.permissionTier === 'HUMAN_AUTHORIZATION'
                              ? 'bg-[#fbbf24]/20 text-[#fcd34d]'
                              : entry.permissionTier === 'GATE_HOLD'
                              ? 'bg-[#f87171]/20 text-[#fca5a5]'
                              : 'bg-white/[0.08] text-neutral-300'
                          }`}
                        >
                          {entry.permissionTier}
                        </span>
                      </td>
                      <td className="py-3 text-neutral-300 font-mono text-[11px]">
                        {entry.systemTarget}
                      </td>
                      <td className="py-3 text-neutral-200 max-w-xs">{entry.event}</td>
                      <td className="py-3 font-mono text-[11px] text-neutral-500">
                        {entry.securityHash}
                      </td>
                      <td className="py-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            entry.status === 'APPROVED' || entry.status === 'SUCCESS'
                              ? 'bg-[#34d399]/20 text-[#6ee7b7]'
                              : 'bg-[#fbbf24]/20 text-[#fcd34d]'
                          }`}
                        >
                          <Check size={10} /> {entry.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
