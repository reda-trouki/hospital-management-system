import { useState } from "react"
import { Link } from "react-router-dom"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageHeader } from "@/components/PageHeader"
import { EmptyRow, StatusBadge } from "@/components/common"
import { AddItem, StockTable } from "./StockTable"
import { useStore } from "@/lib/store"
import { can } from "@/lib/auth"

export default function Pharmacy() {
  const { prescriptions, patients, items, doctors, dispense, user } = useStore()
  const [tab, setTab] = useState("rx")
  const pending = prescriptions.filter((r) => r.status === "Pending").length
  const rows = [...prescriptions].sort((a, b) => (a.status === b.status ? b.date.localeCompare(a.date) : a.status === "Pending" ? -1 : 1))

  return (
    <>
      <PageHeader title="Pharmacy" description="Dispense prescriptions and manage medicine stock.">{tab === "stock" && <AddItem category="Medicine" />}</PageHeader>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList><TabsTrigger value="rx">Prescriptions{pending > 0 && ` (${pending} pending)`}</TabsTrigger><TabsTrigger value="stock">Medicine stock</TabsTrigger></TabsList>
        <TabsContent value="rx">
          <Card>
            <Table>
              <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Patient</TableHead><TableHead>Medicine</TableHead><TableHead>Dosage</TableHead><TableHead>Qty</TableHead><TableHead>Prescriber</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {rows.length === 0 && <EmptyRow cols={8} text="No prescriptions." />}
                {rows.map((r) => {
                  const item = items.find((i) => i.id === r.itemId)
                  const short = !!item && item.stock < r.qty
                  const p = patients.find((x) => x.id === r.patientId)
                  return (
                    <TableRow key={r.id}>
                      <TableCell>{r.date}</TableCell>
                      <TableCell><Link className="font-medium hover:underline" to={`/patients/${r.patientId}`}>{p?.name}</Link>{p && p.allergies !== "None known" && <div className="text-xs text-destructive">Allergy: {p.allergies}</div>}</TableCell>
                      <TableCell>{item?.name}<div className="text-xs text-muted-foreground">{item?.stock} {item?.unit} in stock</div></TableCell>
                      <TableCell className="max-w-48">{r.dosage}<div className="text-xs text-muted-foreground">{r.duration}</div></TableCell>
                      <TableCell>{r.qty}</TableCell>
                      <TableCell>{doctors.find((d) => d.id === r.doctorId)?.name}</TableCell>
                      <TableCell><StatusBadge status={r.status} /></TableCell>
                      <TableCell className="text-right">
                        {r.status === "Pending" && can(user!.role, "dispense") && <Button size="sm" disabled={short} title={short ? "Insufficient stock" : undefined} onClick={() => dispense(r.id)}><Check /> {short ? "Out of stock" : "Dispense"}</Button>}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
        <TabsContent value="stock"><StockTable category="Medicine" /></TabsContent>
      </Tabs>
    </>
  )
}
