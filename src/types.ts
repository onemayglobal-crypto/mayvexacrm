export type Grade = 'A+' | 'A' | 'B' | 'C'
export type Stage = 'A+' | 'B+' | 'C+' | 'Proposal' | 'Decision' | 'Won' | 'Lost'
export type Tab = 'today' | 'pipeline' | 'capture' | 'insights'
export type TaskKind = 'overdue' | 'waiting' | 'followup' | 'call' | 'meeting' | 'todo'

export const STAGES: Stage[] = ['A+', 'B+', 'C+', 'Proposal', 'Decision', 'Won', 'Lost']

export function migrateLeadStage(stage: string, grade: Grade): Stage {
  if ((STAGES as readonly string[]).includes(stage)) return stage as Stage
  if (stage === 'Negotiation') return 'Decision'
  if (stage === 'Won' || stage === 'Lost' || stage === 'Proposal') return stage as Stage
  if (grade === 'A+') return 'A+'
  if (grade === 'C') return 'C+'
  return 'B+'
}

export const GRADES: Grade[] = ['A+', 'A', 'B', 'C']

export const GRADE_WEIGHT: Record<Grade, number> = {
  'A+': 0.9,
  A: 0.7,
  B: 0.4,
  C: 0.2,
}

export interface Lead {
  id: string
  name: string
  company: string
  phone: string
  email: string
  value: number
  grade: Grade
  score: number
  stage: Stage
  nextAction: string
  notes: string
  lastContact?: string
  proposalSent?: string
  proposalExpires?: string
  meetings: number
  objectionsOpen: boolean
  createdAt: string
  closedAt?: string
}

export interface Task {
  id: string
  leadId?: string
  kind: TaskKind
  title: string
  detail: string
  actionLabel: string
  doneLabel: string
  done: boolean
  dueDate?: string
}

export interface AppNotification {
  id: string
  text: string
  read: boolean
  createdAt: string
}

export interface Settings {
  monthlyGoal: number
  streakDays: number
}

export interface CrmStore {
  leads: Lead[]
  tasks: Task[]
  notifications: AppNotification[]
  settings: Settings
}

export const EMPTY_LEAD: Omit<Lead, 'id' | 'createdAt'> = {
  name: '',
  company: '',
  phone: '',
  email: '',
  value: 0,
  grade: 'B',
  score: 50,
  stage: 'B+',
  nextAction: '',
  notes: '',
  meetings: 0,
  objectionsOpen: false,
}
