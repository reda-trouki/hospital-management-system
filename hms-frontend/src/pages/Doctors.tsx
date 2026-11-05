import { Phone, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PageHeader, initials } from "@/components/PageHeader"
import { FormDialog, SelectField, StatusBadge, TextField } from "@/components/common"
import { useStore } from "@/lib/store"
import type { Doctor } from "@/lib/types"

const specialties = ["Cardiology", "Neurology", "Pediatrics", "Orthopedics", "Obstetrics", "General Surgery", "Radiology", "Emergency", "Oncology", "Dermatology"]

export default function Doctors() {
  const { doctors, appointments, surgeries, add, patch, user } = useStore()
  const canManage = user!.role === "Admin" || user!.role === "Receptionist"
  return (
    <>
      <PageHeader title="Doctors" description={`${doctors.length} medical staff`}>
        {user!.role === "Admin" && (
          <FormDialog title="Add doctor" description="Register a new member of the medical staff." trigger={<Button><Plus /> Add doctor</Button>} initial={{ name: "", specialty: "Cardiology", phone: "" }} valid={(f) => !!f.name.trim()}
            onSubmit={(f) => { const n = f.name.trim(); const full = /^dr\.?\s/i.test(n) ? n : `Dr. ${n}`; add("doctors", { name: full, specialty: f.specialty, phone: f.phone, status: "Available", patients: 0 }, `Added ${full}`) }}>
            {(f, set) => (<>
              <TextField label="Name" required value={f.name} onChange={(v) => set("name", v)} />
              <SelectField label="Specialty" value={f.specialty} onChange={(v) => set("specialty", v)} options={specialties} />
              <TextField label="Phone" value={f.phone} onChange={(v) => set("phone", v)} />
            </>)}
          </FormDialog>
        )}
      </PageHeader>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {doctors.map((d) => (
          <Card key={d.id}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Avatar className="size-12"><AvatarFallback className="text-sm">{initials(d.name)}</AvatarFallback></Avatar>
                <div className="min-w-0 flex-1"><div className="truncate font-semibold">{d.name}</div><div className="text-sm text-muted-foreground">{d.specialty}</div></div>
                <StatusBadge status={d.status} />
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground"><Phone className="size-4" />{d.phone || "—"}</div>
              <div className="mt-4 grid grid-cols-3 gap-3 border-t pt-4 text-sm">
                <div><div className="text-xs text-muted-foreground">Patients</div><div className="font-semibold">{d.patients}</div></div>
                <div><div className="text-xs text-muted-foreground">Appts</div><div className="font-semibold">{appointments.filter((a) => a.doctorId === d.id && a.status === "Scheduled").length}</div></div>
                <div><div className="text-xs text-muted-foreground">Surgeries</div><div className="font-semibold">{surgeries.filter((s) => s.surgeonId === d.id && s.status === "Scheduled").length}</div></div>
              </div>
              {canManage && (
                <div className="mt-4">
                  <Select value={d.status} onValueChange={(v) => patch("doctors", d.id, { status: v as Doctor["status"] }, `${d.name} is now ${v}`)}>
                    <SelectTrigger className="h-8" aria-label={`Status for ${d.name}`}><SelectValue /></SelectTrigger>
                    <SelectContent>{(["Available", "In Surgery", "On Leave"] as const).map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  )
}
