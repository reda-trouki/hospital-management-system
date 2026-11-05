import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageHeader } from "@/components/PageHeader"
import { EmptyRow, FormDialog, SelectField, StatusBadge, TextField } from "@/components/common"
import { useStore } from "@/lib/store"
import { can } from "@/lib/auth"
import { today } from "@/lib/utils"
import type { Surgery } from "@/lib/types"

const ROOMS = ["OR-1", "OR-2", "OR-3", "OR-4"]
const toMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5))

export default function Surgeries() {
  const { surgeries, patients, doctors, add, patch, user } = useStore()
  const [tab, setTab] = useState("Scheduled")
  const pn = (id: string) => patients.find((p) => p.id === id)?.name ?? "Unknown"
  const rows = surgeries.filter((s) => tab === "all" || s.status === tab).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
  const conflict = (room: string, date: string, time: string, dur: number) =>
    surgeries.find((s) => s.status !== "Cancelled" && s.status !== "Completed" && s.room === room && s.date === date && toMin(time) < toMin(s.time) + s.duration && toMin(s.time) < toMin(time) + dur)
  const setStatus = (s: Surgery, status: Surgery["status"]) => patch("surgeries", s.id, { status }, `${s.procedure} (${pn(s.patientId)}) → ${status}`)

  return (
    <>
      <PageHeader title="Surgeries" description="Operating theatre schedule.">
        {can(user!.role, "scheduleSurgery") && (
          <FormDialog title="Schedule surgery" description="Rooms are checked for time conflicts." trigger={<Button><Plus /> Schedule surgery</Button>}
            initial={{ patientId: "", surgeonId: "", procedure: "", room: "OR-1", date: today(), time: "08:00", duration: "60" }}
            valid={(f) => !!f.patientId && !!f.surgeonId && !!f.procedure.trim() && Number(f.duration) > 0 && !conflict(f.room, f.date, f.time, Number(f.duration))}
            onSubmit={(f) => add("surgeries", { patientId: f.patientId, surgeonId: f.surgeonId, procedure: f.procedure.trim(), room: f.room, date: f.date, time: f.time, duration: Number(f.duration), status: "Scheduled" }, `Scheduled ${f.procedure.trim()} for ${pn(f.patientId)}`)}>
            {(f, set) => { const c = conflict(f.room, f.date, f.time, Number(f.duration) || 0); return (<>
              <SelectField label="Patient" value={f.patientId} onChange={(v) => set("patientId", v)} options={patients.map((p) => ({ value: p.id, label: p.name }))} placeholder="Select patient" />
              <SelectField label="Surgeon" value={f.surgeonId} onChange={(v) => set("surgeonId", v)} options={doctors.filter((d) => d.status !== "On Leave").map((d) => ({ value: d.id, label: `${d.name} — ${d.specialty}` }))} placeholder="Select surgeon" />
              <TextField label="Procedure" required value={f.procedure} onChange={(v) => set("procedure", v)} />
              <div className="grid grid-cols-2 gap-3"><SelectField label="Room" value={f.room} onChange={(v) => set("room", v)} options={ROOMS} /><TextField label="Duration (min)" type="number" min={15} step={15} value={f.duration} onChange={(v) => set("duration", v)} /></div>
              <div className="grid grid-cols-2 gap-3"><TextField label="Date" type="date" required value={f.date} onChange={(v) => set("date", v)} /><TextField label="Start time" type="time" required value={f.time} onChange={(v) => set("time", v)} /></div>
              {c && <p role="alert" className="text-sm text-destructive">{f.room} is booked on {c.date} from {c.time} for {c.duration} min ({c.procedure}).</p>}
            </>) }}
          </FormDialog>
        )}
      </PageHeader>
      <Tabs value={tab} onValueChange={setTab} className="mb-4">
        <TabsList>{["Scheduled", "In Progress", "Completed", "Cancelled", "all"].map((t) => <TabsTrigger key={t} value={t}>{t === "all" ? "All" : t}</TabsTrigger>)}</TabsList>
      </Tabs>
      <Card>
        <Table>
          <TableHeader><TableRow><TableHead>Date & time</TableHead><TableHead>Procedure</TableHead><TableHead>Patient</TableHead><TableHead>Surgeon</TableHead><TableHead>Room</TableHead><TableHead>Duration</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {rows.length === 0 && <EmptyRow cols={8} text="No surgeries." />}
            {rows.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="whitespace-nowrap font-medium">{s.date} · {s.time}</TableCell>
                <TableCell>{s.procedure}</TableCell><TableCell>{pn(s.patientId)}</TableCell>
                <TableCell>{doctors.find((d) => d.id === s.surgeonId)?.name}</TableCell><TableCell>{s.room}</TableCell><TableCell>{s.duration} min</TableCell>
                <TableCell><StatusBadge status={s.status} /></TableCell>
                <TableCell className="whitespace-nowrap text-right">
                  {can(user!.role, "scheduleSurgery") && s.status === "Scheduled" && (<><Button size="sm" variant="outline" onClick={() => setStatus(s, "In Progress")}>Start</Button><Button size="sm" variant="ghost" onClick={() => setStatus(s, "Cancelled")}>Cancel</Button></>)}
                  {can(user!.role, "scheduleSurgery") && s.status === "In Progress" && <Button size="sm" variant="outline" onClick={() => setStatus(s, "Completed")}>Complete</Button>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </>
  )
}
