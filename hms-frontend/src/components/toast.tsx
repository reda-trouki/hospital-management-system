import { createContext, useCallback, useContext, useState, type ReactNode } from "react"
import { CheckCircle2, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

type T = { id: number; msg: string; error?: boolean }
const Ctx = createContext<(msg: string, error?: boolean) => void>(() => {})

export function ToastProvider({ children }: { children: ReactNode }) {
  const [list, setList] = useState<T[]>([])
  const toast = useCallback((msg: string, error?: boolean) => {
    const id = Date.now() + Math.random()
    setList((l) => [...l.slice(-3), { id, msg, error }])
    setTimeout(() => setList((l) => l.filter((t) => t.id !== id)), 3200)
  }, [])
  return (
    <Ctx.Provider value={toast}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2 print:hidden">
        {list.map((t) => (
          <div key={t.id} role="status" className={cn("pointer-events-auto flex items-start gap-2 rounded-lg border bg-card p-3 text-sm shadow-lg", t.error && "border-destructive/50")}>
            {t.error ? <XCircle className="mt-0.5 size-4 shrink-0 text-destructive" /> : <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />}
            <span>{t.msg}</span>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  )
}
export const useToast = () => useContext(Ctx)
