import { TestActions } from './TestActions'

export const metadata = { title: 'Testing' }

export default function TestingSettingsPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <p className="text-sm text-(--text-secondary)">
        Trigger end-to-end tests of the HQ stack. Safe to run at any time — test leads are
        marked and easy to delete.
      </p>
      <TestActions />
    </div>
  )
}
