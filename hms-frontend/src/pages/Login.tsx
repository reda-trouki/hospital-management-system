import { useState } from "react"
import { Navigate } from "react-router-dom"
import { Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useStore } from "@/lib/store"
import { homeFor } from "@/lib/auth"

export default function Login() {
  const { user, login, users, settings } = useStore()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  if (user) return <Navigate to={homeFor(user.role)} replace />

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-accent/60 via-background to-background p-4">
      <div className="grid w-full max-w-4xl gap-6 md:grid-cols-2">
        <Card className="self-start">
          <CardHeader>
            <div className="mb-2 flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground"><Activity className="size-6" /></div>
            <CardTitle className="text-xl">{settings.hospitalName}</CardTitle>
            <CardDescription>Sign in to the hospital management system.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4" onSubmit={(e) => { e.preventDefault(); setError(login(email, password) ? "" : "Invalid email or password.") }}>
              <div className="grid gap-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
              <div className="grid gap-2"><Label htmlFor="password">Password</Label><Input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} /></div>
              {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
              <Button type="submit">Sign in</Button>
            </form>
          </CardContent>
        </Card>
        <Card className="self-start">
          <CardHeader><CardTitle className="text-base">Demo accounts</CardTitle><CardDescription>Each role sees different modules. Click one to fill in the form.</CardDescription></CardHeader>
          <CardContent className="grid gap-2">
            {users.map((u) => (
              <button key={u.id} type="button" onClick={() => { setEmail(u.email); setPassword(u.password); setError("") }} className="flex items-center justify-between rounded-lg border p-3 text-left text-sm transition-colors hover:bg-accent">
                <span><span className="font-medium">{u.role}</span><span className="block text-xs text-muted-foreground">{u.email}</span></span>
                <span className="text-xs text-muted-foreground">{u.password}</span>
              </button>
            ))}
            <p className="pt-1 text-xs text-muted-foreground">Front-end demo only: credentials are stored in this browser, not on a server.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
