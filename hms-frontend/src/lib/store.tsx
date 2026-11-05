import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import type { AuditEntry, DB, Payment, Patient, Settings, User } from "./types"
import { seed } from "./seed"
import { nowIso, today, uid } from "./utils"
import { useToast } from "@/components/toast"

const KEY = "medicore-db-v2"
const SESSION = "medicore-session"

function load(): DB {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return { ...seed, ...(JSON.parse(raw) as DB) }
  } catch { /* ignore */ }
  return seed
}

type Coll = { [K in keyof DB]: DB[K] extends { id: string }[] ? K : never }[keyof DB]
type Item<K extends Coll> = DB[K][number]

const PREFIX: Record<Coll, string> = {
  users: "U", patients: "P", doctors: "D", appointments: "A", beds: "B", invoices: "INV", vitals: "V", notes: "N",
  items: "IT", prescriptions: "RX", labs: "LAB", emergency: "ER", surgeries: "S", staff: "ST", audit: "LOG",
}

type Ctx = DB & {
  user: User | null
  login: (email: string, password: string) => boolean
  logout: () => void
  update: (msg: string, fn: (s: DB) => DB) => void
  add: <K extends Coll>(k: K, item: Omit<Item<K>, "id">, msg: string) => string
  patch: <K extends Coll>(k: K, id: string, p: Partial<Item<K>>, msg: string) => void
  remove: <K extends Coll>(k: K, id: string, msg: string) => void
  addPatient: (p: Omit<Patient, "id" | "admittedOn">) => string
  deletePatient: (id: string) => void
  dischargePatient: (id: string) => void
  assignBed: (bedId: string, patientId: string) => void
  freeBed: (bedId: string) => void
  dispense: (rxId: string) => boolean
  restock: (itemId: string, qty: number) => void
  addPayment: (invoiceId: string, p: Payment) => void
  updateSettings: (p: Partial<Settings>) => void
  notify: (msg: string, error?: boolean) => void
  reset: () => void
}

const StoreContext = createContext<Ctx | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const toast = useToast()
  const [db, setDb] = useState<DB>(load)
  const [sessionId, setSessionId] = useState<string | null>(() => {
    try { return localStorage.getItem(SESSION) } catch { return null }
  })
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(db)) } catch { /* ignore */ }
  }, [db])

  const user = db.users.find((u) => u.id === sessionId) ?? null

  const entry = (action: string, u: User | null): AuditEntry => ({ id: uid("LOG"), time: nowIso(), user: u?.name ?? "System", role: u?.role ?? "-", action })

  const update: Ctx["update"] = (msg, fn) => {
    const e = entry(msg, user)
    setDb((s) => {
      const n = fn(s)
      return { ...n, audit: [e, ...n.audit].slice(0, 500) }
    })
    toast(msg)
  }

  const add: Ctx["add"] = (k, item, msg) => {
    const id = uid(PREFIX[k])
    update(msg, (s) => ({ ...s, [k]: [{ ...item, id }, ...(s[k] as unknown[])] }) as DB)
    return id
  }
  const patch: Ctx["patch"] = (k, id, p, msg) =>
    update(msg, (s) => ({ ...s, [k]: (s[k] as { id: string }[]).map((x) => (x.id === id ? { ...x, ...p } : x)) }) as DB)
  const remove: Ctx["remove"] = (k, id, msg) =>
    update(msg, (s) => ({ ...s, [k]: (s[k] as { id: string }[]).filter((x) => x.id !== id) }) as DB)

  const value: Ctx = {
    ...db,
    user,
    login: (email, password) => {
      const u = db.users.find((x) => x.email.toLowerCase() === email.trim().toLowerCase() && x.password === password)
      if (!u) return false
      setSessionId(u.id)
      try { localStorage.setItem(SESSION, u.id) } catch { /* ignore */ }
      const e = entry("Signed in", u)
      setDb((s) => ({ ...s, audit: [e, ...s.audit].slice(0, 500) }))
      return true
    },
    logout: () => {
      if (user) { const e = entry("Signed out", user); setDb((s) => ({ ...s, audit: [e, ...s.audit].slice(0, 500) })) }
      setSessionId(null)
      try { localStorage.removeItem(SESSION) } catch { /* ignore */ }
    },
    update, add, patch, remove,
    notify: toast,

    addPatient: (p) => {
      const id = uid("P")
      update(`Registered patient ${p.name}`, (s) => ({
        ...s,
        beds: s.beds.map((b) => (b.id === p.bedId ? { ...b, patientId: id } : b)),
        patients: [{ ...p, id, admittedOn: today() }, ...s.patients],
      }))
      return id
    },
    deletePatient: (id) =>
      update(`Deleted patient ${db.patients.find((p) => p.id === id)?.name ?? id}`, (s) => ({
        ...s,
        patients: s.patients.filter((p) => p.id !== id),
        appointments: s.appointments.filter((a) => a.patientId !== id),
        invoices: s.invoices.filter((i) => i.patientId !== id),
        vitals: s.vitals.filter((v) => v.patientId !== id),
        notes: s.notes.filter((n) => n.patientId !== id),
        prescriptions: s.prescriptions.filter((r) => r.patientId !== id),
        labs: s.labs.filter((l) => l.patientId !== id),
        surgeries: s.surgeries.filter((x) => x.patientId !== id),
        beds: s.beds.map((b) => (b.patientId === id ? { ...b, patientId: undefined } : b)),
      })),
    dischargePatient: (id) =>
      update(`Discharged ${db.patients.find((p) => p.id === id)?.name ?? id}`, (s) => ({
        ...s,
        patients: s.patients.map((p) => (p.id === id ? { ...p, status: "Discharged", bedId: undefined } : p)),
        beds: s.beds.map((b) => (b.patientId === id ? { ...b, patientId: undefined } : b)),
      })),
    assignBed: (bedId, patientId) =>
      update(`Assigned bed ${bedId} to ${db.patients.find((p) => p.id === patientId)?.name ?? patientId}`, (s) => ({
        ...s,
        beds: s.beds.map((b) => (b.id === bedId ? { ...b, patientId } : b.patientId === patientId ? { ...b, patientId: undefined } : b)),
        patients: s.patients.map((p) => (p.id === patientId ? { ...p, bedId, status: "Admitted" } : p)),
      })),
    freeBed: (bedId) =>
      update(`Freed bed ${bedId}`, (s) => {
        const pid = s.beds.find((b) => b.id === bedId)?.patientId
        return {
          ...s,
          beds: s.beds.map((b) => (b.id === bedId ? { ...b, patientId: undefined } : b)),
          patients: s.patients.map((p) => (p.id === pid ? { ...p, bedId: undefined } : p)),
        }
      }),
    dispense: (rxId) => {
      const rx = db.prescriptions.find((r) => r.id === rxId)
      const item = db.items.find((i) => i.id === rx?.itemId)
      if (!rx || !item) return false
      if (item.stock < rx.qty) { toast(`Insufficient stock for ${item.name} (${item.stock} ${item.unit} left)`, true); return false }
      update(`Dispensed ${rx.qty} × ${item.name}`, (s) => ({
        ...s,
        prescriptions: s.prescriptions.map((r) => (r.id === rxId ? { ...r, status: "Dispensed" } : r)),
        items: s.items.map((i) => (i.id === item.id ? { ...i, stock: i.stock - rx.qty } : i)),
      }))
      return true
    },
    restock: (itemId, qty) =>
      update(`Restocked ${qty} × ${db.items.find((i) => i.id === itemId)?.name ?? itemId}`, (s) => ({
        ...s, items: s.items.map((i) => (i.id === itemId ? { ...i, stock: i.stock + qty } : i)),
      })),
    addPayment: (invoiceId, p) =>
      update(`Recorded payment of $${p.amount.toFixed(2)} on ${invoiceId}`, (s) => ({
        ...s, invoices: s.invoices.map((i) => (i.id === invoiceId ? { ...i, payments: [...i.payments, p] } : i)),
      })),
    updateSettings: (p) => update("Updated hospital settings", (s) => ({ ...s, settings: { ...s.settings, ...p } })),
    reset: () => { setDb(seed); toast("Demo data restored") },
  }
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const c = useContext(StoreContext)
  if (!c) throw new Error("useStore must be used inside StoreProvider")
  return c
}
