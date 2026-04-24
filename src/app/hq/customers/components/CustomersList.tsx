'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserPlus, X } from 'lucide-react'
import type { PipelineRow } from '@/lib/pipeline'
import { PipelineList } from '@/components/hq/PipelineList'
import NewCustomerForm from './NewCustomerForm'

export function CustomersList({ rows }: { rows: PipelineRow[] }) {
  const router = useRouter()
  const [showNew, setShowNew] = useState(false)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <span className="text-[13px] text-(--text-secondary)">
          {rows.length} customer{rows.length === 1 ? '' : 's'}
        </span>
        <button
          type="button"
          onClick={() => setShowNew((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-3 py-1.5 text-[13px] font-semibold text-white active:scale-95 transition-transform"
        >
          {showNew ? <X size={14} strokeWidth={2.4} /> : <UserPlus size={14} strokeWidth={2.4} />}
          {showNew ? 'Cancel' : 'New Customer'}
        </button>
      </div>

      {showNew && (
        <NewCustomerForm
          onCreate={() => {
            setShowNew(false)
            router.refresh()
          }}
          onCancel={() => setShowNew(false)}
        />
      )}

      <PipelineList rows={rows} hideFilters variant="messages" />
    </div>
  )
}
