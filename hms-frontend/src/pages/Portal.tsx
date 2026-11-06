import { CalendarClock, CreditCard, FlaskConical, Pill, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageHeader } from "@/components/PageHeader"
import { EmptyRow, FormDialog, SelectField, StatCard, StatusBadge, TextField } from "@/components/common"
import { InvoiceView } from "./Billing"
import { useState } from "react"
import { useStore } from "@/lib/store"
import { calc } from "@/lib/billing"
import { fmtDateTime, money, today } from "@/lib/utils"

export default function Portal() {
  const { portal, portalDoctors, portalBook, portalCancel, invoices } = useStore()
  const [viewId, setViewId] = useState<string | null>(null)
  if (!portal) return <Card><CardContent className="p-6 text-sm">Your account isn't linked to a patient record. Please contact the front desk.</CardContent></Card>
  const p = portal.patient
  const appts = [...portal.appointments].sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time))
  const rxs = portal.prescriptions
  const labs = portal.labs
  const due = invoices.reduce((s, i) => s + calc(i).balance, 0)
  const next = appts.filter((a) => a.status === "Scheduled" && a.date >= today()).reverse()[0]

  return (
    <>
      <PageHeader title={`Hello, ${p.name.split(" ")[0]}`} description="Your appointments, prescriptions, results and bills in one place.">
        <FormDialog title="Book an appointment" trigger={<Button><Plus /> Book appointment</Button>} initial={{ doctorId: "", date: today(), time: "09:00", reason: "" }} valid={(f) => !!f.doctorId && !!f.reason.trim() && f.date >= today()}
          onSubmit={(f) => portalBook({ doctorId: f.doctorId, date: f.date, time: f.time, reason: f.reason.trim() })}>
          {(f, set) => (<>
            <SelectField label="Doctor" value={f.doctorId} onChange={(v) => set("doctorId", v)} placeholder="Select doctor" options={portalDoctors.map((d) => ({ value: d.id, label: `${d.name} — ${d.specialty}` }))} />
            <div className="grid grid-cols-2 gap-3"><TextField label="Date" type="date" min={today()} required value={f.date} onChange={(v) => set("date", v)} /><TextField label="Time" type="time" required value={f.time} onChange={(v) => set("time", v)} /></div>
            <TextField label="Reason for visit" required value={f.reason} onChange={(v) => set("reason", v)} />
          </>)}
        </FormDialog>
      </PageHeader>
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Next appointment" value={next ? next.date.slice(5) : "—"} sub={next ? `${next.time} · ${next.doctorName}` : "None scheduled"} icon={CalendarClock} />
        <StatCard label="Active prescriptions" value={rxs.length} sub={`${rxs.filter((r) => r.status === "Pending").length} awaiting pickup`} icon={Pill} />
        <StatCard label="Lab results" value={labs.length} sub="available to view" icon={FlaskConical} />
        <StatCard label="Balance due" value={money(due)} sub="after insurance" icon={CreditCard} tone={due > 0 ? "warning" : undefined} />
      </div>
      <Tabs defaultValue="appts">
        <TabsList><TabsTrigger value="appts">Appointments</TabsTrigger><TabsTrigger value="rx">Prescriptions</TabsTrigger><TabsTrigger value="labs">Results</TabsTrigger><TabsTrigger value="bills">Bills</TabsTrigger></TabsList>
        <TabsContent value="appts"><Card><Table>
          <TableHeader><TableRow><TableHead>Date & time</TableHead><TableHead>Doctor</TableHead><TableHead>Reason</TableHead><TableHead>Status</TableHead><TableHead /></TableRow></TableHeader>
          <TableBody>{appts.length === 0 && <EmptyRow cols={5} text="No appointments." />}{appts.map((a) => (
            <TableRow key={a.id}><TableCell>{a.date} · {a.time}</TableCell><TableCell>{a.doctorName}</TableCell><TableCell>{a.reason}</TableCell><TableCell><StatusBadge status={a.status} /></TableCell>
              <TableCell className="text-right">{a.status === "Scheduled" && <Button size="sm" variant="ghost" onClick={() => portalCancel(a.id)}>Cancel</Button>}</TableCell></TableRow>))}</TableBody></Table></Card></TabsContent>
        <TabsContent value="rx"><Card><Table>
          <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Medicine</TableHead><TableHead>Dosage</TableHead><TableHead>Duration</TableHead><TableHead>Instructions</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
          <TableBody>{rxs.length === 0 && <EmptyRow cols={6} text="No prescriptions." />}{rxs.map((r) => <TableRow key={r.id}><TableCell>{r.date}</TableCell><TableCell className="font-medium">{r.medicine}</TableCell><TableCell>{r.dosage}</TableCell><TableCell>{r.duration}</TableCell><TableCell>{r.instructions}</TableCell><TableCell><StatusBadge status={r.status === "Pending" ? "Ordered" : "Dispensed"} /></TableCell></TableRow>)}</TableBody></Table></Card></TabsContent>
        <TabsContent value="labs"><Card><Table>
          <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Test</TableHead><TableHead>Result</TableHead></TableRow></TableHeader>
          <TableBody>{labs.length === 0 && <EmptyRow cols={3} text="No completed results yet." />}{labs.map((l) => <TableRow key={l.id}><TableCell>{fmtDateTime(l.date)}</TableCell><TableCell className="font-medium">{l.test}</TableCell><TableCell><div className="flex items-center gap-2"><StatusBadge status={l.flag} />{l.result}</div></TableCell></TableRow>)}</TableBody></Table></Card></TabsContent>
        <TabsContent value="bills"><Card><Table>
          <TableHeader><TableRow><TableHead>Invoice</TableHead><TableHead>Date</TableHead><TableHead className="text-right">Your share</TableHead><TableHead className="text-right">Balance</TableHead><TableHead>Status</TableHead><TableHead /></TableRow></TableHeader>
          <TableBody>{invoices.length === 0 && <EmptyRow cols={6} text="No invoices." />}{invoices.map((i) => { const c = calc(i); return <TableRow key={i.id}><TableCell className="font-medium">{i.id}</TableCell><TableCell>{i.date}</TableCell><TableCell className="text-right">{money(c.patientDue)}</TableCell><TableCell className="text-right">{money(c.balance)}</TableCell><TableCell><StatusBadge status={c.status} /></TableCell><TableCell className="text-right"><Button size="sm" variant="outline" onClick={() => setViewId(i.id)}>{c.balance > 0 ? "View & pay" : "View"}</Button></TableCell></TableRow> })}</TableBody></Table></Card></TabsContent>
      </Tabs>
      <InvoiceView invoice={invoices.find((i) => i.id === viewId)} onClose={() => setViewId(null)} />
    </>
  )
}
