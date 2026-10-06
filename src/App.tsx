import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { CaptureSheet } from './components/CaptureSheet'
import { LeadDrawer } from './components/LeadDrawer'
import { Sidebar } from './components/Sidebar'
import { CaptureScreen } from './screens/CaptureScreen'
import { InsightsScreen } from './screens/InsightsScreen'
import { LoginScreen } from './screens/LoginScreen'
import { PipelineScreen } from './screens/PipelineScreen'
import { TodayScreen } from './screens/TodayScreen'
import { CrmProvider, useCrm } from './store/CrmContext'
import { useLocalStorage } from './hooks/useLocalStorage'
import type { Tab } from './types'

function Shell() {
  const { store, unreadCount, markNotificationsRead, dismissNotification } = useCrm()
  const [tab, setTab] = useState<Tab>('today')
  const [leadId, setLeadId] = useState<string | null>(null)
  const [showNotes, setShowNotes] = useState(false)
  const [showCaptureSheet, setShowCaptureSheet] = useState(false)
  const [captureType, setCaptureType] = useState<string>('lead')

  const openLead = (id: string) => setLeadId(id)

  return (
    <div className="flex min-h-svh w-full bg-[#141415] text-neutral-100">
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
      />
      <div className="relative min-w-0 flex-1">
        {showNotes && (
          <div className="absolute top-4 right-8 z-30 w-80 rounded-2xl border border-[#323235] bg-[#1b1b1d] p-4 shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-medium">Notifications</p>
              <button
                type="button"
                onClick={() => setShowNotes(false)}
                aria-label="Close notifications"
                className="flex size-8 items-center justify-center rounded-full bg-[#1f1f22] text-neutral-300 hover:text-neutral-50"
              >
                <X size={16} />
              </button>
            </div>
            <ul className="space-y-2">
              {store.notifications.map((item) => (
                <li key={item.id} className="group flex items-start justify-between gap-2 text-sm text-neutral-300">
                  <span className="mt-0.5">{item.text}</span>
                  <button
                    type="button"
                    onClick={() => dismissNotification(item.id)}
                    className="flex size-6 shrink-0 items-center justify-center rounded-full text-neutral-500 opacity-0 transition-opacity hover:bg-[#2a2a2d] hover:text-neutral-200 group-hover:opacity-100"
                  >
                    <X size={14} />
                  </button>
                </li>
              ))}
              {store.notifications.length === 0 && (
                <li className="text-sm text-neutral-500">Nothing waiting.</li>
              )}
            </ul>
          </div>
        )}
        <main className="h-svh overflow-auto p-8">
          {tab === 'today' && (
            <TodayScreen onOpenLead={openLead} onInsights={() => setTab('insights')} />
          )}
          {tab === 'pipeline' && (
            <PipelineScreen onOpenLead={openLead} onCapture={() => setShowCaptureSheet(true)} />
          )}
          {tab === 'capture' && (
            <CaptureScreen
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
        </main>
        
        <button
          type="button"
          onClick={() => setShowCaptureSheet(true)}
          className="absolute right-8 bottom-8 flex size-14 items-center justify-center rounded-full bg-[#2f7ef0] text-white shadow-lg shadow-blue-900/40 transition-transform hover:scale-105 active:scale-95"
          aria-label="Open capture options"
        >
          <Plus size={28} strokeWidth={2} />
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
      <Shell />
    </CrmProvider>
  )
}

export default App
