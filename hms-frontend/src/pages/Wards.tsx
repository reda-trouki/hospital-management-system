import { useState } from "react"
import { BedDouble } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PageHeader } from "@/components/PageHeader"
import { useStore } from "@/lib/store"
import { cn } from "@/lib/utils"

export default function Wards() {
  const { beds, patients, assignBed, freeBed } = useStore()
  const [selected, setSelected] = useState<string | null>(null)
  const [pid, setPid] = useState("")
  const bed = beds.find((b) => b.id === selected)
  const occupant = patients.find((p) => p.id === bed?.patientId)
  const wards = [...new Set(beds.map((b) => b.ward))]
  const candidates = patients.filter((p) => p.status !== "Discharged" && !p.bedId)

  const close = () => { setSelected(null); setPid("") }

  return (
    <>
      <PageHeader title="Wards & Beds" description="Click a bed to admit a patient or free it up." />
      <div className="mb-4 flex gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-2"><span className="size-3 rounded bg-accent ring-1 ring-primary/30" /> Free</span>
        <span className="flex items-center gap-2"><span className="size-3 rounded bg-primary" /> Occupied</span>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {wards.map((w) => {
          const wb = beds.filter((b) => b.ward === w)
          return (
            <Card key={w}>
              <CardHeader><CardTitle>{w}</CardTitle><CardDescription>{wb.filter((b) => b.patientId).length} / {wb.length} occupied</CardDescription></CardHeader>
              <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {wb.map((b) => {
                  const p = patients.find((x) => x.id === b.patientId)
                  return (
                    <button key={b.id} onClick={() => setSelected(b.id)}
                      className={cn("flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        p ? "border-primary bg-primary text-primary-foreground" : "bg-accent/60 hover:bg-accent")}>
                      <BedDouble className="size-4" />
                      <span className="text-xs font-semibold">{b.id}</span>
                      <span className="w-full truncate text-xs opacity-80">{p ? p.name : "Available"}</span>
                    </button>
                  )
                })}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Dialog open={!!bed} onOpenChange={(o) => !o && close()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bed {bed?.id}</DialogTitle>
            <DialogDescription>{bed?.ward} ward</DialogDescription>
          </DialogHeader>
          {occupant ? (
            <>
              <div className="rounded-lg border p-4 text-sm"><div className="font-medium">{occupant.name}</div><div className="text-muted-foreground">{occupant.condition}</div></div>
              <DialogFooter><Button variant="outline" onClick={() => { freeBed(bed!.id); close() }}>Free this bed</Button></DialogFooter>
            </>
          ) : (
            <>
              <div className="grid gap-2"><Label>Assign patient</Label>
                <Select value={pid} onValueChange={setPid}><SelectTrigger><SelectValue placeholder={candidates.length ? "Select patient" : "No patients waiting"} /></SelectTrigger>
                  <SelectContent>{candidates.map((p) => <SelectItem key={p.id} value={p.id}>{p.name} — {p.condition}</SelectItem>)}</SelectContent></Select></div>
              <DialogFooter><Button disabled={!pid} onClick={() => { assignBed(bed!.id, pid); close() }}>Admit to bed</Button></DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
