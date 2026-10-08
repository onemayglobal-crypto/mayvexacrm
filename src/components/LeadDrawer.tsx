import { useState } from 'react'
import { Mail, MessageCircle, Phone, X } from 'lucide-react'
import { rupeesToLakhs } from '../lib/format'
import { ghostBtn, iconBtn, initials, stageColor } from '../lib/ui'
import { useCrm } from '../store/CrmContext'
import { inferLeadType } from '../types'
import { GradeBadge } from './GradeBadge'
import { TypeTag } from './TypeTag'
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
    <div className="fixed inset-0 z-40 flex justify-end bg-black/60 backdrop-blur-sm">
      <button type="button" className="h-full flex-1" aria-label="Close drawer" onClick={onClose} />
      <aside className="animate-rise h-full w-full max-w-xl overflow-y-auto border-l border-white/[0.06] bg-[#0b0d14]">
        <div className="relative overflow-hidden border-b border-white/[0.06] px-7 pt-7 pb-6">
          <div className="pointer-events-none absolute -top-20 -right-20 size-56 rounded-full bg-[#7c5cff]/15 blur-3xl" />
          <div className="relative flex items-start gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#7c5cff] text-[15px] font-semibold text-white">
              {initials(lead.name)}
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-[20px] font-semibold tracking-tight text-white">{lead.name}</h2>
              <p className="truncate text-[13px] text-neutral-400">{lead.company || 'No company'}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px] text-neutral-400">
                <TypeTag type={inferLeadType(lead)} />
                <GradeBadge grade={lead.grade} />
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/[0.05] px-2 py-1">
                  <span className="size-1.5 rounded-full" style={{ background: stageColor[lead.stage] }} />
                  {lead.stage}
                </span>
                <span className="rounded-lg bg-white/[0.05] px-2 py-1 font-medium text-neutral-200">
                  {rupeesToLakhs(lead.value)}
                </span>
              </div>
            </div>
            <button type="button" onClick={onClose} aria-label="Close" className={iconBtn}>
              <X size={18} />
            </button>
          </div>
          {(lead.phone || lead.email) && (
            <div className="relative mt-5 flex gap-2">
              {lead.phone && (
                <a href={`tel:${lead.phone}`} className={`${ghostBtn} flex-1`}>
                  <Phone size={15} /> Call
                </a>
              )}
              {digits && (
                <a href={`https://wa.me/${digits}`} target="_blank" rel="noreferrer" className={`${ghostBtn} flex-1`}>
                  <MessageCircle size={15} /> WhatsApp
                </a>
              )}
              {lead.email && (
                <a href={`mailto:${lead.email}`} className={`${ghostBtn} flex-1`}>
                  <Mail size={15} /> Email
                </a>
              )}
            </div>
          )}
        </div>
        <div className="px-7 py-7">
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
        </div>
      </aside>
    </div>
  )
}
