import { useEffect, useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PageHeader } from "@/components/PageHeader"
import { EmptyRow, FormDialog, SelectField, StatCard, StatusBadge, TextField } from "@/components/common"
import { useStore } from "@/lib/store"
import { cn, minutesSince, nowIso } from "@/lib/utils"
import { AlertTriangle, Clock, Siren, Stethoscope } from "lucide-react"
import type { EmergencyCase } from "@/lib/types"

export const TRIAGE: Record<number, { label: string; cls: string }> = {
  1: { label: "1 · Resuscitation", cls: "bg-red-600 text-white" },
  2: { label: "2 · Emergent", cls: "bg-orange-500 text-white" },
  3: { label: "3 · Urgent", cls: "bg-yellow-400 text-yellow-950" },
  4: { label: "4 · Less urgent", cls: "bg-green-500 text-white" },
  5: { label: "5 · Non-urgent", cls: "bg-sky-500 text-white" },
}

export default function Emergency() {
  const { emergency, add, patch } = useStore()
  const [, tick] = useState(0)
  useEffect(() => { const t = setInterval(() => tick((n) => n + 1), 30000); return () => clearInterval(t) }, [])
  const active = emergency.filter((e) => e.status === "Waiting" || e.status === "In Treatment").sort((a, b) => a.triage - b.triage || a.arrival.localeCompare(b.arrival))
  const closed = emergency.filter((e) => e.status === "Admitted" || e.status === "Discharged").sort((a, b) => b.arrival.localeCompare(a.arrival)).slice(0, 8)
  const setStatus = (e: EmergencyCase, status: EmergencyCase["status"]) => patch("emergency", e.id, { status }, `ER: ${e.name} → ${status}`)
  const waits = active.filter((e) => e.status === "Waiting").map((e) => minutesSince(e.arrival))

  return (
    <>
      <PageHeader title="Emergency department" description="Live triage queue, sorted by urgency then arrival time.">
        <FormDialog title="Register ER arrival" description="Assign a triage level (1 = most critical)." trigger={<Button variant="destructive"><Plus /> New arrival</Button>} initial={{ name: "", age: "", complaint: "", triage: "3" }} valid={(f) => !!f.name.trim() && !!f.complaint.trim() && f.age !== ""}
          onSubmit={(f) => add("emergency", { name: f.name.trim(), age: Number(f.age), complaint: f.complaint.trim(), triage: Number(f.triage) as EmergencyCase["triage"], arrival: nowIso(), status: "Waiting" }, `ER arrival: ${f.name.trim()} (triage ${f.triage})`)}>
          {(f, set) => (<>
            <TextField label="Patient name" required value={f.name} onChange={(v) => set("name", v)} placeholder="Use 'Unknown' if unidentified" />
            <div className="grid grid-cols-2 gap-3"><TextField label="Age" type="number" min={0} required value={f.age} onChange={(v) => set("age", v)} /><SelectField label="Triage level" value={f.triage} onChange={(v) => set("triage", v)} options={Object.entries(TRIAGE).map(([k, v]) => ({ value: k, label: v.label }))} /></div>
            <TextField label="Chief complaint" required value={f.complaint} onChange={(v) => set("complaint", v)} />
          </>)}
        </FormDialog>
      </PageHeader>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Waiting" value={active.filter((e) => e.status === "Waiting").length} icon={Clock} />
        <StatCard label="In treatment" value={active.filter((e) => e.status === "In Treatment").length} icon={Stethoscope} />
        <StatCard label="Critical (level 1–2)" value={active.filter((e) => e.triage <= 2).length} icon={Siren} tone={active.some((e) => e.triage <= 2) ? "danger" : undefined} />
        <StatCard label="Longest wait" value={waits.length ? `${Math.max(...waits)} min` : "—"} icon={AlertTriangle} />
      </div>

      <Card>
        <Table>
          <TableHeader><TableRow><TableHead>Triage</TableHead><TableHead>Patient</TableHead><TableHead>Complaint</TableHead><TableHead>Waiting</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {active.length === 0 && <EmptyRow cols={6} text="No active ER cases." />}
            {active.map((e) => (
              <TableRow key={e.id}>
                <TableCell><span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap", TRIAGE[e.triage].cls)}>{TRIAGE[e.triage].label}</span></TableCell>
                <TableCell><div className="font-medium">{e.name}</div><div className="text-xs text-muted-foreground">{e.age} yrs · {e.id}</div></TableCell>
                <TableCell className="max-w-64">{e.complaint}</TableCell>
                <TableCell className="whitespace-nowrap">{minutesSince(e.arrival)} min</TableCell>
                <TableCell><StatusBadge status={e.status} /></TableCell>
                <TableCell className="whitespace-nowrap text-right">
                  {e.status === "Waiting" && <Button size="sm" variant="outline" onClick={() => setStatus(e, "In Treatment")}>Start treatment</Button>}
                  {e.status === "In Treatment" && (<>
                    <Button size="sm" variant="ghost" onClick={() => setStatus(e, "Admitted")}>Admit</Button>
                    <Button size="sm" variant="ghost" onClick={() => setStatus(e, "Discharged")}>Discharge</Button>
                  </>)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {closed.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-2 text-sm font-semibold text-muted-foreground">Recently closed</h2>
          <div className="flex flex-wrap gap-2">{closed.map((e) => <Badge key={e.id} variant={e.status === "Admitted" ? "info" : "secondary"}>{e.name} · {e.status}</Badge>)}</div>
        </div>
      )}
    </>
  )
}
