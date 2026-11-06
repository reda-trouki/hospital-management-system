import { useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PageHeader } from "@/components/PageHeader"
import { FormDialog, SelectField, TextField } from "@/components/common"
import { useStore } from "@/lib/store"
import { ROLES } from "@/lib/auth"
import type { Role } from "@/lib/types"

export default function SettingsPage() {
  const { settings, updateSettings, users, add, remove, user, patients } = useStore()
  const [name, setName] = useState(settings.hospitalName)
  const [tax, setTax] = useState(String(settings.taxRate))
  return (
    <>
      <PageHeader title="Settings" description="Hospital profile and user accounts." />
      <div className="grid gap-4">
        <Card>
          <CardHeader><CardTitle>Hospital profile</CardTitle><CardDescription>Shown in the sidebar, login page and invoices.</CardDescription></CardHeader>
          <CardContent>
            <form className="grid max-w-md gap-4" onSubmit={(e) => { e.preventDefault(); updateSettings({ hospitalName: name.trim() || settings.hospitalName, taxRate: Math.max(0, Number(tax) || 0) }) }}>
              <div className="grid gap-2"><Label htmlFor="hn">Hospital name</Label><Input id="hn" value={name} onChange={(e) => setName(e.target.value)} /></div>
              <div className="grid gap-2"><Label htmlFor="tx">Default tax rate (%)</Label><Input id="tx" type="number" min={0} step="0.1" value={tax} onChange={(e) => setTax(e.target.value)} /></div>
              <Button type="submit" className="justify-self-start">Save changes</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-start justify-between gap-3">
            <div className="grid gap-1.5"><CardTitle>User accounts</CardTitle><CardDescription>Role decides which modules a user can open.</CardDescription></div>
            <FormDialog title="Add user" trigger={<Button><Plus /> Add user</Button>} initial={{ name: "", email: "", password: "", role: "Nurse", linkedId: "none" }}
              valid={(f) => !!f.name.trim() && /\S+@\S+/.test(f.email) && f.password.length >= 6 && !users.some((u) => u.email.toLowerCase() === f.email.trim().toLowerCase()) && (f.role !== "Patient" || f.linkedId !== "none")}
              onSubmit={(f) => add("users", { name: f.name.trim(), email: f.email.trim(), password: f.password, role: f.role as Role, ...(f.role === "Patient" ? { linkedId: f.linkedId } : {}) } as never, `Created ${f.role} account for ${f.name.trim()}`)}>
              {(f, set) => (<>
                <TextField label="Name" required value={f.name} onChange={(v) => set("name", v)} />
                <TextField label="Email" type="email" required value={f.email} onChange={(v) => set("email", v)} />
                <TextField label="Password (min 6 characters)" type="password" required value={f.password} onChange={(v) => set("password", v)} />
                <SelectField label="Role" value={f.role} onChange={(v) => set("role", v)} options={ROLES} />
                {f.role === "Patient" && <SelectField label="Linked patient record" value={f.linkedId} onChange={(v) => set("linkedId", v)} options={patients.map((p) => ({ value: p.id, label: `${p.name} (${p.id})` }))} />}
                {users.some((u) => u.email.toLowerCase() === f.email.trim().toLowerCase()) && <p className="text-sm text-destructive">That email is already in use.</p>}
              </>)}
            </FormDialog>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead /></TableRow></TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.name}{u.id === user!.id && <span className="ml-2 text-xs text-muted-foreground">(you)</span>}</TableCell>
                    <TableCell>{u.email}</TableCell><TableCell><Badge variant="outline">{u.role}</Badge></TableCell>
                    <TableCell className="text-right">{u.id !== user!.id && <Button size="icon" variant="ghost" aria-label={`Delete ${u.name}`} onClick={() => confirm(`Delete account for ${u.name}?`) && remove("users", u.id, `Deleted account of ${u.name}`)}><Trash2 className="text-destructive" /></Button>}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

      </div>
    </>
  )
}
