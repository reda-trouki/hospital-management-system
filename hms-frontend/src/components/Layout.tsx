import { useEffect, useState } from "react"
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom"
import { Activity, AlertTriangle, BedDouble, Bell, CalendarClock, FlaskConical, HeartPulse, LayoutDashboard, LogOut, Moon, Package, Pill, Receipt, RotateCcw, ScrollText, Scissors, Search, Settings, Stethoscope, Sun, UserCircle, Users, UsersRound, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { initials } from "@/components/PageHeader"
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
      <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
      <input aria-label="Global search" className="h-9 w-full rounded-md border bg-background pl-9 pr-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" placeholder="Search patients, doctors…" value={q} onChange={(e) => setQ(e.target.value)} onBlur={() => setTimeout(() => setQ(""), 150)} />
      {hits.length > 0 && (
        <div className="absolute left-0 right-0 top-11 z-40 rounded-lg border bg-popover p-1 shadow-lg">
          {hits.map((h) => (
            <button key={h.key} className="flex w-full flex-col rounded-md px-3 py-2 text-left text-sm hover:bg-accent" onMouseDown={() => { nav(h.to); setQ("") }}>
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
        {list.length > 0 && <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-semibold text-white">{Math.min(list.length, 9)}{list.length > 9 && "+"}</span>}
      </Button>
      {open && (<>
        <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
        <div className="absolute right-0 top-11 z-40 w-80 max-w-[85vw] rounded-lg border bg-popover shadow-lg">
          <div className="border-b px-4 py-3 text-sm font-semibold">Notifications</div>
          <div className="max-h-96 overflow-auto p-1">
            {list.length === 0 && <p className="p-4 text-sm text-muted-foreground">You're all caught up.</p>}
            {list.map((n) => (
              <Link key={n.id} to={n.to} onClick={() => setOpen(false)} className="flex items-start gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent">
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
  const { user, logout, reset, settings } = useStore()
  const [dark, setDark] = useDark()
  const role = user!.role
  const items = nav.filter((n) => access[n.feature].includes(role))
  const sections = [...new Set(items.map((i) => i.section))]
  const link = ({ isActive }: { isActive: boolean }) => cn("flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors", isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground")

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col overflow-y-auto border-r bg-card p-4 md:flex print:hidden">
        <div className="mb-6 flex items-center gap-2 px-2">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground"><Activity className="size-5" /></div>
          <div className="min-w-0 leading-tight"><div className="truncate font-semibold">{settings.hospitalName}</div><div className="text-xs text-muted-foreground">Management System</div></div>
        </div>
        <nav className="flex flex-1 flex-col gap-4">
          {sections.map((sec) => (
            <div key={sec} className="flex flex-col gap-1">
              <div className="px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">{sec}</div>
              {items.filter((i) => i.section === sec).map(({ to, label, icon: Icon }) => (
                <NavLink key={to} to={to} end={to === "/"} className={link}><Icon className="size-4" />{label}</NavLink>
              ))}
            </div>
          ))}
        </nav>
        {role === "Admin" && (
          <Button variant="ghost" size="sm" className="mt-4 justify-start text-muted-foreground" onClick={() => confirm("Reset all data to the demo set?") && reset()}><RotateCcw /> Reset demo data</Button>
        )}
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b bg-card/90 px-4 py-2.5 backdrop-blur md:px-8 print:hidden">
          <div className="flex flex-1 items-center">{role !== "Patient" ? <GlobalSearch /> : <span className="flex items-center gap-2 font-semibold"><HeartPulse className="size-5 text-primary" />{settings.hospitalName}</span>}</div>
          <Button variant="ghost" size="icon" aria-label="Toggle dark mode" onClick={() => setDark(!dark)}>{dark ? <Sun /> : <Moon />}</Button>
          <Notifications />
          <div className="ml-1 hidden items-center gap-2 sm:flex">
            <Avatar className="size-8"><AvatarFallback>{initials(user!.name)}</AvatarFallback></Avatar>
            <div className="leading-tight"><div className="text-sm font-medium">{user!.name}</div><Badge variant="outline" className="mt-0.5 px-1.5 py-0 text-[10px]">{role}</Badge></div>
          </div>
          <Button variant="outline" size="sm" onClick={logout}><LogOut /> <span className="hidden sm:inline">Sign out</span></Button>
        </header>
        <div className="flex gap-1 overflow-x-auto border-b bg-card p-2 md:hidden print:hidden">
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === "/"} className={({ isActive }) => cn("flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-1.5 text-sm", isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground")}><Icon className="size-4" />{label}</NavLink>
          ))}
        </div>
        <main className="mx-auto w-full max-w-7xl flex-1 p-4 md:p-8"><Outlet /></main>
      </div>
    </div>
  )
}


