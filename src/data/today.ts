export type Grade = 'A+' | 'A' | 'B' | 'C'

export interface MonthlyGoal {
  achieved: string
  target: string
  percent: number
  status: string
  streakDays: number
}

export interface PriorityMove {
  leadName: string
  grade: Grade
  score: number
  action: string
  reason: string
  phone: string
}

export type TaskKind = 'overdue' | 'waiting'

export interface TodayTask {
  id: string
  kind: TaskKind
  title: string
  detail: string
  actionLabel: string
  doneLabel: string
  done: boolean
}

export interface Insight {
  text: string
  actionLabel: string
}

export interface TodayData {
  goal: MonthlyGoal
  weightedPipeline: string
  meetingsThisWeek: number
  notifications: number
  priority: PriorityMove
  tasks: TodayTask[]
  insight: Insight
}

export const demoToday: TodayData = {
  goal: {
    achieved: '₹4.2L',
    target: '₹6L',
    percent: 70,
    status: 'On track',
    streakDays: 6,
  },
  weightedPipeline: '₹12.4L',
  meetingsThisWeek: 5,
  notifications: 3,
  priority: {
    leadName: 'Ravi Kumar',
    grade: 'A+',
    score: 86,
    action: 'Ask for the decision',
    reason:
      'Proposal of ₹2.4L expires in 2 days. Two positive meetings, no open objection left.',
    phone: '+919876543210',
  },
  tasks: [
    {
      id: 'meena-brochure',
      kind: 'overdue',
      title: 'Keep your promise to Meena',
      detail: 'Send the brochure. Due yesterday.',
      actionLabel: 'Done',
      doneLabel: 'Undo',
      done: false,
    },
    {
      id: 'arun-proposal',
      kind: 'waiting',
      title: 'Chase proposal: Arun',
      detail: 'Sent 4 days ago, no reply.',
      actionLabel: 'Chase',
      doneLabel: 'Chased',
      done: false,
    },
  ],
  insight: {
    text: '2 leads ready to move B to A',
    actionLabel: 'Review',
  },
}
