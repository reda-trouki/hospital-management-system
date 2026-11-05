import { Link } from "react-router-dom"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { AlertTriangle, BedDouble, CalendarClock, DollarSign, FlaskConical, Package, Scissors, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/PageHeader"
import { StatCard } from "@/components/common"
import { useStore } from "@/lib/store"
import { calc } from "@/lib/billing"
import { access } from "@/lib/auth"
import { money, today } from "@/lib/utils"

export default function Dashboard() {
  const { patients, appointments, beds, invoices, doctors, emergency, labs, items, surgeries, user } = useStore()
  const role = user!.role
  const show = (f: keyof typeof access) => access[f].includes(role)
  const t = today()
  const todays = appointments.filter((a) => a.date === t && a.status === "Scheduled").sort((a, b) => a.time.localeCompare(b.time))
  const occupied = beds.filter((b) => b.patientId).length
  const outstanding = invoices.reduce((s, i) => s + calc(i).balance, 0)
  const admitted = patients.filter((p) => p.status === "Admitted").length
  const waiting = emergency.filter((e) => e.status === "Waiting").length
  const lowStock = items.filter((i) => i.category !== "Equipment" && i.stock <= i.reorder).length
  const pendingLabs = labs.filter((l) => l.status !== "Completed").length
  const surgeriesToday = surgeries.filter((s) => s.date === t && s.status !== "Cancelled").length

  const wardData = [...new Set(beds.map((b) => b.ward))].map((ward) => ({
    ward, Occupied: beds.filter((b) => b.ward === ward && b.patientId).length, Free: beds.filter((b) => b.ward === ward && !b.patientId).length,
  }))

  return (
    <>
      <PageHeader title={`Welcome, ${user!.name.split(" ").slice(0, 2).join(" ")}`} description="Live overview of hospital activity." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Admitted patients" value={admitted} sub={`${patients.length} total records`} icon={Users} />
        <StatCard label="Today's appointments" value={todays.length} sub="still scheduled" icon={CalendarClock} />
        <StatCard label="Bed occupancy" value={`${Math.round((occupied / beds.length) * 100)}%`} sub={`${occupied} of ${beds.length} beds`} icon={BedDouble} />
        {show("billing") ? <StatCard label="Outstanding billing" value={money(outstanding)} sub={`${invoices.filter((i) => calc(i).balance > 0).length} unpaid invoices`} icon={DollarSign} /> : <StatCard label="Surgeries today" value={surgeriesToday} sub="scheduled or in progress" icon={Scissors} />}
        {show("emergency") && <StatCard label="ER waiting" value={waiting} sub={`${emergency.filter((e) => e.status === "In Treatment").length} in treatment`} icon={AlertTriangle} tone={waiting ? "danger" : undefined} />}
        {show("lab") && <StatCard label="Pending lab orders" value={pendingLabs} sub="awaiting results" icon={FlaskConical} />}
        {(show("pharmacy") || show("inventory")) && <StatCard label="Low-stock items" value={lowStock} sub="at or below reorder level" icon={Package} tone={lowStock ? "warning" : undefined} />}
        {show("surgeries") && <StatCard label="Surgeries today" value={surgeriesToday} sub="scheduled or in progress" icon={Scissors} />}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader><CardTitle>Ward occupancy</CardTitle><CardDescription>Occupied vs. free beds per ward</CardDescription></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={wardData} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="ward" tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
                <Tooltip cursor={{ fill: "var(--muted)" }} contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", background: "var(--popover)", color: "var(--popover-foreground)" }} />
                <Bar dataKey="Occupied" stackId="a" fill="var(--primary)" radius={[0, 0, 4, 4]} />
                <Bar dataKey="Free" stackId="a" fill="var(--accent)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Today's schedule</CardTitle><CardDescription>Upcoming appointments</CardDescription></CardHeader>
          <CardContent className="space-y-3">
            {todays.length === 0 && <p className="text-sm text-muted-foreground">Nothing scheduled for today.</p>}
            {todays.map((a) => (
              <div key={a.id} className="flex items-center gap-3 rounded-lg border p-3">
                <div className="w-14 text-sm font-semibold text-primary">{a.time}</div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{patients.find((p) => p.id === a.patientId)?.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{doctors.find((d) => d.id === a.doctorId)?.name} · {a.reason}</p>
                </div>
              </div>
            ))}
            {show("appointments") && <Link to="/appointments" className="block pt-1 text-sm font-medium text-primary hover:underline">View all appointments →</Link>}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader><CardTitle>Doctors on duty</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {doctors.map((d) => <Badge key={d.id} variant={d.status === "Available" ? "success" : d.status === "In Surgery" ? "warning" : "secondary"}>{d.name} · {d.status}</Badge>)}
        </CardContent>
      </Card>
    </>
  )
}
