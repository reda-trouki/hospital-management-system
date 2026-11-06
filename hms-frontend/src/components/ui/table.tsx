import * as React from "react"
import { cn } from "@/lib/utils"

const Table = ({ className, ...p }: React.ComponentProps<"table">) => (
  <div className="relative w-full overflow-auto"><table className={cn("w-full caption-bottom text-sm tabular-nums", className)} {...p} /></div>
)
const TableHeader = ({ className, ...p }: React.ComponentProps<"thead">) => <thead className={cn("bg-muted/40 [&_tr]:border-b", className)} {...p} />
const TableBody = ({ className, ...p }: React.ComponentProps<"tbody">) => <tbody className={cn("[&_tr:last-child]:border-0", className)} {...p} />
const TableRow = ({ className, ...p }: React.ComponentProps<"tr">) => <tr className={cn("border-b border-border/70 transition-colors hover:bg-muted/40", className)} {...p} />
const TableHead = ({ className, ...p }: React.ComponentProps<"th">) => <th className={cn("h-11 px-4 text-left align-middle text-[13px] font-medium text-muted-foreground", className)} {...p} />
const TableCell = ({ className, ...p }: React.ComponentProps<"td">) => <td className={cn("px-4 py-3.5 align-middle", className)} {...p} />
export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell }
