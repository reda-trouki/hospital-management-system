import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const uid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
export const money = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n)
export const today = () => new Date().toISOString().slice(0, 10)
export const nowIso = () => new Date().toISOString()
export const fmtDateTime = (s: string) => s.slice(0, 16).replace("T", " ")
export const addDays = (offset: number) => { const t = new Date(); t.setDate(t.getDate() + offset); return t.toISOString().slice(0, 10) }
export const minutesSince = (iso: string) => Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000))

export function downloadCSV(filename: string, rows: Record<string, unknown>[]) {
  if (!rows.length) return
  const cols = Object.keys(rows[0])
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`
  const csv = [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n")
  const a = document.createElement("a")
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }))
  a.download = filename
  a.click()
  URL.revokeObjectURL(a.href)
}
