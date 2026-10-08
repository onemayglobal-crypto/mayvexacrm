import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { CaptureSheet } from './components/CaptureSheet'
import { LeadDrawer } from './components/LeadDrawer'
import { Sidebar } from './components/Sidebar'
import { CaptureScreen } from './screens/CaptureScreen'
import { AiSummariesScreen } from './screens/AiSummariesScreen'
import { CommandModeScreen } from './screens/CommandModeScreen'
import { InsightsScreen } from './screens/InsightsScreen'
import { LoginScreen } from './screens/LoginScreen'
import { PipelineScreen } from './screens/PipelineScreen'
import { TodayScreen } from './screens/TodayScreen'
import { CrmProvider, useCrm } from './store/CrmContext'
import { useLocalStorage } from './hooks/useLocalStorage'
import type { Tab } from './types'

function Shell({ onLogout }: { onLogout: () => void }) {
  const { store, unreadCount, markNotificationsRead, dismissNotification } = useCrm()
  const [tab, setTab] = useState<Tab>('today')
  const [leadId, setLeadId] = useState<string | null>(null)
  const [showNotes, setShowNotes] = useState(false)
  const [showCaptureSheet, setShowCaptureSheet] = useState(false)
  const [captureType, setCaptureType] = useState<string>('lead')

  const openLead = (id: string) => setLeadId(id)

  return (
    <div className="flex min-h-svh w-full bg-[#07090f] text-neutral-100">
      <Sidebar
        active={tab}
        onChange={(t) => {
          if (t === 'capture') {
            setShowCaptureSheet(true)
          } else {
            setTab(t)
          }
        }}
        unread={unreadCount}
        onBell={() => {
          setShowNotes((open) => !open)
          markNotificationsRead()
        }}
        onLogout={onLogout}
      />
      <div className="relative min-w-0 flex-1">
        {showNotes && (
          <div className="animate-rise absolute top-6 left-4 z-30 w-80 rounded-2xl border border-white/[0.08] bg-[#0e111a]/95 p-2 shadow-[0_24px_60px_rgba(0,0,0,0.5)] backdrop-blur-xl">
            <div className="flex items-center justify-between px-3 py-2">
              <p className="text-[14px] font-medium">Notifications</p>
              <button
                type="button"
                onClick={() => setShowNotes(false)}
                aria-label="Close notifications"
                className="flex size-7 items-center justify-center rounded-lg text-neutral-500 hover:bg-white/[0.06] hover:text-white"
              >
                <X size={15} />
              </button>
            </div>
            <ul className="max-h-80 overflow-y-auto">
              {store.notifications.map((item) => (
                <li
                  key={item.id}
                  className="group flex items-start gap-3 rounded-xl px-3 py-2.5 text-[13px] text-neutral-300 hover:bg-white/[0.04]"
                >
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[#7c5cff]" />
                  <span className="flex-1 leading-relaxed">{item.text}</span>
                  <button
                    type="button"
                    onClick={() => dismissNotification(item.id)}
                    aria-label="Dismiss notification"
                    className="flex size-6 shrink-0 items-center justify-center rounded-md text-neutral-500 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-white/[0.08] hover:text-white"
                  >
                    <X size={13} />
                  </button>
                </li>
              ))}
              {store.notifications.length === 0 && (
                <li className="px-3 py-6 text-center text-[13px] text-neutral-500">You're all caught up.</li>
              )}
            </ul>
          </div>
        )}
        <main className="h-svh overflow-auto bg-[radial-gradient(ellipse_at_top_right,rgba(73,124,255,0.07),transparent_45%)] px-10 py-9">
          {tab === 'today' && (
            <TodayScreen onOpenLead={openLead} onInsights={() => setTab('insights')} />
          )}
          {tab === 'pipeline' && (
            <PipelineScreen onOpenLead={openLead} onCapture={() => setShowCaptureSheet(true)} />
          )}
          {tab === 'capture' && (
            <CaptureScreen
              key={captureType}
              type={captureType}
              onCreated={(id, createdType) => {
                if (['lead', 'contact', 'opportunity', 'referral'].includes(createdType)) {
                  setLeadId(id)
                  setTab('pipeline')
                } else {
                  setTab('today')
                }
              }}
            />
          )}
          {tab === 'insights' && (
            <InsightsScreen onOpenLead={openLead} onPipeline={() => setTab('pipeline')} />
          )}
          {tab === 'ai' && (
            <AiSummariesScreen
              onOpenLead={openLead}
              onPipeline={() => setTab('pipeline')}
              onCommandMode={() => setTab('command')}
            />
          )}
          {tab === 'command' && (
            <CommandModeScreen onOpenLead={openLead} onPipeline={() => setTab('pipeline')} />
          )}
        </main>
        
        <button
          type="button"
          onClick={() => setShowCaptureSheet(true)}
          className="absolute right-8 bottom-8 flex size-14 items-center justify-center rounded-2xl bg-[#7c5cff] text-white shadow-[0_12px_32px_rgba(124,92,255,0.5)] transition-all hover:scale-105 hover:bg-[#8b6dff] active:scale-95"
          aria-label="Open capture options"
        >
          <Plus size={26} strokeWidth={2.2} />
        </button>
      </div>
      <LeadDrawer leadId={leadId} onClose={() => setLeadId(null)} />
      {showCaptureSheet && (
        <CaptureSheet
          onClose={() => setShowCaptureSheet(false)}
          onSelect={(type) => {
            setShowCaptureSheet(false)
            setCaptureType(type)
            setTab('capture')
          }}
        />
      )}
    </div>
  )
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useLocalStorage('maycrm.auth', false)

  if (!isAuthenticated) {
    return <LoginScreen onLogin={() => setIsAuthenticated(true)} />
  }

  return (
    <CrmProvider>
      <Shell onLogout={() => setIsAuthenticated(false)} />
    </CrmProvider>
  )
}

export default App
