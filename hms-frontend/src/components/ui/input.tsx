import * as React from "react"
import { cn } from "@/lib/utils"

const Input = ({ className, type, ...p }: React.ComponentProps<"input">) => (
  <input type={type} className={cn("flex h-9 w-full rounded-md border border-input bg-card px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50", className)} {...p} />
)
export { Input }
