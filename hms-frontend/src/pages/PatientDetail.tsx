import { Link, useParams } from "react-router-dom"
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { AlertTriangle, ArrowLeft, FlaskConical, HeartPulse, LogOut, Pencil, Phone, Pill, Plus, ShieldCheck, Stethoscope } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { initials } from "@/components/PageHeader"
import { EmptyRow, Field, FormDialog, SelectField, StatusBadge, TextField } from "@/components/common"
import { useStore } from "@/lib/store"
import { can } from "@/lib/auth"
import { calc } from "@/lib/billing"
import { fmtDateTime, money, nowIso, today } from "@/lib/utils"
import type { LabOrder, Note } from "@/lib/types"

export const LAB_TESTS = ["Complete Blood Count", "Basic Metabolic Panel", "Lipid Panel", "HbA1c", "Troponin I", "Liver Function Test", "Urinalysis", "Chest X-ray", "ECG", "CT Scan", "MRI"]

function Info({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div><div className="mt-1 text-sm font-medium">{children || "—"}</div></div>
}

export default function PatientDetail() {
  const { id } = useParams()
  const db = useStore()
  const { user, add, patch, dischargePatient } = db
  const p = db.patients.find((x) => x.id === id)
  if (!p) return <div className="space-y-3"><p>Patient not found.</p><Button asChild variant="outline"><Link to="/patients"><ArrowLeft /> Back to patients</Link></Button></div>

  const role = user!.role
  const doctorId = user!.linkedId && db.doctors.some((d) => d.id === user!.linkedId) ? user!.linkedId : db.doctors[0]?.id
  const vitals = db.vitals.filter((v) => v.patientId === p.id).sort((a, b) => b.date.localeCompare(a.date))
  const notes = db.notes.filter((n) => n.patientId === p.id).sort((a, b) => b.date.localeCompare(a.date))
  const rxs = db.prescriptions.filter((r) => r.patientId === p.id).sort((a, b) => b.date.localeCompare(a.date))
  const labs = db.labs.filter((l) => l.patientId === p.id).sort((a, b) => b.date.localeCompare(a.date))
  const invoices = db.invoices.filter((i) => i.patientId === p.id)
  const appts = db.appointments.filter((a) => a.patientId === p.id).sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time))
  const hasAllergy = p.allergies && p.allergies !== "None known" && p.allergies.toLowerCase() !== "none"
  const chart = [...vitals].reverse().map((v) => ({ day: v.date.slice(5, 10), "Heart rate": v.hr, "SpO₂": v.spo2 }))
  const last = vitals[0]
  const medicines = db.items.filter((i) => i.category === "Medicine")

  return (
    <>
      <Button asChild variant="ghost" size="sm" className="mb-3 -ml-2"><Link to="/patients"><ArrowLeft /> Patients</Link></Button>
      <Card className="mb-4">
        <CardContent className="flex flex-wrap items-center gap-4 p-6">
          <Avatar className="size-14"><AvatarFallback className="text-base">{initials(p.name)}</AvatarFallback></Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2"><h1 className="text-2xl font-semibold tracking-tight">{p.name}</h1><StatusBadge status={p.status} /></div>
            <p className="text-sm text-muted-foreground">{p.id} · {p.age} yrs · {p.gender} · Blood {p.bloodType} · {p.condition}</p>
          </div>
          <div className="flex gap-2">
            {can(role, "registerPatient") && (
              <FormDialog title="Edit patient" trigger={<Button variant="outline"><Pencil /> Edit</Button>} initial={{ name: p.name, phone: p.phone, condition: p.condition, allergies: p.allergies, emergencyContact: p.emergencyContact, insurer: p.insurer, policyNo: p.policyNo, coverage: String(p.coverage) }}
                onSubmit={(f) => patch("patients", p.id, { ...f, coverage: Number(f.coverage) || 0 }, `Updated record of ${p.name}`)}>
                {(f, set) => (<>
                  <TextField label="Full name" required value={f.name} onChange={(v) => set("name", v)} />
                  <TextField label="Phone" value={f.phone} onChange={(v) => set("phone", v)} />
                  <TextField label="Condition" value={f.condition} onChange={(v) => set("condition", v)} />
                  <TextField label="Allergies" value={f.allergies} onChange={(v) => set("allergies", v)} />
                  <TextField label="Emergency contact" value={f.emergencyContact} onChange={(v) => set("emergencyContact", v)} />
                  <div className="grid grid-cols-3 gap-3"><TextField label="Insurer" value={f.insurer} onChange={(v) => set("insurer", v)} /><TextField label="Policy no." value={f.policyNo} onChange={(v) => set("policyNo", v)} /><TextField label="Coverage %" type="number" value={f.coverage} onChange={(v) => set("coverage", v)} /></div>
                </>)}
              </FormDialog>
            )}
            {p.status === "Admitted" && can(role, "discharge") && <Button variant="outline" onClick={() => dischargePatient(p.id)}><LogOut /> Discharge</Button>}
          </div>
        </CardContent>
      </Card>

      {hasAllergy && (
        <div role="alert" className="mb-4 flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertTriangle className="size-4 shrink-0" /><span><strong>Allergies:</strong> {p.allergies}</span>
        </div>
      )}

      <Tabs defaultValue="overview">
        <TabsList className="flex h-auto flex-wrap justify-start">
          {[["overview", "Overview"], ["vitals", `Vitals (${vitals.length})`], ["notes", `Notes (${notes.length})`], ["rx", `Prescriptions (${rxs.length})`], ["labs", `Lab (${labs.length})`], ["appts", `Appointments (${appts.length})`], ["billing", `Billing (${invoices.length})`]].map(([v, l]) => <TabsTrigger key={v} value={v}>{l}</TabsTrigger>)}
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-4 lg:grid-cols-3">
            <Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><Stethoscope className="size-4" /> Admission</CardTitle></CardHeader><CardContent className="grid grid-cols-2 gap-4">
              <Info label="Admitted on">{p.admittedOn}</Info><Info label="Bed">{p.bedId}</Info><Info label="Condition">{p.condition}</Info><Info label="Status">{p.status}</Info></CardContent></Card>
            <Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><Phone className="size-4" /> Contact</CardTitle></CardHeader><CardContent className="grid gap-4">
              <Info label="Phone">{p.phone}</Info><Info label="Emergency contact">{p.emergencyContact}</Info></CardContent></Card>
            <Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><ShieldCheck className="size-4" /> Insurance</CardTitle></CardHeader><CardContent className="grid grid-cols-2 gap-4">
              <Info label="Provider">{p.insurer || "Self-pay"}</Info><Info label="Policy no.">{p.policyNo}</Info><Info label="Coverage">{p.coverage ? `${p.coverage}%` : "—"}</Info></CardContent></Card>
          </div>
          {last && (
            <Card className="mt-4"><CardHeader><CardTitle className="flex items-center gap-2 text-base"><HeartPulse className="size-4" /> Latest vitals</CardTitle><CardDescription>{fmtDateTime(last.date)} · recorded by {last.by}</CardDescription></CardHeader>
              <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-5"><Info label="Blood pressure">{last.bp}</Info><Info label="Heart rate">{last.hr} bpm</Info><Info label="Temperature">{last.temp} °C</Info><Info label="SpO₂">{last.spo2}%</Info><Info label="Weight">{last.weight} kg</Info></CardContent></Card>
          )}
        </TabsContent>

        <TabsContent value="vitals">
          <div className="mb-3 flex justify-end">
            {can(role, "recordVitals") && (
              <FormDialog title="Record vitals" trigger={<Button><Plus /> Record vitals</Button>} initial={{ bp: "120/80", hr: "", temp: "", spo2: "", weight: "" }} valid={(f) => !!f.bp && !!f.hr && !!f.temp && !!f.spo2}
                onSubmit={(f) => add("vitals", { patientId: p.id, date: nowIso(), bp: f.bp, hr: Number(f.hr), temp: Number(f.temp), spo2: Number(f.spo2), weight: Number(f.weight) || 0, by: user!.name }, `Recorded vitals for ${p.name}`)}>
                {(f, set) => (<div className="grid grid-cols-2 gap-3">
                  <TextField label="Blood pressure" value={f.bp} onChange={(v) => set("bp", v)} placeholder="120/80" />
                  <TextField label="Heart rate (bpm)" type="number" value={f.hr} onChange={(v) => set("hr", v)} />
                  <TextField label="Temperature (°C)" type="number" step="0.1" value={f.temp} onChange={(v) => set("temp", v)} />
                  <TextField label="SpO₂ (%)" type="number" max={100} value={f.spo2} onChange={(v) => set("spo2", v)} />
                  <TextField label="Weight (kg)" type="number" value={f.weight} onChange={(v) => set("weight", v)} />
                </div>)}
              </FormDialog>
            )}
          </div>
          {chart.length > 1 && (
            <Card className="mb-4"><CardContent className="h-56 p-4">
              <ResponsiveContainer width="100%" height="100%"><LineChart data={chart}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="day" fontSize={12} stroke="var(--muted-foreground)" /><YAxis fontSize={12} domain={["auto", "auto"]} stroke="var(--muted-foreground)" />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", background: "var(--popover)", color: "var(--popover-foreground)" }} /><Legend />
                <Line type="monotone" dataKey="Heart rate" stroke="var(--primary)" strokeWidth={2} dot /><Line type="monotone" dataKey="SpO₂" stroke="oklch(0.65 0.18 30)" strokeWidth={2} dot />
              </LineChart></ResponsiveContainer>
            </CardContent></Card>
          )}
          <Card><Table>
            <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>BP</TableHead><TableHead>HR</TableHead><TableHead>Temp</TableHead><TableHead>SpO₂</TableHead><TableHead>Weight</TableHead><TableHead>By</TableHead></TableRow></TableHeader>
            <TableBody>{vitals.length === 0 && <EmptyRow cols={7} text="No vitals recorded." />}
              {vitals.map((v) => <TableRow key={v.id}><TableCell className="whitespace-nowrap">{fmtDateTime(v.date)}</TableCell><TableCell>{v.bp}</TableCell><TableCell>{v.hr}</TableCell><TableCell className={v.temp >= 38 ? "font-medium text-destructive" : ""}>{v.temp}°C</TableCell><TableCell className={v.spo2 < 94 ? "font-medium text-destructive" : ""}>{v.spo2}%</TableCell><TableCell>{v.weight} kg</TableCell><TableCell>{v.by}</TableCell></TableRow>)}
            </TableBody></Table></Card>
        </TabsContent>

        <TabsContent value="notes">
          <div className="mb-3 flex justify-end">
            {can(role, "writeClinical") && (
              <FormDialog title="Add clinical note" trigger={<Button><Plus /> Add note</Button>} initial={{ type: "Progress", text: "" }} valid={(f) => !!f.text.trim()}
                onSubmit={(f) => add("notes", { patientId: p.id, date: nowIso(), author: user!.name, type: f.type as Note["type"], text: f.text.trim() }, `Added ${f.type.toLowerCase()} note for ${p.name}`)}>
                {(f, set) => (<>
                  <SelectField label="Type" value={f.type} onChange={(v) => set("type", v)} options={["Progress", "Diagnosis", "Procedure", "Discharge"]} />
                  <Field label="Note"><Textarea required rows={5} value={f.text} onChange={(e) => set("text", e.target.value)} /></Field>
                </>)}
              </FormDialog>
            )}
          </div>
          <div className="space-y-3">
            {notes.length === 0 && <Card><CardContent className="p-6 text-center text-sm text-muted-foreground">No clinical notes yet.</CardContent></Card>}
            {notes.map((n) => (
              <Card key={n.id}><CardContent className="p-5">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2"><div className="flex items-center gap-2"><StatusBadge status={n.type === "Diagnosis" ? "Critical" : "Routine"} /><span className="text-sm font-medium">{n.type}</span></div><span className="text-xs text-muted-foreground">{n.author} · {fmtDateTime(n.date)}</span></div>
                <p className="whitespace-pre-wrap text-sm">{n.text}</p>
              </CardContent></Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="rx">
          <div className="mb-3 flex justify-end">
            {can(role, "writeClinical") && (
              <FormDialog title="New prescription" trigger={<Button><Pill /> Prescribe</Button>} initial={{ itemId: "", dosage: "", duration: "", qty: "", instructions: "" }} valid={(f) => !!f.itemId && !!f.dosage && Number(f.qty) > 0}
                onSubmit={(f) => add("prescriptions", { patientId: p.id, doctorId: doctorId!, itemId: f.itemId, dosage: f.dosage, duration: f.duration, qty: Number(f.qty), instructions: f.instructions, date: today(), status: "Pending" }, `Prescribed ${medicines.find((m) => m.id === f.itemId)?.name} to ${p.name}`)}>
                {(f, set) => {
                  const med = medicines.find((m) => m.id === f.itemId)
                  const clash = med && hasAllergy && p.allergies.toLowerCase().split(/[,;/]/).some((a) => a.trim() && med.name.toLowerCase().includes(a.trim().split(" ")[0]))
                  return (<>
                    <SelectField label="Medicine" value={f.itemId} onChange={(v) => set("itemId", v)} options={medicines.map((m) => ({ value: m.id, label: `${m.name} (${m.stock} in stock)` }))} />
                    {clash && <p role="alert" className="rounded-md border border-destructive/40 bg-destructive/10 p-2 text-sm text-destructive">⚠ Possible allergy conflict: patient is allergic to {p.allergies}.</p>}
                    <TextField label="Dosage" placeholder="e.g. 500mg three times daily" value={f.dosage} onChange={(v) => set("dosage", v)} />
                    <div className="grid grid-cols-2 gap-3"><TextField label="Duration" placeholder="7 days" value={f.duration} onChange={(v) => set("duration", v)} /><TextField label="Quantity" type="number" min={1} value={f.qty} onChange={(v) => set("qty", v)} /></div>
                    <TextField label="Instructions" value={f.instructions} onChange={(v) => set("instructions", v)} />
                  </>)
                }}
              </FormDialog>
            )}
          </div>
          <Card><Table>
            <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Medicine</TableHead><TableHead>Dosage</TableHead><TableHead>Duration</TableHead><TableHead>Qty</TableHead><TableHead>Prescriber</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>{rxs.length === 0 && <EmptyRow cols={7} text="No prescriptions." />}
              {rxs.map((r) => <TableRow key={r.id}><TableCell>{r.date}</TableCell><TableCell className="font-medium">{db.items.find((i) => i.id === r.itemId)?.name}</TableCell><TableCell>{r.dosage}</TableCell><TableCell>{r.duration}</TableCell><TableCell>{r.qty}</TableCell><TableCell>{db.doctors.find((d) => d.id === r.doctorId)?.name}</TableCell><TableCell><StatusBadge status={r.status} /></TableCell></TableRow>)}
            </TableBody></Table></Card>
        </TabsContent>

        <TabsContent value="labs">
          <div className="mb-3 flex justify-end">
            {can(role, "orderLab") && (
              <FormDialog title="Order lab / imaging test" trigger={<Button><FlaskConical /> Order test</Button>} initial={{ test: "", priority: "Routine" }} valid={(f) => !!f.test}
                onSubmit={(f) => add("labs", { patientId: p.id, doctorId: doctorId!, test: f.test, priority: f.priority as LabOrder["priority"], date: nowIso(), status: "Ordered" }, `Ordered ${f.test} for ${p.name}`)}>
                {(f, set) => (<>
                  <SelectField label="Test" value={f.test} onChange={(v) => set("test", v)} options={LAB_TESTS} />
                  <SelectField label="Priority" value={f.priority} onChange={(v) => set("priority", v)} options={["Routine", "Urgent", "STAT"]} />
                </>)}
              </FormDialog>
            )}
          </div>
          <Card><Table>
            <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Test</TableHead><TableHead>Priority</TableHead><TableHead>Status</TableHead><TableHead>Result</TableHead></TableRow></TableHeader>
            <TableBody>{labs.length === 0 && <EmptyRow cols={5} text="No lab orders." />}
              {labs.map((l) => <TableRow key={l.id}><TableCell className="whitespace-nowrap">{fmtDateTime(l.date)}</TableCell><TableCell className="font-medium">{l.test}</TableCell><TableCell><StatusBadge status={l.priority} /></TableCell><TableCell><StatusBadge status={l.status} /></TableCell><TableCell>{l.result ? <div className="flex items-center gap-2"><StatusBadge status={l.flag!} /><span className="text-sm">{l.result}</span></div> : "—"}</TableCell></TableRow>)}
            </TableBody></Table></Card>
        </TabsContent>

        <TabsContent value="appts">
          <Card><Table>
            <TableHeader><TableRow><TableHead>Date & time</TableHead><TableHead>Doctor</TableHead><TableHead>Reason</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>{appts.length === 0 && <EmptyRow cols={4} text="No appointments." />}
              {appts.map((a) => <TableRow key={a.id}><TableCell>{a.date} · {a.time}</TableCell><TableCell>{db.doctors.find((d) => d.id === a.doctorId)?.name}</TableCell><TableCell>{a.reason}</TableCell><TableCell><StatusBadge status={a.status} /></TableCell></TableRow>)}
            </TableBody></Table></Card>
        </TabsContent>

        <TabsContent value="billing">
          <Card><Table>
            <TableHeader><TableRow><TableHead>Invoice</TableHead><TableHead>Date</TableHead><TableHead className="text-right">Total</TableHead><TableHead className="text-right">Balance</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>{invoices.length === 0 && <EmptyRow cols={5} text="No invoices." />}
              {invoices.map((i) => { const c = calc(i); return <TableRow key={i.id}><TableCell className="font-medium">{i.id}</TableCell><TableCell>{i.date}</TableCell><TableCell className="text-right">{money(c.total)}</TableCell><TableCell className="text-right">{money(c.balance)}</TableCell><TableCell><StatusBadge status={c.status} /></TableCell></TableRow> })}
            </TableBody></Table></Card>
        </TabsContent>
      </Tabs>
    </>
  )
}
