import * as React from "react"
import { cn } from "@/lib/utils"

const Input = ({ className, type, ...p }: React.ComponentProps<"input">) => (
  <input type={type} className={cn("flex h-10 w-full rounded-lg border border-input bg-card px-3.5 py-1 text-sm shadow-xs transition-[border-color,box-shadow] placeholder:text-muted-foreground/80 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/25 disabled:opacity-50", className)} {...p} />
)
export { Input }
