import { useState } from "react"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PageHeader } from "@/components/PageHeader"
import { EmptyRow, Pagination, SearchInput, usePagination } from "@/components/common"
import { useStore } from "@/lib/store"
import { downloadCSV, fmtDateTime } from "@/lib/utils"

export default function Audit() {
  const { audit } = useStore()
  const [q, setQ] = useState("")
  const rows = audit.filter((a) => `${a.user} ${a.role} ${a.action}`.toLowerCase().includes(q.toLowerCase()))
  const pg = usePagination(rows, 12)
  return (
    <>
      <PageHeader title="Audit log" description="Every change made in the system, with who did it and when.">
        <Button variant="outline" onClick={() => downloadCSV("audit-log.csv", rows.map((a) => ({ time: a.time, user: a.user, role: a.role, action: a.action })))}><Download /> Export CSV</Button>
      </PageHeader>
      <div className="mb-4"><SearchInput value={q} onChange={(v) => { setQ(v); pg.setPage(0) }} placeholder="Search user or action…" /></div>
      <Card>
        <Table>
          <TableHeader><TableRow><TableHead>Time</TableHead><TableHead>User</TableHead><TableHead>Role</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
          <TableBody>
            {pg.rows.length === 0 && <EmptyRow cols={4} text="No activity recorded yet. Actions you take will appear here." />}
            {pg.rows.map((a) => <TableRow key={a.id}><TableCell className="whitespace-nowrap">{fmtDateTime(a.time)}</TableCell><TableCell className="font-medium">{a.user}</TableCell><TableCell><Badge variant="outline">{a.role}</Badge></TableCell><TableCell>{a.action}</TableCell></TableRow>)}
          </TableBody>
        </Table>
        <Pagination {...pg} />
      </Card>
    </>
  )
}
