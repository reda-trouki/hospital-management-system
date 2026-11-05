import { useState } from "react"
import { BellRing, CalendarClock, Check, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageHeader } from "@/components/PageHeader"
import { EmptyRow, FormDialog, Pagination, SearchInput, SelectField, StatusBadge, TextField, usePagination } from "@/components/common"
import { useStore } from "@/lib/store"
import { today } from "@/lib/utils"

export default function Appointments() {
  const { appointments, patients, doctors, patch, add, user, notify } = useStore()
  const [tab, setTab] = useState("Scheduled")
  const [q, setQ] = useState("")
  const myDoctor = user!.role === "Doctor" ? user!.linkedId : undefined
  const name = (id: string) => patients.find((p) => p.id === id)?.name ?? "Unknown"

  const rows = appointments
    .filter((a) => (!myDoctor || a.doctorId === myDoctor) && (tab === "all" || a.status === tab) && `${name(a.patientId)} ${a.reason}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
  const pg = usePagination(rows, 10)
  const clash = (doctorId: string, date: string, time: string, ignore?: string) => appointments.some((a) => a.id !== ignore && a.doctorId === doctorId && a.date === date && a.time === time && a.status === "Scheduled")

  const remind = (id: string) => {
    const a = appointments.find((x) => x.id === id)!
    const p = patients.find((x) => x.id === a.patientId)
    notify(`Reminder sent to ${p?.name} (${p?.phone}) for ${a.date} at ${a.time}`)
  }

  return (
    <>
      <PageHeader title="Appointments" description={myDoctor ? "Showing your appointments." : "Manage consultations and follow-ups."}>
        <FormDialog title="Schedule appointment" description="Book a patient with an available doctor." trigger={<Button><Plus /> Schedule</Button>}
          initial={{ patientId: "", doctorId: myDoctor ?? "", date: today(), time: "09:00", reason: "" }}
          valid={(f) => !!f.patientId && !!f.doctorId && !!f.reason.trim() && !clash(f.doctorId, f.date, f.time)}
          onSubmit={(f) => add("appointments", { ...f, status: "Scheduled" }, `Scheduled appointment for ${name(f.patientId)} on ${f.date} ${f.time}`)}>
          {(f, set) => (<>
            <SelectField label="Patient" value={f.patientId} onChange={(v) => set("patientId", v)} options={patients.map((p) => ({ value: p.id, label: p.name }))} placeholder="Select patient" />
            <SelectField label="Doctor" value={f.doctorId} onChange={(v) => set("doctorId", v)} options={doctors.filter((d) => d.status !== "On Leave").map((d) => ({ value: d.id, label: `${d.name} — ${d.specialty}` }))} placeholder="Select doctor" />
            <div className="grid grid-cols-2 gap-3"><TextField label="Date" type="date" required value={f.date} onChange={(v) => set("date", v)} /><TextField label="Time" type="time" required value={f.time} onChange={(v) => set("time", v)} /></div>
            <TextField label="Reason" required value={f.reason} onChange={(v) => set("reason", v)} />
            {f.doctorId && clash(f.doctorId, f.date, f.time) && <p role="alert" className="text-sm text-destructive">This doctor already has an appointment at that time.</p>}
          </>)}
        </FormDialog>
      </PageHeader>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Tabs value={tab} onValueChange={(v) => { setTab(v); pg.setPage(0) }}>
          <TabsList><TabsTrigger value="Scheduled">Scheduled</TabsTrigger><TabsTrigger value="Completed">Completed</TabsTrigger><TabsTrigger value="Cancelled">Cancelled</TabsTrigger><TabsTrigger value="all">All</TabsTrigger></TabsList>
        </Tabs>
        <SearchInput value={q} onChange={(v) => { setQ(v); pg.setPage(0) }} placeholder="Search patient or reason…" />
      </div>
      <Card>
        <Table>
          <TableHeader><TableRow><TableHead>Date & time</TableHead><TableHead>Patient</TableHead><TableHead>Doctor</TableHead><TableHead>Reason</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {pg.rows.length === 0 && <EmptyRow cols={6} text="No appointments." />}
            {pg.rows.map((a) => (
              <TableRow key={a.id}>
                <TableCell className="whitespace-nowrap font-medium">{a.date} · {a.time}</TableCell>
                <TableCell>{name(a.patientId)}</TableCell>
                <TableCell>{doctors.find((d) => d.id === a.doctorId)?.name ?? "Unknown"}</TableCell>
                <TableCell>{a.reason}</TableCell>
                <TableCell><StatusBadge status={a.status} /></TableCell>
                <TableCell className="whitespace-nowrap text-right">
                  {a.status === "Scheduled" && (<>
                    <Button size="sm" variant="ghost" title="Send reminder" onClick={() => remind(a.id)}><BellRing /> Remind</Button>
                    <FormDialog title="Reschedule appointment" trigger={<Button size="sm" variant="ghost"><CalendarClock /> Reschedule</Button>} initial={{ date: a.date, time: a.time }}
                      valid={(f) => !clash(a.doctorId, f.date, f.time, a.id)}
                      onSubmit={(f) => patch("appointments", a.id, f, `Rescheduled ${name(a.patientId)} to ${f.date} ${f.time}`)}>
                      {(f, set) => (<>
                        <div className="grid grid-cols-2 gap-3"><TextField label="Date" type="date" required value={f.date} onChange={(v) => set("date", v)} /><TextField label="Time" type="time" required value={f.time} onChange={(v) => set("time", v)} /></div>
                        {clash(a.doctorId, f.date, f.time, a.id) && <p role="alert" className="text-sm text-destructive">This doctor already has an appointment at that time.</p>}
                      </>)}
                    </FormDialog>
                    <Button size="sm" variant="ghost" onClick={() => patch("appointments", a.id, { status: "Completed" }, `Completed appointment for ${name(a.patientId)}`)}><Check /> Complete</Button>
                    <Button size="sm" variant="ghost" onClick={() => patch("appointments", a.id, { status: "Cancelled" }, `Cancelled appointment for ${name(a.patientId)}`)}><X /> Cancel</Button>
                  </>)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Pagination {...pg} />
      </Card>
    </>
  )
}
