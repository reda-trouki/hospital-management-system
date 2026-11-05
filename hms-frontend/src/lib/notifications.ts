import type { Feature } from "./auth"
import type { DB } from "./types"
import { addDays, today } from "./utils"
import { calc } from "./billing"

export type Notice = { id: string; text: string; to: string; feature: Feature; level: "info" | "warning" | "danger" }

export function buildNotices(db: DB): Notice[] {
  const out: Notice[] = []
  const t = today()
  db.emergency.filter((e) => e.status === "Waiting" && e.triage <= 2).forEach((e) => out.push({ id: e.id, text: `Critical ER case waiting: ${e.name} (triage ${e.triage})`, to: "/emergency", feature: "emergency", level: "danger" }))
  db.labs.filter((l) => l.flag === "Critical").slice(0, 3).forEach((l) => out.push({ id: l.id, text: `Critical lab result: ${l.test} (${db.patients.find((p) => p.id === l.patientId)?.name})`, to: `/patients/${l.patientId}`, feature: "lab", level: "danger" }))
  const pendingLabs = db.labs.filter((l) => l.status !== "Completed").length
  if (pendingLabs) out.push({ id: "labs", text: `${pendingLabs} lab order${pendingLabs > 1 ? "s" : ""} awaiting results`, to: "/lab", feature: "lab", level: "info" })
  const pendingRx = db.prescriptions.filter((r) => r.status === "Pending").length
  if (pendingRx) out.push({ id: "rx", text: `${pendingRx} prescription${pendingRx > 1 ? "s" : ""} waiting to be dispensed`, to: "/pharmacy", feature: "pharmacy", level: "info" })
  db.items.filter((i) => i.category !== "Equipment" && i.stock <= i.reorder).forEach((i) => out.push({ id: `low-${i.id}`, text: `Low stock: ${i.name} (${i.stock} ${i.unit} left)`, to: i.category === "Medicine" ? "/pharmacy" : "/inventory", feature: i.category === "Medicine" ? "pharmacy" : "inventory", level: "warning" }))
  db.items.filter((i) => i.expiry && i.expiry <= addDays(60)).forEach((i) => out.push({ id: `exp-${i.id}`, text: `${i.name} expires ${i.expiry}`, to: "/pharmacy", feature: "pharmacy", level: "warning" }))
  db.items.filter((i) => i.nextMaintenance && i.nextMaintenance <= addDays(14)).forEach((i) => out.push({ id: `mnt-${i.id}`, text: `Maintenance ${i.nextMaintenance! < t ? "overdue" : "due"}: ${i.name}`, to: "/inventory", feature: "inventory", level: i.nextMaintenance! < t ? "danger" : "warning" }))
  const overdue = db.invoices.filter((i) => calc(i).status === "Overdue")
  if (overdue.length) out.push({ id: "inv", text: `${overdue.length} overdue invoice${overdue.length > 1 ? "s" : ""}`, to: "/billing", feature: "billing", level: "warning" })
  const todays = db.appointments.filter((a) => a.date === t && a.status === "Scheduled").length
  if (todays) out.push({ id: "appt", text: `${todays} appointment${todays > 1 ? "s" : ""} scheduled today`, to: "/appointments", feature: "appointments", level: "info" })
  return out
}
