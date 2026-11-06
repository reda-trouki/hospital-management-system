import { useEffect, useState } from "react"
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom"
import { AlertTriangle, BedDouble, Bell, CalendarClock, FlaskConical, LayoutDashboard, LogOut, Moon, Package, Pill, Receipt, ScrollText, Scissors, Search, Settings, Stethoscope, Sun, UserCircle, Users, UsersRound, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { initials } from "@/components/PageHeader"
import { Logo, LogoMark } from "@/components/Logo"
import { useStore } from "@/lib/store"
import { access, type Feature } from "@/lib/auth"
import { buildNotices } from "@/lib/notifications"

type NavItem = { to: string; label: string; icon: React.ComponentType<{ className?: string }>; feature: Feature; section: string }
const nav: NavItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, feature: "dashboard", section: "Overview" },
  { to: "/portal", label: "My Health", icon: UserCircle, feature: "portal", section: "Overview" },
  { to: "/patients", label: "Patients", icon: Users, feature: "patients", section: "Clinical" },
  { to: "/appointments", label: "Appointments", icon: CalendarClock, feature: "appointments", section: "Clinical" },
  { to: "/emergency", label: "Emergency", icon: AlertTriangle, feature: "emergency", section: "Clinical" },
  { to: "/surgeries", label: "Surgeries", icon: Scissors, feature: "surgeries", section: "Clinical" },
  { to: "/wards", label: "Wards & Beds", icon: BedDouble, feature: "wards", section: "Clinical" },
  { to: "/lab", label: "Laboratory", icon: FlaskConical, feature: "lab", section: "Services" },
  { to: "/pharmacy", label: "Pharmacy", icon: Pill, feature: "pharmacy", section: "Services" },
  { to: "/inventory", label: "Inventory", icon: Package, feature: "inventory", section: "Services" },
  { to: "/billing", label: "Billing", icon: Receipt, feature: "billing", section: "Services" },
  { to: "/doctors", label: "Doctors", icon: Stethoscope, feature: "doctors", section: "People" },
  { to: "/staff", label: "Staff & Shifts", icon: UsersRound, feature: "staff", section: "People" },
  { to: "/reports", label: "Reports", icon: BarChart3, feature: "reports", section: "Admin" },
  { to: "/audit", label: "Audit log", icon: ScrollText, feature: "audit", section: "Admin" },
  { to: "/settings", label: "Settings", icon: Settings, feature: "settings", section: "Admin" },
]

function useDark() {
  const [dark, setDark] = useState(() => { try { return localStorage.getItem("medicore-dark") === "1" } catch { return false } })
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark)
    try { localStorage.setItem("medicore-dark", dark ? "1" : "0") } catch { /* ignore */ }
  }, [dark])
  return [dark, setDark] as const
}

function GlobalSearch() {
  const { patients, doctors } = useStore()
  const nav = useNavigate()
  const [q, setQ] = useState("")
  const term = q.trim().toLowerCase()
  const hits = term ? [
    ...patients.filter((p) => `${p.name} ${p.id} ${p.phone}`.toLowerCase().includes(term)).slice(0, 5).map((p) => ({ key: p.id, label: p.name, sub: `${p.id} · ${p.condition}`, to: `/patients/${p.id}` })),
    ...doctors.filter((d) => `${d.name} ${d.specialty}`.toLowerCase().includes(term)).slice(0, 3).map((d) => ({ key: d.id, label: d.name, sub: d.specialty, to: "/doctors" })),
  ] : []
  return (
    <div className="relative w-full max-w-sm">
      <Search className="absolute left-3.5 top-3 size-4 text-muted-foreground" />
      <input aria-label="Global search" className="h-10 w-full rounded-lg border border-input bg-card pl-10 pr-3 text-sm shadow-xs placeholder:text-muted-foreground/80 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/25" placeholder="Search patients, doctors…" value={q} onChange={(e) => setQ(e.target.value)} onBlur={() => setTimeout(() => setQ(""), 150)} />
      {hits.length > 0 && (
        <div className="absolute left-0 right-0 top-12 z-40 rounded-xl border bg-popover p-1.5 shadow-xl">
          {hits.map((h) => (
            <button key={h.key} className="flex w-full flex-col rounded-lg px-3 py-2 text-left text-sm hover:bg-accent" onMouseDown={() => { nav(h.to); setQ("") }}>
              <span className="font-medium">{h.label}</span><span className="text-xs text-muted-foreground">{h.sub}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function Notifications() {
  const db = useStore()
  const [open, setOpen] = useState(false)
  const role = db.user!.role
  const list = buildNotices(db).filter((n) => access[n.feature].includes(role))
  return (
    <div className="relative">
      <Button variant="ghost" size="icon" aria-label="Notifications" onClick={() => setOpen((o) => !o)} className="relative">
        <Bell />
        {list.length > 0 && <span className="absolute right-0.5 top-0.5 flex size-4 items-center justify-center rounded-full bg-pulse text-[10px] font-semibold text-white ring-2 ring-card">{Math.min(list.length, 9)}{list.length > 9 && "+"}</span>}
      </Button>
      {open && (<>
        <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
        <div className="absolute right-0 top-12 z-40 w-80 max-w-[85vw] rounded-xl border bg-popover shadow-xl">
          <div className="border-b px-4 py-3 font-display text-[15px] font-semibold">Notifications</div>
          <div className="max-h-96 overflow-auto p-1">
            {list.length === 0 && <p className="p-4 text-sm text-muted-foreground">You're all caught up.</p>}
            {list.map((n) => (
              <Link key={n.id} to={n.to} onClick={() => setOpen(false)} className="flex items-start gap-2.5 rounded-lg px-3 py-2.5 text-sm hover:bg-accent">
                <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", n.level === "danger" ? "bg-destructive" : n.level === "warning" ? "bg-amber-500" : "bg-sky-500")} />{n.text}
              </Link>
            ))}
          </div>
        </div>
      </>)}
    </div>
  )
}

export default function Layout() {
  const { user, logout, settings } = useStore()
  const [dark, setDark] = useDark()
  const role = user!.role
  const items = nav.filter((n) => access[n.feature].includes(role))
  const sections = [...new Set(items.map((i) => i.section))]
  const link = ({ isActive }: { isActive: boolean }) => cn(
    "group relative flex items-center gap-3 rounded-lg px-3 py-1.5 text-[13.5px] font-medium transition-colors",
    isActive
      ? "bg-white/10 text-white before:absolute before:inset-y-2 before:-left-3 before:w-[3px] before:rounded-r-full before:bg-pulse"
      : "text-ink-muted hover:bg-white/5 hover:text-ink-foreground",
  )

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-ink text-ink-foreground md:flex print:hidden">
        <div className="px-5 pb-2 pt-5"><Logo name={settings.hospitalName} onDark /></div>
        <nav aria-label="Main" className="flex flex-1 flex-col gap-4 overflow-y-auto px-3 pb-3 pt-3">
          {sections.map((sec) => (
            <div key={sec} className="flex flex-col gap-0.5">
              <div className="px-3 pb-1 text-xs font-medium text-ink-muted/70">{sec}</div>
              {items.filter((i) => i.section === sec).map(({ to, label, icon: Icon }) => (
                <NavLink key={to} to={to} end={to === "/"} className={link}>
                  {({ isActive }) => (<><Icon className={cn("size-[18px]", isActive ? "text-mint" : "text-ink-muted group-hover:text-ink-foreground")} />{label}</>)}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className="m-3 flex items-center gap-3 rounded-xl bg-white/[0.06] p-3 ring-1 ring-inset ring-white/5">
          <Avatar className="size-9"><AvatarFallback className="bg-mint/15 text-mint">{initials(user!.name)}</AvatarFallback></Avatar>
          <div className="min-w-0 flex-1 leading-tight"><div className="truncate text-sm font-medium text-white">{user!.name}</div><div className="truncate text-xs text-ink-muted">{role}</div></div>
          <button type="button" onClick={logout} aria-label="Sign out" title="Sign out" className="flex size-8 shrink-0 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint"><LogOut className="size-4" /></button>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b bg-background/85 px-4 py-3 backdrop-blur-md md:px-8 print:hidden">
          <LogoMark size={32} className="md:hidden" />
          <div className="flex flex-1 items-center">{role !== "Patient" ? <GlobalSearch /> : <span className="font-display text-base font-semibold tracking-tight md:hidden">{settings.hospitalName}</span>}</div>
          <Button variant="ghost" size="icon" aria-label="Toggle dark mode" onClick={() => setDark(!dark)}>{dark ? <Sun /> : <Moon />}</Button>
          <Notifications />
          <Button variant="outline" size="icon" aria-label="Sign out" title="Sign out" className="md:hidden" onClick={logout}><LogOut /></Button>
        </header>
        <nav aria-label="Sections" className="flex gap-1 overflow-x-auto border-b bg-card p-2 md:hidden print:hidden">
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === "/"} className={({ isActive }) => cn("flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium", isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground")}><Icon className="size-4" />{label}</NavLink>
          ))}
        </nav>
        <main className="mx-auto w-full max-w-7xl flex-1 p-4 md:p-8"><Outlet /></main>
      </div>
    </div>
  )
}
