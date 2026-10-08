import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react'
import { seedStore, taskFromLead } from '../data/seed'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { uid } from '../lib/format'
import type { CrmStore, Lead, Settings, Task } from '../types'
import { GRADE_WEIGHT, inferLeadType, migrateLeadStage } from '../types'

interface CrmContextValue {
  store: CrmStore
  addLead: (lead: Omit<Lead, 'id' | 'createdAt'>) => Lead
  updateLead: (id: string, patch: Partial<Lead>) => void
  deleteLead: (id: string) => void
  upsertTask: (task: Task) => void
  toggleTask: (id: string) => void
  deleteTask: (id: string) => void
  addTask: (task: Omit<Task, 'id'>) => void
  updateSettings: (patch: Partial<Settings>) => void
  markNotificationsRead: () => void
  dismissNotification: (id: string) => void
  weightedPipeline: number
  monthlyAchieved: number
  meetingsThisWeek: number
  unreadCount: number
}

const CrmContext = createContext<CrmContextValue | null>(null)

function thisWeekStart() {
  const d = new Date()
  const day = d.getDay()
  const diff = day === 0 ? 6 : day - 1
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - diff)
  return d
}

export function CrmProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useLocalStorage<CrmStore>('maycrm.v4', seedStore)

  useEffect(() => {
    setStore((prev) => {
      let changed = false
      const leads = prev.leads.map((lead) => {
        const stage = migrateLeadStage(String(lead.stage), lead.grade)
        if (stage === lead.stage && lead.type) return lead
        changed = true
        return { ...lead, stage, type: inferLeadType({ ...lead, stage }) }
      })
      return changed ? { ...prev, leads } : prev
    })
  }, [setStore])

  const value = useMemo<CrmContextValue>(() => {
    const addLead = (input: Omit<Lead, 'id' | 'createdAt'>) => {
      const lead: Lead = {
        ...input,
        id: uid('lead'),
        createdAt: new Date().toISOString(),
        score: Math.min(99, Math.max(1, Math.round(input.score))),
      }
      const followUp = taskFromLead(lead)
      setStore((prev) => ({
        ...prev,
        leads: [lead, ...prev.leads],
        tasks: followUp ? [followUp, ...prev.tasks] : prev.tasks,
        notifications: [
          {
            id: uid('n'),
            text: `New lead captured: ${lead.name}.`,
            read: false,
            createdAt: new Date().toISOString(),
          },
          ...prev.notifications,
        ],
      }))
      return lead
    }

    const updateLead = (id: string, patch: Partial<Lead>) => {
      setStore((prev) => ({
        ...prev,
        leads: prev.leads.map((lead) => {
          if (lead.id !== id) return lead
          const next = { ...lead, ...patch }
          if (patch.stage === 'Won' && lead.stage !== 'Won') {
            next.closedAt = new Date().toISOString()
          }
          if (patch.stage && patch.stage !== 'Won') {
            next.closedAt = undefined
          }
          return next
        }),
      }))
    }

    const deleteLead = (id: string) => {
      setStore((prev) => ({
        ...prev,
        leads: prev.leads.filter((lead) => lead.id !== id),
        tasks: prev.tasks.filter((task) => task.leadId !== id),
      }))
    }

    const upsertTask = (task: Task) => {
      setStore((prev) => {
        const exists = prev.tasks.some((item) => item.id === task.id)
        return {
          ...prev,
          tasks: exists
            ? prev.tasks.map((item) => (item.id === task.id ? task : item))
            : [task, ...prev.tasks],
        }
      })
    }

    const addTask = (task: Omit<Task, 'id'>) => {
      upsertTask({ ...task, id: uid('task') })
    }

    const toggleTask = (id: string) => {
      setStore((prev) => ({
        ...prev,
        tasks: prev.tasks.map((task) =>
          task.id === id ? { ...task, done: !task.done } : task,
        ),
      }))
    }

    const deleteTask = (id: string) => {
      setStore((prev) => ({
        ...prev,
        tasks: prev.tasks.filter((task) => task.id !== id),
      }))
    }

    const updateSettings = (patch: Partial<Settings>) => {
      setStore((prev) => ({
        ...prev,
        settings: { ...prev.settings, ...patch },
      }))
    }

    const markNotificationsRead = () => {
      setStore((prev) => ({
        ...prev,
        notifications: prev.notifications.map((item) => ({ ...item, read: true })),
      }))
    }

    const dismissNotification = (id: string) => {
      setStore((prev) => ({
        ...prev,
        notifications: prev.notifications.filter((item) => item.id !== id),
      }))
    }

    const openLeads = store.leads.filter((lead) => lead.stage !== 'Won' && lead.stage !== 'Lost')
    const weightedPipeline = openLeads.reduce(
      (sum, lead) => sum + lead.value * GRADE_WEIGHT[lead.grade],
      0,
    )

    const month = new Date().getMonth()
    const year = new Date().getFullYear()
    const monthlyAchieved = store.leads
      .filter((lead) => {
        if (lead.stage !== 'Won') return false
        const closed = lead.closedAt ? new Date(lead.closedAt) : new Date(lead.createdAt)
        return closed.getMonth() === month && closed.getFullYear() === year
      })
      .reduce((sum, lead) => sum + lead.value, 0)

    const weekStart = thisWeekStart()
    const meetingsThisWeek = store.leads.filter((lead) => {
      if (lead.stage === 'Won' || lead.stage === 'Lost') return false
      if (!lead.lastContact) return false
      return new Date(lead.lastContact) >= weekStart
    }).length

    const unreadCount = store.notifications.filter((item) => !item.read).length

    return {
      store,
      addLead,
      updateLead,
      deleteLead,
      upsertTask,
      addTask,
      toggleTask,
      deleteTask,
      updateSettings,
      markNotificationsRead,
      dismissNotification,
      weightedPipeline,
      monthlyAchieved,
      meetingsThisWeek,
      unreadCount,
    }
  }, [store, setStore])

  return <CrmContext.Provider value={value}>{children}</CrmContext.Provider>
}

export function useCrm() {
  const ctx = useContext(CrmContext)
  if (!ctx) throw new Error('useCrm must be used inside CrmProvider')
  return ctx
}
