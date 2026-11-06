import { useId } from "react"
import { cn } from "@/lib/utils"

/** MediCore mark: a heartbeat line that ends in a live dot, on a jade tile. */
export function LogoMark({ size = 36, className }: { size?: number; className?: string }) {
  const id = useId()
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" role="img" aria-label="MediCore" className={cn("shrink-0", className)}>
      <defs>
        <linearGradient id={`${id}-g`} x1="4" y1="2" x2="36" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#25a47f" />
          <stop offset="1" stopColor="#116048" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="11" fill={`url(#${id}-g)`} />
      <rect x="0.5" y="0.5" width="39" height="39" rx="10.5" stroke="#fff" strokeOpacity="0.14" />
      <path d="M7 21.5h6.2l3.1-7.8 5 15.5 3.6-9.2h5.4" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="33.6" cy="20" r="2.6" fill="#ff5d73" stroke="#fff" strokeWidth="1.2" />
    </svg>
  )
}

export function Logo({ name = "MediCore", subtitle = "Care management", onDark, size = 36, className }: { name?: string; subtitle?: string; onDark?: boolean; size?: number; className?: string }) {
  return (
    <div className={cn("flex min-w-0 items-center gap-3", className)}>
      <LogoMark size={size} />
      <div className="min-w-0 leading-tight">
        <div className={cn("truncate font-display text-[17px] font-semibold tracking-tight", onDark ? "text-white" : "text-foreground")}>{name}</div>
        {subtitle && <div className={cn("truncate text-xs", onDark ? "text-ink-muted" : "text-muted-foreground")}>{subtitle}</div>}
      </div>
    </div>
  )
}
