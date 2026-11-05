import { PackagePlus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { EmptyRow, FormDialog, TextField } from "@/components/common"
import { useStore } from "@/lib/store"
import { can } from "@/lib/auth"
import { addDays, money, today } from "@/lib/utils"
import type { Item } from "@/lib/types"

export function AddItem({ category }: { category: Item["category"] }) {
  const { add, user } = useStore()
  if (!can(user!.role, "manageStock")) return null
  return (
    <FormDialog title={`Add ${category.toLowerCase()}`} trigger={<Button><Plus /> Add {category.toLowerCase()}</Button>}
      initial={{ name: "", stock: "", reorder: "", unit: category === "Medicine" ? "tablets" : category === "Equipment" ? "units" : "pcs", price: "", location: "", date: "" }} valid={(f) => !!f.name.trim() && f.stock !== ""}
      onSubmit={(f) => add("items", { name: f.name.trim(), category, stock: Number(f.stock), reorder: Number(f.reorder) || 0, unit: f.unit, price: Number(f.price) || 0, location: f.location, ...(category === "Medicine" && f.date ? { expiry: f.date } : {}), ...(category === "Equipment" && f.date ? { nextMaintenance: f.date } : {}) }, `Added ${f.name.trim()} to inventory`)}>
      {(f, set) => (<>
        <TextField label="Name" required value={f.name} onChange={(v) => set("name", v)} />
        <div className="grid grid-cols-3 gap-3"><TextField label="Stock" type="number" min={0} required value={f.stock} onChange={(v) => set("stock", v)} /><TextField label="Reorder at" type="number" min={0} value={f.reorder} onChange={(v) => set("reorder", v)} /><TextField label="Unit" value={f.unit} onChange={(v) => set("unit", v)} /></div>
        <div className="grid grid-cols-2 gap-3"><TextField label="Unit price ($)" type="number" step="0.01" min={0} value={f.price} onChange={(v) => set("price", v)} /><TextField label="Location" value={f.location} onChange={(v) => set("location", v)} /></div>
        {category !== "Supply" && <TextField label={category === "Medicine" ? "Expiry date" : "Next maintenance"} type="date" value={f.date} onChange={(v) => set("date", v)} />}
      </>)}
    </FormDialog>
  )
}

export function StockTable({ category }: { category: Item["category"] }) {
  const { items, restock, patch, user } = useStore()
  const rows = items.filter((i) => i.category === category)
  const manage = can(user!.role, "manageStock")
  const dateCol = category === "Medicine" ? "Expiry" : category === "Equipment" ? "Next maintenance" : null
  return (
    <Card>
      <Table>
        <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Stock</TableHead><TableHead>Reorder at</TableHead><TableHead>Location</TableHead><TableHead className="text-right">Unit price</TableHead>{dateCol && <TableHead>{dateCol}</TableHead>}<TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
        <TableBody>
          {rows.length === 0 && <EmptyRow cols={7} />}
          {rows.map((i) => {
            const low = category !== "Equipment" && i.stock <= i.reorder
            const date = category === "Medicine" ? i.expiry : i.nextMaintenance
            const soon = date && date <= addDays(category === "Medicine" ? 60 : 14)
            return (
              <TableRow key={i.id}>
                <TableCell className="font-medium">{i.name}</TableCell>
                <TableCell><span className={low ? "font-semibold text-destructive" : ""}>{i.stock.toLocaleString()} {i.unit}</span>{low && <Badge variant="danger" className="ml-2">Low</Badge>}</TableCell>
                <TableCell>{i.reorder}</TableCell><TableCell>{i.location}</TableCell><TableCell className="text-right">{money(i.price)}</TableCell>
                {dateCol && <TableCell className="whitespace-nowrap">{date ?? "—"}{soon && <Badge variant={date! < today() ? "danger" : "warning"} className="ml-2">{date! < today() ? "Overdue" : "Soon"}</Badge>}</TableCell>}
                <TableCell className="whitespace-nowrap text-right">
                  {manage && category !== "Equipment" && (
                    <FormDialog title={`Restock ${i.name}`} trigger={<Button size="sm" variant="outline"><PackagePlus /> Restock</Button>} initial={{ qty: "" }} valid={(f) => Number(f.qty) > 0} onSubmit={(f) => restock(i.id, Number(f.qty))}>
                      {(f, set) => <TextField label={`Quantity received (${i.unit})`} type="number" min={1} required value={f.qty} onChange={(v) => set("qty", v)} />}
                    </FormDialog>
                  )}
                  {manage && category === "Equipment" && <Button size="sm" variant="outline" onClick={() => patch("items", i.id, { nextMaintenance: addDays(180) }, `Maintenance completed on ${i.name}`)}>Mark serviced</Button>}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </Card>
  )
}
