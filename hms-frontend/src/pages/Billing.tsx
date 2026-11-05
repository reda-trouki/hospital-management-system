import { useState } from "react"
import { Download, Eye, Plus, Printer, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageHeader } from "@/components/PageHeader"
import { EmptyRow, Field, FormDialog, Pagination, SearchInput, SelectField, StatusBadge, TextField, usePagination } from "@/components/common"
import { useStore } from "@/lib/store"
import { calc } from "@/lib/billing"
import { addDays, downloadCSV, money, today } from "@/lib/utils"
import type { Invoice, LineItem, Payment } from "@/lib/types"

export function InvoiceView({ invoice, onClose, canPay = true }: { invoice: Invoice | undefined; onClose: () => void; canPay?: boolean }) {
  const { patients, settings, addPayment } = useStore()
  if (!invoice) return null
  const c = calc(invoice)
  const p = patients.find((x) => x.id === invoice.patientId)
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="print-area max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between gap-3 pr-6"><span>Invoice {invoice.id}</span><StatusBadge status={c.status} /></DialogTitle>
          <DialogDescription>{settings.hospitalName} · Issued {invoice.date} · Due {invoice.dueDate}</DialogDescription>
        </DialogHeader>
        <div className="text-sm"><div className="font-medium">{p?.name}</div><div className="text-muted-foreground">{p?.id} · {p?.insurer ? `${p.insurer} (${p.policyNo})` : "Self-pay"}</div></div>
        <Table>
          <TableHeader><TableRow><TableHead>Description</TableHead><TableHead className="text-right">Qty</TableHead><TableHead className="text-right">Price</TableHead><TableHead className="text-right">Amount</TableHead></TableRow></TableHeader>
          <TableBody>{invoice.items.map((i, k) => <TableRow key={k}><TableCell>{i.desc}</TableCell><TableCell className="text-right">{i.qty}</TableCell><TableCell className="text-right">{money(i.price)}</TableCell><TableCell className="text-right">{money(i.qty * i.price)}</TableCell></TableRow>)}</TableBody>
        </Table>
        <dl className="ml-auto grid w-full max-w-xs grid-cols-2 gap-y-1 text-sm">
          <dt className="text-muted-foreground">Subtotal</dt><dd className="text-right">{money(c.subtotal)}</dd>
          {invoice.discount > 0 && <><dt className="text-muted-foreground">Discount ({invoice.discount}%)</dt><dd className="text-right">−{money(c.discount)}</dd></>}
          {invoice.tax > 0 && <><dt className="text-muted-foreground">Tax ({invoice.tax}%)</dt><dd className="text-right">{money(c.tax)}</dd></>}
          <dt className="font-medium">Total</dt><dd className="text-right font-medium">{money(c.total)}</dd>
          {invoice.insurance > 0 && <><dt className="text-muted-foreground">Insurance ({invoice.insurance}%)</dt><dd className="text-right">−{money(c.insurance)}</dd></>}
          <dt className="text-muted-foreground">Patient share</dt><dd className="text-right">{money(c.patientDue)}</dd>
          <dt className="text-muted-foreground">Paid</dt><dd className="text-right">−{money(c.paid)}</dd>
          <dt className="border-t pt-1 font-semibold">Balance due</dt><dd className="border-t pt-1 text-right font-semibold">{money(c.balance)}</dd>
        </dl>
        {invoice.payments.length > 0 && <div className="text-xs text-muted-foreground">Payments: {invoice.payments.map((x) => `${x.date} ${money(x.amount)} (${x.method})`).join(" · ")}</div>}
        <div className="flex flex-wrap justify-end gap-2 print:hidden">
          <Button variant="outline" onClick={() => window.print()}><Printer /> Print receipt</Button>
          {canPay && c.balance > 0 && (
            <FormDialog title="Record payment" description={`Balance due: ${money(c.balance)}`} trigger={<Button>Record payment</Button>} initial={{ amount: String(c.balance), method: "Card" }} valid={(f) => Number(f.amount) > 0 && Number(f.amount) <= c.balance + 0.005}
              onSubmit={(f) => addPayment(invoice.id, { date: today(), amount: Number(f.amount), method: f.method as Payment["method"] })}>
              {(f, set) => (<><TextField label="Amount ($)" type="number" step="0.01" min={0.01} max={c.balance} value={f.amount} onChange={(v) => set("amount", v)} /><SelectField label="Method" value={f.method} onChange={(v) => set("method", v)} options={["Card", "Cash", "Transfer"]} /></>)}
            </FormDialog>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function NewInvoice() {
  const { patients, settings, add } = useStore()
  return (
    <FormDialog title="Create invoice" description="Itemize services; insurance coverage is prefilled from the patient." className="max-w-2xl" trigger={<Button><Plus /> New invoice</Button>}
      initial={{ patientId: "", items: [{ desc: "", qty: 1, price: 0 }] as LineItem[], discount: "0", tax: String(settings.taxRate), insurance: "0", dueDays: "14" }}
      valid={(f) => !!f.patientId && f.items.length > 0 && f.items.every((i) => i.desc.trim() && i.qty > 0 && i.price >= 0)}
      onSubmit={(f) => add("invoices", { patientId: f.patientId, items: f.items, discount: Number(f.discount) || 0, tax: Number(f.tax) || 0, insurance: Number(f.insurance) || 0, payments: [], date: today(), dueDate: addDays(Number(f.dueDays) || 14) }, `Created invoice for ${patients.find((p) => p.id === f.patientId)?.name}`)}>
      {(f, set) => {
        const setItem = (i: number, patch: Partial<LineItem>) => set("items", f.items.map((x, k) => (k === i ? { ...x, ...patch } : x)))
        const total = f.items.reduce((s, i) => s + i.qty * i.price, 0)
        return (<>
          <SelectField label="Patient" value={f.patientId} placeholder="Select patient" options={patients.map((p) => ({ value: p.id, label: p.name }))}
            onChange={(v) => { set("patientId", v); set("insurance", String(patients.find((p) => p.id === v)?.coverage ?? 0)) }} />
          <Field label="Line items">
            <div className="grid gap-2">
              {f.items.map((it, i) => (
                <div key={i} className="grid grid-cols-[1fr_4rem_6rem_2.25rem] gap-2">
                  <Input aria-label="Description" placeholder="Service / item" value={it.desc} onChange={(e) => setItem(i, { desc: e.target.value })} />
                  <Input aria-label="Quantity" type="number" min={1} value={it.qty} onChange={(e) => setItem(i, { qty: Number(e.target.value) })} />
                  <Input aria-label="Price" type="number" min={0} step="0.01" value={it.price} onChange={(e) => setItem(i, { price: Number(e.target.value) })} />
                  <Button type="button" size="icon" variant="ghost" aria-label="Remove line" disabled={f.items.length === 1} onClick={() => set("items", f.items.filter((_, k) => k !== i))}><Trash2 /></Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" className="justify-self-start" onClick={() => set("items", [...f.items, { desc: "", qty: 1, price: 0 }])}><Plus /> Add line</Button>
            </div>
          </Field>
          <div className="grid grid-cols-4 gap-3">
            <TextField label="Discount %" type="number" min={0} max={100} value={f.discount} onChange={(v) => set("discount", v)} />
            <TextField label="Tax %" type="number" min={0} value={f.tax} onChange={(v) => set("tax", v)} />
            <TextField label="Insurance %" type="number" min={0} max={100} value={f.insurance} onChange={(v) => set("insurance", v)} />
            <TextField label="Due in (days)" type="number" min={0} value={f.dueDays} onChange={(v) => set("dueDays", v)} />
          </div>
          <p className="text-sm text-muted-foreground">Subtotal: <span className="font-medium text-foreground">{money(total)}</span></p>
        </>)
      }}
    </FormDialog>
  )
}

export default function Billing() {
  const { invoices, patients } = useStore()
  const [tab, setTab] = useState("all")
  const [q, setQ] = useState("")
  const [viewId, setViewId] = useState<string | null>(null)
  const pn = (id: string) => patients.find((p) => p.id === id)?.name ?? "Unknown"
  const withCalc = invoices.map((i) => ({ i, c: calc(i) }))
  const sum = (f: (c: ReturnType<typeof calc>) => number, s?: string) => withCalc.filter((x) => !s || x.c.status === s).reduce((t, x) => t + f(x.c), 0)
  const rows = withCalc.filter(({ i, c }) => (tab === "all" || c.status === tab) && `${i.id} ${pn(i.patientId)}`.toLowerCase().includes(q.toLowerCase())).sort((a, b) => b.i.date.localeCompare(a.i.date))
  const pg = usePagination(rows, 8)
  const totals = [["Collected", sum((c) => c.paid), "text-emerald-600"], ["Outstanding", sum((c) => c.balance), "text-amber-600"], ["Overdue", sum((c) => c.balance, "Overdue"), "text-destructive"], ["Insurance claims", sum((c) => c.insurance), "text-sky-600"]] as const

  return (
    <>
      <PageHeader title="Billing" description="Invoices, insurance coverage and payments.">
        <Button variant="outline" onClick={() => downloadCSV("invoices.csv", withCalc.map(({ i, c }) => ({ id: i.id, patient: pn(i.patientId), date: i.date, due: i.dueDate, total: c.total, insurance: c.insurance, paid: c.paid, balance: c.balance, status: c.status })))}><Download /> Export CSV</Button>
        <NewInvoice />
      </PageHeader>
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {totals.map(([label, v, c]) => <Card key={label}><CardContent className="p-6"><p className="text-sm text-muted-foreground">{label}</p><p className={`mt-2 text-2xl font-semibold ${c}`}>{money(v)}</p></CardContent></Card>)}
      </div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Tabs value={tab} onValueChange={(v) => { setTab(v); pg.setPage(0) }}><TabsList>{["all", "Pending", "Partial", "Overdue", "Paid"].map((t) => <TabsTrigger key={t} value={t}>{t === "all" ? "All" : t}</TabsTrigger>)}</TabsList></Tabs>
        <SearchInput value={q} onChange={(v) => { setQ(v); pg.setPage(0) }} placeholder="Search invoice or patient…" />
      </div>
      <Card>
        <Table>
          <TableHeader><TableRow><TableHead>Invoice</TableHead><TableHead>Patient</TableHead><TableHead>Date</TableHead><TableHead>Due</TableHead><TableHead className="text-right">Total</TableHead><TableHead className="text-right">Balance</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {pg.rows.length === 0 && <EmptyRow cols={8} text="No invoices." />}
            {pg.rows.map(({ i, c }) => (
              <TableRow key={i.id}>
                <TableCell className="font-medium">{i.id}</TableCell><TableCell>{pn(i.patientId)}</TableCell><TableCell className="whitespace-nowrap">{i.date}</TableCell><TableCell className="whitespace-nowrap">{i.dueDate}</TableCell>
                <TableCell className="text-right">{money(c.total)}</TableCell><TableCell className="text-right font-medium">{money(c.balance)}</TableCell><TableCell><StatusBadge status={c.status} /></TableCell>
                <TableCell className="text-right"><Button size="sm" variant="outline" onClick={() => setViewId(i.id)}><Eye /> View</Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Pagination {...pg} />
      </Card>
      <InvoiceView invoice={invoices.find((i) => i.id === viewId)} onClose={() => setViewId(null)} />
    </>
  )
}
