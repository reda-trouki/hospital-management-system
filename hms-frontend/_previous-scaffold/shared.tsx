import type { ReactNode } from 'react'
import { Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  )
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  )
}

const variants: Record<string, 'success' | 'warning' | 'info' | 'destructive' | 'secondary'> = {
  Admitted: 'warning',
  Outpatient: 'info',
  Discharged: 'secondary',
  Scheduled: 'info',
  Completed: 'success',
  Cancelled: 'destructive',
  Paid: 'success',
  Pending: 'warning',
  Overdue: 'destructive',
  Available: 'success',
  'In Surgery': 'warning',
  'Off Duty': 'secondary',
}

export function StatusBadge({ status }: { status: string }) {
  return <Badge variant={variants[status] ?? 'secondary'}>{status}</Badge>
}

export function DeleteButton({ onConfirm, label }: { onConfirm: () => void; label: string }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-8 text-muted-foreground hover:text-destructive"
      aria-label={`Delete ${label}`}
      onClick={() => {
        if (confirm(`Delete ${label}? This cannot be undone.`)) onConfirm()
      }}
    >
      <Trash2 className="size-4" />
    </Button>
  )
}

export function EmptyRow({ cols, text }: { cols: number; text: string }) {
  return (
    <tr>
      <td colSpan={cols} className="p-10 text-center text-sm text-muted-foreground">
        {text}
      </td>
    </tr>
  )
}
