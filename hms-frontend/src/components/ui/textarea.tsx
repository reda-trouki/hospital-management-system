import * as React from "react"
import { cn } from "@/lib/utils"

const Textarea = ({ className, ...p }: React.ComponentProps<"textarea">) => (
  <textarea className={cn("flex min-h-20 w-full rounded-md border border-input bg-card px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", className)} {...p} />
)
export { Textarea }
