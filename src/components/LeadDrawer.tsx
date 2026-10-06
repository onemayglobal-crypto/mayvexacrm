import { useState } from 'react'
import { MessageCircle, Phone, X } from 'lucide-react'
import { useCrm } from '../store/CrmContext'
import { blankDraft, draftFromLead, LeadForm } from './LeadForm'
import type { LeadDraft } from './LeadForm'

interface LeadDrawerProps {
  leadId: string | null
  onClose: () => void
}

export function LeadDrawer({ leadId, onClose }: LeadDrawerProps) {
  const { store, updateLead, deleteLead } = useCrm()
  const lead = store.leads.find((item) => item.id === leadId)
  const [draft, setDraft] = useState<LeadDraft>(blankDraft())
  const [syncedId, setSyncedId] = useState<string | null>(null)

  if (lead && syncedId !== lead.id) {
    setSyncedId(lead.id)
    setDraft(draftFromLead(lead))
  }

  if (!leadId || !lead) return null

  const digits = lead.phone.replace(/\D/g, '')

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/50">
      <button type="button" className="h-full flex-1" aria-label="Close drawer" onClick={onClose} />
      <aside className="h-full w-full max-w-xl overflow-y-auto border-l border-[#262628] bg-[#161617] p-6">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <p className="text-xs text-neutral-500">Edit lead</p>
            <h2 className="text-xl text-neutral-50">{lead.name}</h2>
            <p className="text-sm text-neutral-400">{lead.company}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-9 items-center justify-center rounded-full bg-[#1f1f22] text-neutral-300"
          >
            <X size={18} />
          </button>
        </div>
        <div className="mb-5 flex gap-2">
          {lead.phone && (
            <a
              href={`tel:${lead.phone}`}
              className="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-[#323235] bg-[#1f1f22] text-sm"
            >
              <Phone size={15} /> Call
            </a>
          )}
          {digits && (
            <a
              href={`https://wa.me/${digits}`}
              target="_blank"
              rel="noreferrer"
              className="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-[#323235] bg-[#1f1f22] text-sm"
            >
              <MessageCircle size={15} /> WhatsApp
            </a>
          )}
        </div>
        <LeadForm
          value={draft}
          onChange={setDraft}
          submitLabel="Save changes"
          onSubmit={() => {
            updateLead(lead.id, draft)
            onClose()
          }}
          onDelete={() => {
            if (confirm(`Delete ${lead.name}?`)) {
              deleteLead(lead.id)
              onClose()
            }
          }}
        />
      </aside>
    </div>
  )
}
