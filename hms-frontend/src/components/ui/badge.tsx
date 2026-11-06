import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ring-1 ring-inset", {
  variants: {
    variant: {
      default: "bg-primary/10 text-primary ring-primary/15",
      secondary: "bg-secondary text-secondary-foreground ring-border",
      success: "bg-emerald-50 text-emerald-800 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/20",
      warning: "bg-amber-50 text-amber-800 ring-amber-600/25 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/20",
      danger: "bg-rose-50 text-rose-800 ring-rose-600/20 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-400/20",
      info: "bg-sky-50 text-sky-800 ring-sky-600/20 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-400/20",
      outline: "text-foreground ring-border",
    },
  },
  defaultVariants: { variant: "default" },
})

/** Coloured variants carry a status dot so state is not conveyed by colour alone. */
function Badge({ className, variant, children, ...p }: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  const dot = !!variant && variant !== "outline" && variant !== "default"
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...p}>
      {dot && <span aria-hidden className="size-1.5 rounded-full bg-current opacity-80" />}
      {children}
    </span>
  )
}
export { Badge }
