import { useState, type ReactNode } from "react"
import { ChevronLeft, ChevronRight, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TableCell, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"

type V = "default" | "secondary" | "success" | "warning" | "danger" | "info" | "outline"
const variants: Record<string, V> = {
  Admitted: "info", Outpatient: "warning", Discharged: "secondary",
  Scheduled: "info", Completed: "success", Cancelled: "danger", "In Progress": "warning",
  Paid: "success", Pending: "warning", Overdue: "danger", Partial: "info", Dispensed: "success",
  Available: "success", "In Surgery": "warning", "On Leave": "secondary",
  Ordered: "secondary", Routine: "secondary", Urgent: "warning", STAT: "danger",
  Normal: "success", Abnormal: "warning", Critical: "danger",
  Waiting: "warning", "In Treatment": "info",
  Morning: "info", Evening: "warning", Night: "default", Off: "secondary",
}
export const StatusBadge = ({ status }: { status: string }) => <Badge variant={variants[status] ?? "secondary"}>{status}</Badge>

export const Field = ({ label, children, className }: { label: string; children: ReactNode; className?: string }) => (
  <div className={cn("grid gap-2", className)}><Label>{label}</Label>{children}</div>
)

export function TextField({ label, value, onChange, className, ...p }: { label: string; value: string; onChange: (v: string) => void; className?: string } & Omit<React.ComponentProps<"input">, "onChange" | "value">) {
  return <Field label={label} className={className}><Input value={value} onChange={(e) => onChange(e.target.value)} {...p} /></Field>
}

export type Opt = string | { value: string; label: string }
export function SelectField({ label, value, onChange, options, placeholder, className }: { label: string; value: string; onChange: (v: string) => void; options: Opt[]; placeholder?: string; className?: string }) {
  return (
    <Field label={label} className={className}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger><SelectValue placeholder={placeholder ?? "Select…"} /></SelectTrigger>
        <SelectContent>
          {options.map((o) => { const v = typeof o === "string" ? o : o.value; const l = typeof o === "string" ? o : o.label; return <SelectItem key={v} value={v}>{l}</SelectItem> })}
        </SelectContent>
      </Select>
    </Field>
  )
}

type Setter<T> = <K extends keyof T>(k: K, v: T[K]) => void
function FormBody<T extends Record<string, unknown>>({ title, description, initial, onSubmit, close, submitLabel, valid, children }: {
  title: string; description?: string; initial: T; onSubmit: (f: T) => void; close: () => void; submitLabel: string
  valid?: (f: T) => boolean; children: (f: T, set: Setter<T>) => ReactNode
}) {
  const [f, setF] = useState<T>(initial)
  const set: Setter<T> = (k, v) => setF((s) => ({ ...s, [k]: v }))
  return (
    <form className="grid gap-4" onSubmit={(e) => { e.preventDefault(); if (valid && !valid(f)) return; onSubmit(f); close() }}>
      <DialogHeader><DialogTitle>{title}</DialogTitle>{description ? <DialogDescription>{description}</DialogDescription> : <DialogDescription className="sr-only">{title}</DialogDescription>}</DialogHeader>
      {children(f, set)}
      <DialogFooter><Button type="submit" disabled={valid ? !valid(f) : false}>{submitLabel}</Button></DialogFooter>
    </form>
  )
}

export function FormDialog<T extends Record<string, unknown>>({ title, description, trigger, initial, onSubmit, submitLabel = "Save", valid, children, className }: {
  title: string; description?: string; trigger: ReactNode; initial: T; onSubmit: (f: T) => void; submitLabel?: string
  valid?: (f: T) => boolean; children: (f: T, set: Setter<T>) => ReactNode; className?: string
}) {
  const [open, setOpen] = useState(false)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className={className}>
        <FormBody {...{ title, description, initial, onSubmit, submitLabel, valid, children }} close={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}

export function StatCard({ label, value, sub, icon: Icon, tone }: { label: string; value: ReactNode; sub?: string; icon: React.ComponentType<{ className?: string }>; tone?: "danger" | "warning" }) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-3 p-6">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className={cn("mt-2 text-2xl font-semibold tracking-tight lg:text-3xl", tone === "danger" && "text-destructive")}>{value}</p>
          {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
        </div>
        <div className={cn("shrink-0 rounded-lg bg-accent p-2.5 text-accent-foreground", tone === "danger" && "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300", tone === "warning" && "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300")}><Icon className="size-5" /></div>
      </CardContent>
    </Card>
  )
}

export const EmptyRow = ({ cols, text = "Nothing here yet." }: { cols: number; text?: string }) => (
  <TableRow><TableCell colSpan={cols} className="h-24 text-center text-muted-foreground">{text}</TableCell></TableRow>
)

export function SearchInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="relative w-full sm:w-72">
      <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
      <Input className="pl-9" placeholder={placeholder ?? "Search…"} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}

export function usePagination<T>(rows: T[], size = 8) {
  const [page, setPage] = useState(0)
  const pages = Math.max(1, Math.ceil(rows.length / size))
  const p = Math.min(page, pages - 1)
  return { rows: rows.slice(p * size, p * size + size), page: p, pages, setPage, total: rows.length }
}

export function Pagination({ page, pages, setPage, total }: { page: number; pages: number; setPage: (n: number) => void; total: number }) {
  if (total === 0) return null
  return (
    <div className="flex items-center justify-between border-t px-4 py-3 text-sm text-muted-foreground print:hidden">
      <span>{total} record{total === 1 ? "" : "s"} · page {page + 1} of {pages}</span>
      <div className="flex gap-1">
        <Button size="icon" variant="outline" className="size-8" disabled={page === 0} onClick={() => setPage(page - 1)} aria-label="Previous page"><ChevronLeft /></Button>
        <Button size="icon" variant="outline" className="size-8" disabled={page >= pages - 1} onClick={() => setPage(page + 1)} aria-label="Next page"><ChevronRight /></Button>
      </div>
    </div>
  )
}
