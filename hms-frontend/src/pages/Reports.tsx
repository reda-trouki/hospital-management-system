import { Download, Printer } from "lucide-react"
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/PageHeader"
import { useStore } from "@/lib/store"
import { calc } from "@/lib/billing"
import { downloadCSV, money } from "@/lib/utils"

const COLORS = ["var(--primary)", "oklch(0.65 0.16 250)", "oklch(0.75 0.15 80)", "oklch(0.65 0.2 20)", "oklch(0.6 0.15 300)"]
const tip = { contentStyle: { borderRadius: 8, border: "1px solid var(--border)", background: "var(--popover)", color: "var(--popover-foreground)" } }

export default function Reports() {
  const { patients, appointments, doctors, invoices, labs, items, emergency, surgeries } = useStore()
  const pn = (id: string) => patients.find((p) => p.id === id)?.name ?? "Unknown"

  const byMonth: Record<string, number> = {}
  invoices.forEach((i) => i.payments.forEach((p) => { const m = p.date.slice(0, 7); byMonth[m] = (byMonth[m] ?? 0) + p.amount }))
  const revenue = Object.entries(byMonth).sort().map(([month, Revenue]) => ({ month, Revenue }))

  const count = <T,>(arr: T[], key: (x: T) => string) => Object.entries(arr.reduce<Record<string, number>>((a, x) => { const k = key(x); a[k] = (a[k] ?? 0) + 1; return a }, {})).map(([name, value]) => ({ name, value }))
  const patientStatus = count(patients, (p) => p.status)
  const apptByDoctor = doctors.map((d) => ({ name: d.name.replace("Dr. ", ""), Appointments: appointments.filter((a) => a.doctorId === d.id).length }))
  const labStatus = count(labs, (l) => l.status)
  const totalBilled = invoices.reduce((s, i) => s + calc(i).total, 0)
  const collected = invoices.reduce((s, i) => s + calc(i).paid, 0)
  const completion = appointments.length ? Math.round((appointments.filter((a) => a.status === "Completed").length / appointments.length) * 100) : 0

  const summary = [
    ["Patients", patients.length], ["Appointments", appointments.length], ["Completion rate", `${completion}%`], ["Total billed", money(totalBilled)],
    ["Collected", money(collected)], ["ER cases", emergency.length], ["Surgeries", surgeries.length], ["Lab orders", labs.length],
  ]

  return (
    <div className="print-area">
      <PageHeader title="Reports & analytics" description={`Generated ${new Date().toLocaleString()}`}>
        <Button variant="outline" onClick={() => window.print()}><Printer /> Print report</Button>
        <Button variant="outline" onClick={() => downloadCSV("appointments.csv", appointments.map((a) => ({ id: a.id, patient: pn(a.patientId), doctor: doctors.find((d) => d.id === a.doctorId)?.name, date: a.date, time: a.time, reason: a.reason, status: a.status })))}><Download /> Appointments CSV</Button>
        <Button variant="outline" onClick={() => downloadCSV("inventory.csv", items.map(({ id, name, category, stock, reorder, unit, price, location, expiry, nextMaintenance }) => ({ id, name, category, stock, reorder, unit, price, location, expiry, nextMaintenance })))}><Download /> Inventory CSV</Button>
      </PageHeader>
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {summary.map(([l, v]) => <Card key={l}><CardContent className="p-5"><p className="text-xs text-muted-foreground">{l}</p><p className="mt-1 text-xl font-semibold">{v}</p></CardContent></Card>)}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card><CardHeader><CardTitle>Revenue collected</CardTitle><CardDescription>Payments received per month</CardDescription></CardHeader><CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%"><BarChart data={revenue} margin={{ left: -10 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" /><XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} stroke="var(--muted-foreground)" /><YAxis fontSize={12} tickLine={false} axisLine={false} stroke="var(--muted-foreground)" /><Tooltip {...tip} formatter={(v) => money(Number(v))} cursor={{ fill: "var(--muted)" }} /><Bar dataKey="Revenue" fill="var(--primary)" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer>
        </CardContent></Card>
        <Card><CardHeader><CardTitle>Appointments per doctor</CardTitle></CardHeader><CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%"><BarChart data={apptByDoctor} layout="vertical" margin={{ left: 20 }}><CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" /><XAxis type="number" allowDecimals={false} fontSize={12} stroke="var(--muted-foreground)" /><YAxis type="category" dataKey="name" width={90} fontSize={12} stroke="var(--muted-foreground)" /><Tooltip {...tip} cursor={{ fill: "var(--muted)" }} /><Bar dataKey="Appointments" fill="oklch(0.65 0.16 250)" radius={[0, 4, 4, 0]} /></BarChart></ResponsiveContainer>
        </CardContent></Card>
        {[["Patients by status", patientStatus], ["Lab orders by status", labStatus]].map(([title, data]) => (
          <Card key={title as string}><CardHeader><CardTitle>{title as string}</CardTitle></CardHeader><CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={data as { name: string; value: number }[]} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={2}>{(data as unknown[]).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip {...tip} /><Legend /></PieChart></ResponsiveContainer>
          </CardContent></Card>
        ))}
      </div>
    </div>
  )
}
