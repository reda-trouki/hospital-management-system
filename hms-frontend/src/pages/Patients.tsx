import { useState } from "react"
import { Link } from "react-router-dom"
import { Download, LogOut, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageHeader, initials } from "@/components/PageHeader"
import { EmptyRow, FormDialog, Pagination, SearchInput, SelectField, StatusBadge, TextField, usePagination } from "@/components/common"
import { useStore } from "@/lib/store"
import { can } from "@/lib/auth"
import { downloadCSV } from "@/lib/utils"
import type { Patient } from "@/lib/types"

function AddPatient() {
  const { addPatient, beds } = useStore()
  const free = beds.filter((b) => !b.patientId)
  const initial = { name: "", age: "", gender: "Male", phone: "", bloodType: "O+", condition: "", allergies: "", emergencyContact: "", insurer: "", policyNo: "", coverage: "0", bedId: "none" }
  return (
    <FormDialog title="Register patient" description="Add a new patient record. Choose a bed to admit them." trigger={<Button><Plus /> New patient</Button>} initial={initial} submitLabel="Save patient" className="max-w-xl"
      valid={(f) => !!f.name.trim() && Number(f.age) >= 0 && f.age !== "" && !!f.condition.trim()}
      onSubmit={(f) => {
        const admitted = f.bedId !== "none"
        addPatient({ name: f.name.trim(), age: Number(f.age), gender: f.gender as Patient["gender"], phone: f.phone, bloodType: f.bloodType, condition: f.condition,
          status: admitted ? "Admitted" : "Outpatient", bedId: admitted ? f.bedId : undefined, allergies: f.allergies.trim() || "None known",
          emergencyContact: f.emergencyContact, insurer: f.insurer, policyNo: f.policyNo, coverage: Math.min(100, Math.max(0, Number(f.coverage) || 0)) })
      }}>
      {(f, set) => (<>
        <TextField label="Full name" id="name" required value={f.name} onChange={(v) => set("name", v)} />
        <div className="grid grid-cols-3 gap-3">
          <TextField label="Age" id="age" type="number" min={0} max={130} required value={f.age} onChange={(v) => set("age", v)} />
          <SelectField label="Gender" value={f.gender} onChange={(v) => set("gender", v)} options={["Male", "Female", "Other"]} />
          <SelectField label="Blood" value={f.bloodType} onChange={(v) => set("bloodType", v)} options={["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <TextField label="Phone" value={f.phone} onChange={(v) => set("phone", v)} />
          <TextField label="Emergency contact" placeholder="Name · phone" value={f.emergencyContact} onChange={(v) => set("emergencyContact", v)} />
        </div>
        <TextField label="Condition / diagnosis" required value={f.condition} onChange={(v) => set("condition", v)} />
        <TextField label="Allergies" placeholder="e.g. Penicillin, Latex" value={f.allergies} onChange={(v) => set("allergies", v)} />
        <div className="grid grid-cols-3 gap-3">
          <TextField label="Insurer" value={f.insurer} onChange={(v) => set("insurer", v)} />
          <TextField label="Policy no." value={f.policyNo} onChange={(v) => set("policyNo", v)} />
          <TextField label="Coverage %" type="number" min={0} max={100} value={f.coverage} onChange={(v) => set("coverage", v)} />
        </div>
        <SelectField label="Admit to bed (optional)" value={f.bedId} onChange={(v) => set("bedId", v)} options={[{ value: "none", label: "No bed (outpatient)" }, ...free.map((b) => ({ value: b.id, label: `${b.ward} · ${b.id}` }))]} />
      </>)}
    </FormDialog>
  )
}

export default function Patients() {
  const { patients, deletePatient, dischargePatient, user } = useStore()
  const [q, setQ] = useState("")
  const [tab, setTab] = useState("all")
  const filtered = patients.filter((p) => (tab === "all" || p.status === tab) && `${p.name} ${p.id} ${p.condition} ${p.phone}`.toLowerCase().includes(q.toLowerCase()))
  const pg = usePagination(filtered, 8)

  return (
    <>
      <PageHeader title="Patients" description={`${patients.length} patient records`}>
        <Button variant="outline" onClick={() => downloadCSV("patients.csv", patients.map(({ id, name, age, gender, phone, bloodType, condition, status, allergies, insurer }) => ({ id, name, age, gender, phone, bloodType, condition, status, allergies, insurer })))}><Download /> Export CSV</Button>
        {can(user!.role, "registerPatient") && <AddPatient />}
      </PageHeader>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Tabs value={tab} onValueChange={(v) => { setTab(v); pg.setPage(0) }}>
          <TabsList><TabsTrigger value="all">All</TabsTrigger><TabsTrigger value="Admitted">Admitted</TabsTrigger><TabsTrigger value="Outpatient">Outpatient</TabsTrigger><TabsTrigger value="Discharged">Discharged</TabsTrigger></TabsList>
        </Tabs>
        <SearchInput value={q} onChange={(v) => { setQ(v); pg.setPage(0) }} placeholder="Search name, ID, condition…" />
      </div>
      <Card>
        <Table>
          <TableHeader><TableRow><TableHead>Patient</TableHead><TableHead>Age / Sex</TableHead><TableHead>Blood</TableHead><TableHead>Condition</TableHead><TableHead>Allergies</TableHead><TableHead>Bed</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {pg.rows.length === 0 && <EmptyRow cols={8} text="No patients found." />}
            {pg.rows.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  <Link to={`/patients/${p.id}`} className="flex items-center gap-3 hover:underline">
                    <Avatar><AvatarFallback>{initials(p.name)}</AvatarFallback></Avatar>
                    <div><div className="font-medium">{p.name}</div><div className="text-xs text-muted-foreground">{p.id} · {p.phone}</div></div>
                  </Link>
                </TableCell>
                <TableCell>{p.age} · {p.gender[0]}</TableCell>
                <TableCell>{p.bloodType}</TableCell>
                <TableCell className="max-w-44 truncate">{p.condition}</TableCell>
                <TableCell className="max-w-32 truncate">{p.allergies && p.allergies !== "None known" ? <span className="font-medium text-destructive">{p.allergies}</span> : <span className="text-muted-foreground">None</span>}</TableCell>
                <TableCell>{p.bedId ?? "—"}</TableCell>
                <TableCell><StatusBadge status={p.status} /></TableCell>
                <TableCell className="whitespace-nowrap text-right">
                  {p.status === "Admitted" && can(user!.role, "discharge") && <Button size="sm" variant="ghost" onClick={() => dischargePatient(p.id)}><LogOut /> Discharge</Button>}
                  {can(user!.role, "deletePatient") && <Button size="icon" variant="ghost" title="Delete" aria-label={`Delete ${p.name}`} onClick={() => confirm(`Delete ${p.name} and all related records?`) && deletePatient(p.id)}><Trash2 className="text-destructive" /></Button>}
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
