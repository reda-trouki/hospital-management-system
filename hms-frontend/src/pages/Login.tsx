import { useState } from "react"
import { Navigate } from "react-router-dom"
import { ConciergeBell, FlaskConical, HeartPulse, LogIn, Pill, ShieldCheck, Stethoscope, UserRound, type LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Logo } from "@/components/Logo"
import { useStore } from "@/lib/store"
import { homeFor } from "@/lib/auth"

const DEMO: { role: string; email: string; password: string; icon: LucideIcon; note: string }[] = [
  { role: "Admin", email: "admin@medicore.com", password: "admin123", icon: ShieldCheck, note: "Everything" },
  { role: "Doctor", email: "doctor@medicore.com", password: "doctor123", icon: Stethoscope, note: "Patients, orders" },
  { role: "Nurse", email: "nurse@medicore.com", password: "nurse123", icon: HeartPulse, note: "Wards, vitals" },
  { role: "Receptionist", email: "reception@medicore.com", password: "reception123", icon: ConciergeBell, note: "Front desk, billing" },
  { role: "Pharmacist", email: "pharmacy@medicore.com", password: "pharmacy123", icon: Pill, note: "Dispensing, stock" },
  { role: "Lab Tech", email: "lab@medicore.com", password: "lab123", icon: FlaskConical, note: "Lab results" },
  { role: "Patient", email: "patient@medicore.com", password: "patient123", icon: UserRound, note: "Portal" },
]

function Heartbeat() {
  return (
    <svg viewBox="0 0 640 220" fill="none" aria-hidden className="w-full">
      <g stroke="#8fb0ab" strokeOpacity="0.14">
        {[40, 80, 120, 160, 200].map((y) => <line key={y} x1="0" x2="640" y1={y} y2={y} />)}
        {Array.from({ length: 15 }, (_, i) => 40 + i * 40).map((x) => <line key={x} y1="0" y2="220" x1={x} x2={x} />)}
      </g>
      <path className="pulse-draw" d="M0 120 H150 l14 -10 l14 10 H238 l12 18 l24 -108 l24 150 l16 -60 H380 l18 -22 q24 -20 48 0 l10 22 H610" stroke="#5ed3ae" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <circle className="pulse-dot" cx="618" cy="120" r="8" fill="#ff5d73" stroke="#0b2526" strokeWidth="3" />
    </svg>
  )
}

export default function Login() {
  const { user, login, settings } = useStore()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  if (user) return <Navigate to={homeFor(user.role)} replace />

  return (
    <div className="grid min-h-screen lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-ink p-12 text-ink-foreground lg:flex">
        <Logo name={settings.hospitalName} onDark size={40} />
        <div>
          <h2 className="max-w-lg font-display text-[2.75rem] font-semibold leading-[1.05] tracking-tight text-white">Patients, beds, labs and billing in one place.</h2>
          <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-ink-muted">Sign in to see the tools your role needs, and nothing else.</p>
        </div>
        <div className="-mx-4"><Heartbeat /></div>
      </aside>

      <main className="flex items-center justify-center bg-background p-5 sm:p-10">
        <div className="w-full max-w-md">
          <Logo name={settings.hospitalName} className="mb-8 lg:hidden" />
          <h1 className="font-display text-3xl font-semibold tracking-tight">Welcome back</h1>
          <p className="mt-1.5 text-[15px] text-muted-foreground">Sign in with your hospital account.</p>

          <form className="mt-7 grid gap-4" onSubmit={async (e) => { e.preventDefault(); setBusy(true); setError((await login(email, password)) ?? ""); setBusy(false) }}>
            <div className="grid gap-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            <div className="grid gap-2"><Label htmlFor="password">Password</Label><Input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} /></div>
            {error && <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
            <Button type="submit" size="lg" disabled={busy}><LogIn /> {busy ? "Signing in…" : "Sign in"}</Button>
          </form>

          <div className="mt-9">
            <h2 className="text-sm font-semibold">Try a demo account</h2>
            <p className="mt-0.5 text-[13px] text-muted-foreground">Pick a role to fill in the form.</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {DEMO.map(({ role, email: e, password: p, icon: Icon, note }) => (
                <button key={e} type="button" onClick={() => { setEmail(e); setPassword(p); setError("") }}
                  className="flex items-center gap-3 rounded-xl border bg-card p-3 text-left transition-colors hover:border-primary/40 hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <span className="hidden size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground min-[420px]:flex"><Icon className="size-[18px]" /></span>
                  <span className="min-w-0 leading-tight"><span className="block text-sm font-medium">{role}</span><span className="block truncate text-xs text-muted-foreground">{note}</span></span>
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">These accounts exist only when the backend runs with demo data (SEED_DEMO_DATA=true). Remove them before real use.</p>
          </div>
        </div>
      </main>
    </div>
  )
}
