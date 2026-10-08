import { uid } from './format'
import type { Lead, Stage } from '../types'

export interface DecisionMaker {
  name: string
  title: string
  department: string
  linkedinSlug: string
  verifiedVia: 'LinkedIn Sales Navigator' | 'MCA Filings' | 'Company Registrar' | 'Email Header Sync'
  directPhone?: string
  workEmail?: string
}

export interface CommandApprovalItem {
  id: string
  leadId?: string
  company: string
  leadName: string
  value: number
  stage: Stage
  daysUncontacted: number
  decisionMaker: DecisionMaker
  reasonForApproval: string
  policyRule: string
  whatsappDraft: string
  emailDraft: {
    subject: string
    body: string
  }
  status: 'pending' | 'approved' | 'rejected'
  approvedAt?: string
  dispatchedChannel?: 'whatsapp' | 'email' | 'both'
}

export interface AutomatedSafeAction {
  id: string
  company: string
  leadName: string
  value: number
  action: string
  channel: 'CRM Sync' | 'WhatsApp Auto' | 'Calendar Queue' | 'Task Reminder'
  timestamp: string
  status: 'COMPLETED'
}

export interface AuditLogEntry {
  id: string
  timestamp: string
  agentName: string
  agentId: string
  permissionTier: 'READ_ONLY' | 'SAFE_EXECUTE' | 'GATE_HOLD' | 'HUMAN_AUTHORIZATION'
  systemTarget: string
  event: string
  payloadPreview: string
  securityHash: string
  status: 'SUCCESS' | 'ENFORCED' | 'GATE_HELD' | 'APPROVED'
}

export interface AgentExecutionStep {
  id: string
  agentName: string
  role: string
  action: string
  status: 'completed' | 'running' | 'pending'
  durationMs: number
  details: string
}

export interface CommandExecutionResult {
  commandId: string
  rawPrompt: string
  timestamp: string
  headline: string
  summaryQuote: string
  stats: {
    leadsFound: number
    leadsQualified: number
    messagesPrepared: number
    requireApproval: number
    safeAutomated: number
    totalPipelineValue: number
  }
  steps: AgentExecutionStep[]
  approvals: CommandApprovalItem[]
  automatedActions: AutomatedSafeAction[]
  auditTrail: AuditLogEntry[]
}

export const PRESET_COMMANDS = [
  {
    id: 'cmd-flagship',
    label: 'Uncontacted > 5 Days & Above ₹10L (Killer Feature)',
    prompt:
      'Find all leads that haven’t been contacted for more than 5 days, prioritize companies above ₹10 lakh potential, research the decision makers and prepare personalized WhatsApp and email follow-ups.',
    description: 'Execute multi-agent scan, decision-maker enrichment, and human-approval dispatch.',
  },
  {
    id: 'cmd-proposals',
    label: 'Expiring Proposals & Renewal Incentives',
    prompt:
      'Scan pipeline for all open proposals expiring within 7 days, recalculate margin with 5% early-closure incentive, and queue executive WhatsApp follow-ups for approval.',
    description: 'Protect pipeline velocity and prevent deal slippage.',
  },
  {
    id: 'cmd-objections',
    label: 'Overcome Open Objections & Pushback',
    prompt:
      'Audit all leads with open objections, research competitor pricing benchmarks, generate objection-handling email drafts, and tag CRM records.',
    description: 'Autonomous competitive intelligence & objection neutralization.',
  },
  {
    id: 'cmd-stale-reengage',
    label: 'Re-engage Stale B+ Opportunities',
    prompt:
      'Identify stalled B+ leads, verify company hiring signals, draft personalized re-engagement hooks, and schedule tasks on Today queue.',
    description: 'Autonomous dormant account reactivation.',
  },
]

// Default 8 high-impact enterprise leads requiring approval under Policy #ENT-402
const SEED_APPROVALS: CommandApprovalItem[] = [
  {
    id: 'appr-1',
    company: 'Adani Wilmar Agri-Logistics',
    leadName: 'Sanjay Deshmukh',
    value: 1_850_000,
    stage: 'Proposal',
    daysUncontacted: 7,
    decisionMaker: {
      name: 'Sanjay Deshmukh',
      title: 'VP Global Supply Chain & Cold Chain Operations',
      department: 'Supply Chain Management',
      linkedinSlug: 'sanjay-deshmukh-adani',
      verifiedVia: 'LinkedIn Sales Navigator',
      directPhone: '+91 98200 44112',
      workEmail: 'sanjay.deshmukh@adaniwilmar.in',
    },
    policyRule: 'Policy #ENT-402: Valuation exceeds ₹10L threshold (₹18.5L). Requires Owner sign-off before sending commercial terms.',
    reasonForApproval: 'Enterprise valuation > ₹10 Lakhs with custom fleet tracking SLA attached.',
    whatsappDraft:
      'Hi Sanjay, following up on our cold-chain telemetry discussion. We modeled the Gujarat warehouse transit delays you mentioned and identified a 32% turnaround improvement window. Can I share the updated commercial framework today?',
    emailDraft: {
      subject: 'Adani Wilmar Cold-Chain Optimization: Revised SLA & Turnaround Model',
      body: `Dear Sanjay,\n\nFollowing our review of Adani Wilmar’s multi-depot transit bottlenecks across Gujarat and Maharashtra, our enterprise team has finalized the custom telemetry rollout architecture.\n\nKey Deliverables:\n1. 24/7 autonomous IoT telemetry integration across 450 fleet assets.\n2. SLA guarantee: Sub-4 minute exception alerting for perishable cargo.\n3. Commercial pricing structured at ₹18.5L with milestone delivery terms.\n\nPlease find the confidential summary attached for your executive review.\n\nWarm regards,\nMayVexa Enterprise Command`,
    },
    status: 'pending',
  },
  {
    id: 'appr-2',
    company: 'Reliance Retail Ventures',
    leadName: 'Radhika Singhania',
    value: 2_400_000,
    stage: 'Decision',
    daysUncontacted: 9,
    decisionMaker: {
      name: 'Radhika Singhania',
      title: 'Chief Digital Officer & Head of Omnichannel Fulfillment',
      department: 'Digital Operations',
      linkedinSlug: 'radhika-singhania-rrvl',
      verifiedVia: 'MCA Filings',
      directPhone: '+91 98111 88990',
      workEmail: 'radhika.singhania@relianceretail.com',
    },
    policyRule: 'Policy #ENT-402: Tier-1 Enterprise account. Executive sign-off required for customized SLA terms.',
    reasonForApproval: 'High-visibility enterprise deal (₹24.0L) awaiting final committee sign-off.',
    whatsappDraft:
      'Hello Radhika, hope your week is off to a great start. Our autonomous forecasting engine completed the multi-store replenishment simulation for your Q3 peak. Would 15 minutes tomorrow work to walk your committee through the numbers?',
    emailDraft: {
      subject: 'Reliance Retail Omnichannel Fulfillment: Q3 Autonomous Replenishment Model',
      body: `Dear Radhika,\n\nWe understand your procurement committee convenes this Thursday regarding the Q3 omni-channel replenishment stack.\n\nWe have finalized the pilot rollout scope for 120 dark stores, reducing stockout latency from 48 hours to under 3 hours.\n\nWe look forward to confirming the execution agreement.\n\nBest regards,\nMayVexa Team`,
    },
    status: 'pending',
  },
  {
    id: 'appr-3',
    company: 'Tata AutoComp Systems',
    leadName: 'Vikramaditya Rao',
    value: 1_420_000,
    stage: 'Proposal',
    daysUncontacted: 6,
    decisionMaker: {
      name: 'Vikramaditya Rao',
      title: 'Head of Vendor Sourcing & Quality Control',
      department: 'Procurement',
      linkedinSlug: 'vikramaditya-rao-tata',
      verifiedVia: 'LinkedIn Sales Navigator',
      directPhone: '+91 99201 33445',
      workEmail: 'v.rao@tataautocomp.com',
    },
    policyRule: 'Policy #ENT-402: Valuation exceeds ₹10L (₹14.2L). Custom discount terms require authorization.',
    reasonForApproval: 'Vendor procurement proposal with custom component traceability warranty.',
    whatsappDraft:
      'Hi Vikramaditya, following our discussion on Tier-1 automotive component tracking. We incorporated your vendor audit requirements into the revised scope. Let me know if I should send over the revised agreement.',
    emailDraft: {
      subject: 'Tata AutoComp Vendor Traceability Architecture — Revised Scope',
      body: `Dear Vikramaditya,\n\nWe have updated the technical and commercial framework based on your feedback regarding Tier-1 supplier ISO compliance.\n\nTotal Contract Value: ₹14.2 Lakhs (includes onsite integration and 12-month dedicated engineering support).\n\nBest regards,\nMayVexa Solutions`,
    },
    status: 'pending',
  },
  {
    id: 'appr-4',
    company: 'Lupin Biotech & Formulations',
    leadName: 'Dr. Ananya Sen',
    value: 1_600_000,
    stage: 'Decision',
    daysUncontacted: 11,
    decisionMaker: {
      name: 'Dr. Ananya Sen',
      title: 'Director of QA & Compliance Automation',
      department: 'Regulatory Compliance',
      linkedinSlug: 'dr-ananya-sen-pharma',
      verifiedVia: 'MCA Filings',
      directPhone: '+91 97665 11223',
      workEmail: 'ananya.sen@lupinpharma.com',
    },
    policyRule: 'Policy #ENT-402: Regulated vertical (Pharma/FDA). Compliance audit trail verification mandated.',
    reasonForApproval: 'Pharma FDA compliance audit trail required prior to sending revised proposal.',
    whatsappDraft:
      'Dear Dr. Sen, our US-FDA 21 CFR Part 11 validation audit summary is ready for your team’s review. Can we schedule a brief 10-minute briefing today?',
    emailDraft: {
      subject: 'Lupin Formulations: 21 CFR Part 11 Compliance Validation Document',
      body: `Dear Dr. Sen,\n\nAs requested by your Quality Council, we have attached our certified US-FDA 21 CFR Part 11 compliance dossier and electronic signature audit trail certification.\n\nWe remain ready to proceed with the Q4 deployment across your Pune and Goa sterile manufacturing units.\n\nSincerely,\nMayVexa Compliance Office`,
    },
    status: 'pending',
  },
  {
    id: 'appr-5',
    company: 'Apollo Health City Network',
    leadName: 'Raghavan Pillai',
    value: 1_280_000,
    stage: 'Proposal',
    daysUncontacted: 8,
    decisionMaker: {
      name: 'Raghavan Pillai',
      title: 'Chief Information Officer (CIO)',
      department: 'Healthcare IT Infrastructure',
      linkedinSlug: 'raghavan-pillai-apollo',
      verifiedVia: 'LinkedIn Sales Navigator',
      directPhone: '+91 98450 77889',
      workEmail: 'r.pillai@apollohealthcity.in',
    },
    policyRule: 'Policy #ENT-402: Deal value > ₹10L. Hospital EHR integration scope requires human verification.',
    reasonForApproval: 'Healthcare network EHR database sync requiring security sign-off.',
    whatsappDraft:
      'Hi Raghavan, our team completed the HL7/FHIR data gateway mapping for your Hyderabad and Chennai facilities. Ready to share the deployment roadmap when you are.',
    emailDraft: {
      subject: 'Apollo Health EHR Gateway Integration: Technical Roadmap & Security Brief',
      body: `Dear Raghavan,\n\nOur healthcare integration engineers have validated the HL7/FHIR security protocols for the Apollo hospital network.\n\nDeployment value is approved at ₹12.8L for 14 hospital branches with full end-to-end encryption.\n\nWarm regards,\nMayVexa Healthcare IT`,
    },
    status: 'pending',
  },
  {
    id: 'appr-6',
    company: 'Godrej Agrovet Logistics',
    leadName: 'Manish Khurana',
    value: 1_150_000,
    stage: 'B+',
    daysUncontacted: 6,
    decisionMaker: {
      name: 'Manish Khurana',
      title: 'Executive Vice President — Supply Chain',
      department: 'Logistics Operations',
      linkedinSlug: 'manish-khurana-godrej',
      verifiedVia: 'MCA Filings',
      directPhone: '+91 99880 22334',
      workEmail: 'm.khurana@godrejagrovet.com',
    },
    policyRule: 'Policy #ENT-402: Potential exceeds ₹10L. Outbound message involves pricing discussion.',
    reasonForApproval: 'Agri-business supply chain deal exceeding ₹10L threshold.',
    whatsappDraft:
      'Hello Manish, we analyzed the regional distributor stock-out patterns you highlighted. Our predictive dispatch model eliminates the 4-day rural transit lag. Can I share our executive brief?',
    emailDraft: {
      subject: 'Godrej Agrovet: Predictive Dispatch Framework for Regional Warehouses',
      body: `Dear Manish,\n\nFollowing our review of seasonal crop cycle replenishment, we have prepared an executive pilot proposal valued at ₹11.5L.\n\nWe look forward to discussing the implementation roadmap.\n\nBest regards,\nMayVexa Agri-Tech Team`,
    },
    status: 'pending',
  },
  {
    id: 'appr-7',
    company: 'Havells Industrial Power',
    leadName: 'Deepak Chadha',
    value: 1_540_000,
    stage: 'Proposal',
    daysUncontacted: 12,
    decisionMaker: {
      name: 'Deepak Chadha',
      title: 'VP Commercial Sales & B2B Partnerships',
      department: 'Commercial Division',
      linkedinSlug: 'deepak-chadha-havells',
      verifiedVia: 'LinkedIn Sales Navigator',
      directPhone: '+91 98102 55667',
      workEmail: 'deepak.chadha@havells.com',
    },
    policyRule: 'Policy #ENT-402: Stale high-value lead (> 10 days uncontacted). Strategic re-engagement requires sign-off.',
    reasonForApproval: '12 days without touchpoint on ₹15.4L deal. Re-engagement incentive requires owner approval.',
    whatsappDraft:
      'Hi Deepak, checking in on the industrial switchgear dealer quotation. We added a 5% early-onboarding credit valid through this Friday. Should we lock in the dates?',
    emailDraft: {
      subject: 'Havells Industrial: Special Q3 Commercial Renewal Terms',
      body: `Dear Deepak,\n\nTo ensure your dealer onboarding is operational before the Q3 festival rush, our executive committee has authorized a 5% early-onboarding incentive on the ₹15.4L contract.\n\nPlease let us know if we can arrange the digital agreement signing.\n\nBest regards,\nMayVexa Commercial Desk`,
    },
    status: 'pending',
  },
  {
    id: 'appr-8',
    company: 'Vedanta Mining Equipment',
    leadName: 'Harish Vardhan',
    value: 2_200_000,
    stage: 'Decision',
    daysUncontacted: 14,
    decisionMaker: {
      name: 'Harish Vardhan',
      title: 'Head of Capital Equipment Sourcing & Asset Reliability',
      department: 'Heavy Equipment & Operations',
      linkedinSlug: 'harish-vardhan-vedanta',
      verifiedVia: 'Company Registrar',
      directPhone: '+91 99011 44556',
      workEmail: 'harish.vardhan@vedanta.co.in',
    },
    policyRule: 'Policy #ENT-402: High-impact deal (₹22.0L). Board-level contact requires sign-off.',
    reasonForApproval: 'High-value heavy machinery equipment contract (₹22.0L).',
    whatsappDraft:
      'Good morning Harish, we reviewed the telemetry specs for the Rajasthan mining excavation assets. Everything is validated to ISO 9001 standards. When can we finalize the final sign-off?',
    emailDraft: {
      subject: 'Vedanta Mining: Asset Telemetry Verification & Final Sign-Off',
      body: `Dear Harish,\n\nOur engineering team has signed off on the ruggedized IoT sensors for heavy mining machinery in high-temperature environments.\n\nContract value: ₹22.0 Lakhs. All regulatory certifications are enclosed.\n\nSincerely,\nMayVexa Industrial Unit`,
    },
    status: 'pending',
  },
]

// 4 Safe automated actions executed without human friction
const SEED_AUTOMATED_ACTIONS: AutomatedSafeAction[] = [
  {
    id: 'auto-1',
    company: 'Nair Foods',
    leadName: 'Arun Nair',
    value: 180_000,
    action: 'Scheduled ROI comparison reminder on Today queue for salesperson follow-up',
    channel: 'Task Reminder',
    timestamp: 'Just now · 17:42:01',
    status: 'COMPLETED',
  },
  {
    id: 'auto-2',
    company: 'Shah Clinics',
    leadName: 'Priya Shah',
    value: 220_000,
    action: 'Dispatched gentle WhatsApp re-engagement hook (Within safe automation threshold < ₹5L)',
    channel: 'WhatsApp Auto',
    timestamp: 'Just now · 17:42:02',
    status: 'COMPLETED',
  },
  {
    id: 'auto-3',
    company: 'Joshi Retail',
    leadName: 'Vikram Joshi',
    value: 260_000,
    action: 'Tagged CRM lead record with [Expiring Quote: 48h] and updated timeline',
    channel: 'CRM Sync',
    timestamp: 'Just now · 17:42:03',
    status: 'COMPLETED',
  },
  {
    id: 'auto-4',
    company: 'Malhotra Motors',
    leadName: 'Karan Malhotra',
    value: 320_000,
    action: 'Drafted calendar invite for site visit and placed on Today queue',
    channel: 'Calendar Queue',
    timestamp: 'Just now · 17:42:04',
    status: 'COMPLETED',
  },
]

// Enterprise Immutable Audit Trail
const SEED_AUDIT_TRAIL: AuditLogEntry[] = [
  {
    id: 'aud-001',
    timestamp: '17:41:58',
    agentName: 'CRM Query Engine',
    agentId: 'sys:crm-discovery-v3',
    permissionTier: 'READ_ONLY',
    systemTarget: 'Production CRM Postgres DB',
    event: 'Scanned 47 records matching criteria: lastContact >= 5 days ago',
    payloadPreview: '{"filter": {"daysUncontacted_gt": 5}, "recordsReturned": 47}',
    securityHash: 'sha256:7f4c91a08e1b2',
    status: 'SUCCESS',
  },
  {
    id: 'aud-002',
    timestamp: '17:42:00',
    agentName: 'Firmographics & Intel Agent',
    agentId: 'sys:enrich-researcher-v4',
    permissionTier: 'SAFE_EXECUTE',
    systemTarget: 'LinkedIn Sales Nav & MCA Gateway',
    event: 'Enriched 19 enterprise accounts with verified decision makers and direct emails',
    payloadPreview: '{"enrichedProfiles": 19, "dataPoints": ["title", "revenue", "techStack"]}',
    securityHash: 'sha256:8b2a3c77e01f4',
    status: 'SUCCESS',
  },
  {
    id: 'aud-003',
    timestamp: '17:42:01',
    agentName: 'Predictive Scorer',
    agentId: 'sys:valuation-scorer-v2',
    permissionTier: 'SAFE_EXECUTE',
    systemTarget: 'In-Memory ML Inference',
    event: 'Calculated LTV potential: 19 leads qualified with potential >= ₹10 Lakhs',
    payloadPreview: '{"qualified": 19, "medianValueLakhs": 15.8, "confidence": 0.94}',
    securityHash: 'sha256:1a998c234de67',
    status: 'SUCCESS',
  },
  {
    id: 'aud-004',
    timestamp: '17:42:02',
    agentName: 'Personalized Copywriter',
    agentId: 'sys:multichannel-outreach-v2',
    permissionTier: 'SAFE_EXECUTE',
    systemTarget: 'Outreach Deliverables Engine',
    event: 'Generated 12 personalized WhatsApp & Email communications citing friction vectors',
    payloadPreview: '{"messagesDrafted": 12, "channels": ["WhatsApp", "Corporate Email"]}',
    securityHash: 'sha256:3d5e7188bc09a',
    status: 'SUCCESS',
  },
  {
    id: 'aud-005',
    timestamp: '17:42:03',
    agentName: 'Enterprise Governance Gate',
    agentId: 'sys:governance-guardrail',
    permissionTier: 'GATE_HOLD',
    systemTarget: 'Approval Workflow Dispatcher',
    event: 'Enforced Policy #ENT-402: Held 8 high-impact accounts (> ₹10L) for Human-in-the-Loop Sign-off',
    payloadPreview: '{"rule": "ENT-402", "dealsHeld": 8, "totalHeldValueLakhs": 134.4}',
    securityHash: 'sha256:9c8821aa004ef',
    status: 'ENFORCED',
  },
  {
    id: 'aud-006',
    timestamp: '17:42:04',
    agentName: 'Autonomous Scheduler',
    agentId: 'sys:safe-auto-executor',
    permissionTier: 'SAFE_EXECUTE',
    systemTarget: 'CRM Today Queue & Timeline',
    event: 'Auto-dispatched 4 low-risk scheduled tasks without human friction',
    payloadPreview: '{"autoExecuted": 4, "tasksCreated": 3, "whatsappSent": 1}',
    securityHash: 'sha256:4f1189a0b99de',
    status: 'SUCCESS',
  },
]

export const AGENT_PIPELINE_STEPS: AgentExecutionStep[] = [
  {
    id: 'step-1',
    agentName: 'CRM Ingestion & Discovery Agent',
    role: 'Scanning Database',
    action: 'Filter uncontacted accounts (> 5 days)',
    status: 'completed',
    durationMs: 220,
    details: 'Found 47 matching records across enterprise and commercial tiers.',
  },
  {
    id: 'step-2',
    agentName: 'Firmographics & Intel Agent',
    role: 'Decision-Maker Intelligence',
    action: 'Verify MCA filings & LinkedIn profiles',
    status: 'completed',
    durationMs: 480,
    details: 'Extracted 19 C-level & VP decision-makers with direct verified channels.',
  },
  {
    id: 'step-3',
    agentName: 'Predictive Prioritization Agent',
    role: 'Valuation & Intent Scoring',
    action: 'Filter companies above ₹10 Lakhs potential',
    status: 'completed',
    durationMs: 310,
    details: 'Ranked 19 qualified accounts with collective pipeline potential of ₹1.34 Cr.',
  },
  {
    id: 'step-4',
    agentName: 'Personalized Copywriter Agent',
    role: 'Multi-Channel Synthesis',
    action: 'Draft WhatsApp & Email messages',
    status: 'completed',
    durationMs: 620,
    details: 'Prepared 12 tailored messages addressing verified company friction points.',
  },
  {
    id: 'step-5',
    agentName: 'Enterprise Governance Gate',
    role: 'Compliance & Authorization',
    action: 'Enforce Policy #ENT-402 (Deals > ₹10L)',
    status: 'completed',
    durationMs: 140,
    details: 'Secured 8 high-impact dispatches in human approval queue; 4 safe dispatches automated.',
  },
]

export function executeCommandModeWorkflow(
  prompt: string,
  _existingLeads: Lead[] = []
): CommandExecutionResult {
  // Use the exact flagship numbers and structure requested by the user
  const leadsFound = 47
  const leadsQualified = 19
  const messagesPrepared = 12
  const requireApproval = 8
  const safeAutomated = 4

  const totalPipelineValue = SEED_APPROVALS.reduce((sum, item) => sum + item.value, 0)

  return {
    commandId: uid('cmd'),
    rawPrompt: prompt,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    headline: `I've done it. ${leadsFound} leads found. ${leadsQualified} qualified. ${messagesPrepared} messages prepared. ${requireApproval} require your approval.`,
    summaryQuote:
      'Autonomous execution finished in 1.77 seconds. 8 high-value communications held at governance gate; 4 safe actions automated directly into CRM.',
    stats: {
      leadsFound,
      leadsQualified,
      messagesPrepared,
      requireApproval,
      safeAutomated,
      totalPipelineValue,
    },
    steps: AGENT_PIPELINE_STEPS,
    approvals: SEED_APPROVALS.map((a) => ({ ...a })),
    automatedActions: SEED_AUTOMATED_ACTIONS.map((action) => ({ ...action })),
    auditTrail: SEED_AUDIT_TRAIL.map((entry) => ({ ...entry })),
  }
}
