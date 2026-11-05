import { useState } from "react"
import { Link } from "react-router-dom"
import { ClipboardCheck, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageHeader } from "@/components/PageHeader"
import { EmptyRow, Field, FormDialog, SearchInput, SelectField, StatusBadge } from "@/components/common"
import { useStore } from "@/lib/store"
import { can } from "@/lib/auth"
import { fmtDateTime } from "@/lib/utils"
import type { LabOrder } from "@/lib/types"

const order = { STAT: 0, Urgent: 1, Routine: 2 }

export default function Lab() {
  const { labs, patients, doctors, patch, user } = useStore()
  const [tab, setTab] = useState("open")
  const [q, setQ] = useState("")
  const pn = (id: string) => patients.find((p) => p.id === id)?.name ?? "Unknown"
  const rows = labs
    .filter((l) => (tab === "all" || (tab === "open" ? l.status !== "Completed" : l.status === "Completed")) && `${pn(l.patientId)} ${l.test}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => order[a.priority] - order[b.priority] || b.date.localeCompare(a.date))
  const tech = can(user!.role, "enterLabResult")

  return (
    <>
      <PageHeader title="Laboratory & imaging" description="Orders are placed from a patient's record by a doctor; technicians enter results here." />
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Tabs value={tab} onValueChange={setTab}><TabsList><TabsTrigger value="open">Open orders</TabsTrigger><TabsTrigger value="done">Completed</TabsTrigger><TabsTrigger value="all">All</TabsTrigger></TabsList></Tabs>
        <SearchInput value={q} onChange={setQ} placeholder="Search patient or test…" />
      </div>
      <Card>
        <Table>
          <TableHeader><TableRow><TableHead>Ordered</TableHead><TableHead>Patient</TableHead><TableHead>Test</TableHead><TableHead>Ordered by</TableHead><TableHead>Priority</TableHead><TableHead>Status</TableHead><TableHead>Result</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {rows.length === 0 && <EmptyRow cols={8} text="No lab orders." />}
            {rows.map((l) => (
              <TableRow key={l.id}>
                <TableCell className="whitespace-nowrap">{fmtDateTime(l.date)}</TableCell>
                <TableCell><Link className="font-medium hover:underline" to={`/patients/${l.patientId}`}>{pn(l.patientId)}</Link></TableCell>
                <TableCell>{l.test}</TableCell>
                <TableCell>{doctors.find((d) => d.id === l.doctorId)?.name}</TableCell>
                <TableCell><StatusBadge status={l.priority} /></TableCell>
                <TableCell><StatusBadge status={l.status} /></TableCell>
                <TableCell className="max-w-64">{l.result ? <div className="flex flex-col gap-1"><StatusBadge status={l.flag!} /><span className="text-xs">{l.result}</span></div> : "—"}</TableCell>
                <TableCell className="whitespace-nowrap text-right">
                  {tech && l.status === "Ordered" && <Button size="sm" variant="outline" onClick={() => patch("labs", l.id, { status: "In Progress" }, `Started ${l.test} for ${pn(l.patientId)}`)}><Play /> Start</Button>}
                  {tech && l.status !== "Completed" && (
                    <FormDialog title={`Enter result: ${l.test}`} description={pn(l.patientId)} trigger={<Button size="sm"><ClipboardCheck /> Result</Button>} initial={{ result: "", flag: "Normal" }} valid={(f) => !!f.result.trim()}
                      onSubmit={(f) => patch("labs", l.id, { status: "Completed", result: f.result.trim(), flag: f.flag as LabOrder["flag"] }, `Result entered: ${l.test} (${pn(l.patientId)}) — ${f.flag}`)}>
                      {(f, set) => (<>
                        <Field label="Result"><Textarea required rows={4} value={f.result} onChange={(e) => set("result", e.target.value)} placeholder="Values, units, reference ranges…" /></Field>
                        <SelectField label="Interpretation" value={f.flag} onChange={(v) => set("flag", v)} options={["Normal", "Abnormal", "Critical"]} />
                      </>)}
                    </FormDialog>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </>
  )
}
