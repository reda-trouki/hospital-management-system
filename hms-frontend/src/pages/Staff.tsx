import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PageHeader } from "@/components/PageHeader"
import { EmptyRow, FormDialog, SelectField, TextField } from "@/components/common"
import { useStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import type { Shift, Staff as StaffT } from "@/lib/types"

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const SHIFTS: Shift[] = ["Morning", "Evening", "Night", "Off"]
const HOURS: Record<Shift, string> = { Morning: "07:00–15:00", Evening: "15:00–23:00", Night: "23:00–07:00", Off: "Day off" }
const tone: Record<Shift, string> = {
  Morning: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300", Evening: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  Night: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300", Off: "bg-muted text-muted-foreground",
}

export default function Staff() {
  const { staff, add, patch, remove } = useStore()
  const setShift = (s: StaffT, day: number, v: Shift) => patch("staff", s.id, { shifts: s.shifts.map((x, i) => (i === day ? v : x)) }, `Roster: ${s.name} ${DAYS[day]} → ${v}`)
  const coverage = DAYS.map((_, i) => SHIFTS.slice(0, 3).map((sh) => staff.filter((s) => s.shifts[i] === sh).length))

  return (
    <>
      <PageHeader title="Staff & shifts" description="Weekly roster for nurses, technicians and support staff.">
        <FormDialog title="Add staff member" trigger={<Button><Plus /> Add staff</Button>} initial={{ name: "", role: "Nurse", department: "", phone: "" }} valid={(f) => !!f.name.trim()}
          onSubmit={(f) => add("staff", { name: f.name.trim(), role: f.role as StaffT["role"], department: f.department, phone: f.phone, shifts: Array(7).fill("Off") as Shift[] }, `Added staff member ${f.name.trim()}`)}>
          {(f, set) => (<>
            <TextField label="Name" required value={f.name} onChange={(v) => set("name", v)} />
            <SelectField label="Role" value={f.role} onChange={(v) => set("role", v)} options={["Nurse", "Lab Technician", "Pharmacist", "Receptionist", "Administrator"]} />
            <TextField label="Department" value={f.department} onChange={(v) => set("department", v)} />
            <TextField label="Phone" value={f.phone} onChange={(v) => set("phone", v)} />
          </>)}
        </FormDialog>
      </PageHeader>
      <Card>
        <Table>
          <TableHeader><TableRow><TableHead>Staff</TableHead>{DAYS.map((d) => <TableHead key={d}>{d}</TableHead>)}<TableHead /></TableRow></TableHeader>
          <TableBody>
            {staff.length === 0 && <EmptyRow cols={9} text="No staff yet." />}
            {staff.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="min-w-40"><div className="font-medium">{s.name}</div><div className="text-xs text-muted-foreground">{s.role} · {s.department || "—"}</div></TableCell>
                {s.shifts.map((sh, i) => (
                  <TableCell key={i} className="px-2">
                    <select aria-label={`${s.name} ${DAYS[i]} shift`} title={HOURS[sh]} value={sh} onChange={(e) => setShift(s, i, e.target.value as Shift)} className={cn("h-8 w-[5.5rem] cursor-pointer rounded-md border-0 px-1.5 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", tone[sh])}>
                      {SHIFTS.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </TableCell>
                ))}
                <TableCell><Button size="icon" variant="ghost" aria-label={`Remove ${s.name}`} onClick={() => confirm(`Remove ${s.name}?`) && remove("staff", s.id, `Removed staff member ${s.name}`)}><Trash2 className="text-destructive" /></Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
      <Card className="mt-4 p-4">
        <h2 className="mb-3 text-sm font-semibold">Daily coverage (Morning / Evening / Night)</h2>
        <div className="grid grid-cols-7 gap-2 text-center text-sm">
          {DAYS.map((d, i) => (
            <div key={d} className="rounded-lg border p-2"><div className="text-xs text-muted-foreground">{d}</div><div className="mt-1 font-semibold">{coverage[i].join(" / ")}</div>{coverage[i].some((n) => n === 0) && <div className="text-[10px] text-destructive">gap</div>}</div>
          ))}
        </div>
      </Card>
    </>
  )
}
