import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react"
import type { AuditEntry, DB, Patient, Payment, Portal, PortalDoctor, Role, Settings, User } from "./types"
import { api, errorMessage, setUnauthorizedHandler, tokenStore } from "./api"
import { useToast } from "@/components/toast"

const EMPTY: DB = {
  users: [], patients: [], doctors: [], appointments: [], beds: [], invoices: [], vitals: [], notes: [], items: [],
  prescriptions: [], labs: [], emergency: [], surgeries: [], staff: [], audit: [],
  settings: { hospitalName: "MediCore Hospital", taxRate: 5 },
}

type Coll = { [K in keyof DB]: DB[K] extends { id: string }[] ? K : never }[keyof DB]
type Item<K extends Coll> = DB[K][number]
type Rec = Record<string, unknown>

const ENDPOINT: Record<Exclude<Coll, "audit">, string> = {
  users: "/api/users", patients: "/api/patients", doctors: "/api/doctors", appointments: "/api/appointments", beds: "/api/beds",
  invoices: "/api/invoices", vitals: "/api/vitals", notes: "/api/notes", items: "/api/items", prescriptions: "/api/prescriptions",
  labs: "/api/labs", emergency: "/api/emergency", surgeries: "/api/surgeries", staff: "/api/staff",
}

// Which lists each role may read (mirrors the backend SecurityConfig; a 403 is tolerated anyway).
const CLINICAL: (keyof typeof ENDPOINT)[] = ["patients", "doctors", "appointments", "beds", "vitals", "notes", "items", "prescriptions", "labs", "emergency", "surgeries"]
const READS: Record<Exclude<Role, "Patient">, (keyof typeof ENDPOINT)[]> = {
  Admin: [...CLINICAL, "invoices", "staff", "users"],
  Doctor: CLINICAL,
  Nurse: CLINICAL,
  Receptionist: ["patients", "doctors", "appointments", "beds", "vitals", "notes", "emergency", "invoices"],
  Pharmacist: ["patients", "doctors", "vitals", "notes", "items", "prescriptions"],
  "Lab Tech": ["patients", "doctors", "vitals", "notes", "labs"],
}

const pick = (o: Rec, keys: string[]): Rec => Object.fromEntries(keys.filter((k) => o[k] !== undefined && o[k] !== null).map((k) => [k, o[k]]))
const hhmm = (s: unknown) => (typeof s === "string" ? s.slice(0, 5) : s)

const CREATE: Partial<Record<Coll, (o: Rec) => Rec>> = {
  appointments: (o) => pick(o, ["patientId", "doctorId", "date", "time", "reason"]),
  doctors: (o) => pick(o, ["name", "specialty", "phone"]),
  emergency: (o) => pick(o, ["name", "age", "complaint", "triage"]),
  invoices: (o) => {
    const d = Math.round((Date.parse(String(o.dueDate)) - Date.parse(String(o.date))) / 86400000)
    return { ...pick(o, ["patientId", "items", "discount", "tax", "insurance"]), dueDays: Number.isFinite(d) && d >= 0 ? d : 14 }
  },
  vitals: (o) => pick(o, ["patientId", "bp", "hr", "temp", "spo2", "weight"]),
  notes: (o) => pick(o, ["patientId", "type", "text"]),
  items: (o) => pick(o, ["name", "category", "stock", "reorder", "unit", "price", "location", "expiry", "nextMaintenance"]),
  prescriptions: (o) => pick(o, ["patientId", "doctorId", "itemId", "dosage", "duration", "qty", "instructions", "allergyOverride"]),
  labs: (o) => pick(o, ["patientId", "doctorId", "test", "priority"]),
  surgeries: (o) => pick(o, ["patientId", "surgeonId", "procedure", "room", "date", "time", "duration"]),
  staff: (o) => pick(o, ["name", "role", "department", "phone"]),
  users: (o) => pick(o, ["name", "email", "password", "role", "linkedId"]),
}

async function applyPatch(k: Coll, id: string, p: Rec) {
  const base = `${ENDPOINT[k as keyof typeof ENDPOINT]}/${id}`
  switch (k) {
    case "appointments":
      if (p.status) await api.patch(`${base}/status`, { status: p.status })
      if (p.date || p.time) await api.patch(`${base}/reschedule`, { date: p.date, time: p.time })
      return
    case "doctors": case "emergency": case "surgeries":
      return void (await api.patch(`${base}/status`, { status: p.status }))
    case "labs":
      if (p.status === "In Progress") await api.patch(`${base}/start`)
      else if (p.status === "Completed") await api.patch(`${base}/result`, { result: p.result, flag: p.flag })
      return
    case "staff":
      return void (await api.put(`${base}/shifts`, { shifts: p.shifts }))
    case "items":
      if (p.nextMaintenance) await api.post(`${base}/service`)
      return
    case "patients": {
      const b = pick(p, ["name", "gender", "phone", "bloodType", "condition", "allergies", "emergencyContact", "insurer", "policyNo"])
      if (p.age !== undefined && p.age !== "") b.age = Number(p.age)
      if (p.coverage !== undefined && p.coverage !== "") b.coverage = Number(p.coverage)
      return void (await api.put(base, b))
    }
    default:
      throw new Error(`Updating ${k} is not supported`)
  }
}

type Ctx = DB & {
  loading: boolean
  user: User | null
  portal: Portal | null
  portalDoctors: PortalDoctor[]
  login: (email: string, password: string) => Promise<string | null>
  logout: () => void
  refresh: () => Promise<void>
  add: <K extends Coll>(k: K, item: Omit<Item<K>, "id">, msg: string) => Promise<string | undefined>
  patch: <K extends Coll>(k: K, id: string, p: Partial<Item<K>>, msg: string) => Promise<boolean>
  remove: <K extends Coll>(k: K, id: string, msg: string) => Promise<boolean>
  addPatient: (p: Omit<Patient, "id" | "admittedOn">) => Promise<string | undefined>
  deletePatient: (id: string) => Promise<boolean>
  dischargePatient: (id: string) => Promise<boolean>
  assignBed: (bedId: string, patientId: string) => Promise<boolean>
  freeBed: (bedId: string) => Promise<boolean>
  dispense: (rxId: string) => Promise<boolean>
  restock: (itemId: string, qty: number) => Promise<boolean>
  addPayment: (invoiceId: string, p: Payment) => Promise<boolean>
  updateSettings: (p: Partial<Settings>) => Promise<boolean>
  portalBook: (f: { doctorId: string; date: string; time: string; reason: string }) => Promise<boolean>
  portalCancel: (id: string) => Promise<boolean>
  notify: (msg: string, error?: boolean) => void
}

const StoreContext = createContext<Ctx | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const toast = useToast()
  const [db, setDb] = useState<DB>(EMPTY)
  const [user, setUser] = useState<User | null>(null)
  const [portal, setPortal] = useState<Portal | null>(null)
  const [portalDoctors, setPortalDoctors] = useState<PortalDoctor[]>([])
  const [loading, setLoading] = useState(() => !!tokenStore.get())
  const userRef = useRef<User | null>(null)
  userRef.current = user

  const clearSession = useCallback(() => {
    tokenStore.clear()
    setUser(null); setPortal(null); setPortalDoctors([])
    setDb((s) => ({ ...EMPTY, settings: s.settings }))
  }, [])

  const load = useCallback(async (u: User) => {
    if (u.role === "Patient") {
      const [me, docs] = await Promise.all([api.get<Portal>("/api/portal/me"), api.get<PortalDoctor[]>("/api/portal/doctors")])
      setPortal(me); setPortalDoctors(docs)
      setDb((s) => ({ ...EMPTY, settings: s.settings, patients: [me.patient], invoices: me.invoices }))
      return
    }
    const keys = READS[u.role as Exclude<Role, "Patient">]
    const wantAudit = u.role === "Admin"
    const results = await Promise.allSettled([
      ...keys.map((k) => api.get<unknown[]>(ENDPOINT[k])),
      api.get<Settings>("/api/settings"),
      ...(wantAudit ? [api.get<{ content: AuditEntry[] }>("/api/audit?size=200")] : []),
    ])
    const next: DB = { ...EMPTY }
    results.forEach((r, i) => {
      if (r.status === "rejected") {
        if ((r.reason as { status?: number }).status === 403) return
        throw r.reason
      }
      if (i < keys.length) (next as unknown as Rec)[keys[i]] = r.value
      else if (i === keys.length) next.settings = r.value as Settings
      else next.audit = (r.value as { content: AuditEntry[] }).content
    })
    next.appointments = next.appointments.map((a) => ({ ...a, time: hhmm(a.time) as string }))
    next.surgeries = next.surgeries.map((s) => ({ ...s, time: hhmm(s.time) as string }))
    setDb(next)
  }, [])

  const refresh = useCallback(async () => { if (userRef.current) await load(userRef.current) }, [load])

  // boot: hospital name for the login page, then restore a saved session
  useEffect(() => {
    setUnauthorizedHandler(() => { if (userRef.current) { clearSession(); toast("Your session expired. Please sign in again.", true) } })
    let live = true
    api.get<{ hospitalName: string }>("/api/settings/public").then((s) => live && setDb((d) => ({ ...d, settings: { ...d.settings, hospitalName: s.hospitalName } }))).catch(() => {})
    if (tokenStore.get()) {
      api.get<User>("/api/auth/me")
        .then(async (u) => { await load(u); if (live) setUser(u) })
        .catch((e) => { if ((e as { status?: number }).status !== 0) tokenStore.clear() })
        .finally(() => live && setLoading(false))
    }
    return () => { live = false }
  }, [load, clearSession, toast])

  const run = async <T,>(msg: string | null, fn: () => Promise<T>): Promise<{ ok: true; value: T } | { ok: false }> => {
    try {
      const value = await fn()
      await refresh()
      if (msg) toast(msg)
      return { ok: true, value }
    } catch (e) {
      toast(errorMessage(e), true)
      return { ok: false }
    }
  }
  const act = async (msg: string, fn: () => Promise<unknown>) => (await run(msg, fn)).ok

  const nameOf = (id: string) => db.patients.find((p) => p.id === id)?.name ?? id

  const value: Ctx = {
    ...db,
    loading, user, portal, portalDoctors, refresh,
    login: async (email, password) => {
      try {
        const r = await api.post<{ token: string; user: User }>("/api/auth/login", { email: email.trim(), password })
        tokenStore.set(r.token)
        await load(r.user)
        setUser(r.user)
        return null
      } catch (e) {
        tokenStore.clear()
        return errorMessage(e)
      }
    },
    logout: clearSession,
    notify: toast,

    add: async (k, item, msg) => {
      const build = CREATE[k]
      if (!build) { toast(`Creating ${k} is not supported`, true); return undefined }
      const r = await run(msg, () => api.post<{ id: string }>(ENDPOINT[k as keyof typeof ENDPOINT], build(item as Rec)))
      return r.ok ? r.value?.id : undefined
    },
    patch: (k, id, p, msg) => act(msg, () => applyPatch(k, id, p as Rec)),
    remove: (k, id, msg) => act(msg, () => api.del(`${ENDPOINT[k as keyof typeof ENDPOINT]}/${id}`)),

    addPatient: async (p) => {
      const body = { ...pick(p as unknown as Rec, ["name", "age", "gender", "phone", "bloodType", "condition", "allergies", "emergencyContact", "insurer", "policyNo", "coverage", "bedId"]) }
      const r = await run(`Registered patient ${p.name}`, () => api.post<{ id: string }>("/api/patients", body))
      return r.ok ? r.value?.id : undefined
    },
    deletePatient: (id) => act(`Deleted patient ${nameOf(id)}`, () => api.del(`/api/patients/${id}`)),
    dischargePatient: (id) => act(`Discharged ${nameOf(id)}`, () => api.post(`/api/patients/${id}/discharge`)),
    assignBed: (bedId, patientId) => act(`Assigned bed ${bedId} to ${nameOf(patientId)}`, () => api.post(`/api/beds/${bedId}/assign`, { patientId })),
    freeBed: (bedId) => act(`Freed bed ${bedId}`, () => api.post(`/api/beds/${bedId}/free`)),
    dispense: (rxId) => {
      const rx = db.prescriptions.find((r) => r.id === rxId)
      const item = db.items.find((i) => i.id === rx?.itemId)
      return act(`Dispensed ${rx?.qty ?? ""} × ${item?.name ?? "medicine"}`, () => api.post(`/api/prescriptions/${rxId}/dispense`))
    },
    restock: (itemId, qty) => act(`Restocked ${qty} × ${db.items.find((i) => i.id === itemId)?.name ?? itemId}`, () => api.post(`/api/items/${itemId}/restock`, { quantity: qty })),
    addPayment: (invoiceId, p) =>
      act(`Recorded payment of $${p.amount.toFixed(2)} on ${invoiceId}`, () =>
        api.post(userRef.current?.role === "Patient" ? `/api/portal/invoices/${invoiceId}/payments` : `/api/invoices/${invoiceId}/payments`, { amount: p.amount, method: p.method })),
    updateSettings: (p) => act("Updated hospital settings", () => api.put("/api/settings", { hospitalName: p.hospitalName ?? db.settings.hospitalName, taxRate: p.taxRate ?? db.settings.taxRate })),

    portalBook: (f) => act(`Booked appointment for ${f.date} ${f.time}`, () => api.post("/api/portal/appointments", f)),
    portalCancel: (id) => act("Appointment cancelled", () => api.post(`/api/portal/appointments/${id}/cancel`)),
  }
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const c = useContext(StoreContext)
  if (!c) throw new Error("useStore must be used inside StoreProvider")
  return c
}
