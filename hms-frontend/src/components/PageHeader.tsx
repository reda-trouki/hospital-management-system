import type { ReactNode } from "react"

export function PageHeader({ title, description, children }: { title: string; description?: string; children?: ReactNode }) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="font-display text-[1.75rem] font-semibold leading-tight tracking-tight sm:text-[2rem]">{title}</h1>
        {description && <p className="mt-1.5 max-w-prose text-[15px] text-muted-foreground">{description}</p>}
      </div>
      <div className="flex flex-wrap items-center gap-2 print:hidden">{children}</div>
    </div>
  )
}

export const initials = (name: string) => name.replace(/^Dr\.\s*/, "").split(" ").map((w) => w[0]).slice(0, 2).join("")
