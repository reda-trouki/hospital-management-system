import { StrictMode, type ReactNode } from "react"
import { createRoot } from "react-dom/client"
import { HashRouter, Navigate, Route, Routes } from "react-router-dom"
import "./index.css"
import { ToastProvider } from "@/components/toast"
import { StoreProvider, useStore } from "@/lib/store"
import { access, homeFor, type Feature } from "@/lib/auth"
import Layout from "@/components/Layout"
import Login from "@/pages/Login"
import Dashboard from "@/pages/Dashboard"
import Patients from "@/pages/Patients"
import PatientDetail from "@/pages/PatientDetail"
import Appointments from "@/pages/Appointments"
import Doctors from "@/pages/Doctors"
import Staff from "@/pages/Staff"
import Wards from "@/pages/Wards"
import Emergency from "@/pages/Emergency"
import Surgeries from "@/pages/Surgeries"
import Lab from "@/pages/Lab"
import Pharmacy from "@/pages/Pharmacy"
import Inventory from "@/pages/Inventory"
import Billing from "@/pages/Billing"
import Reports from "@/pages/Reports"
import Audit from "@/pages/Audit"
import SettingsPage from "@/pages/Settings"
import Portal from "@/pages/Portal"

try { if (localStorage.getItem("medicore-dark") === "1") document.documentElement.classList.add("dark") } catch { /* ignore */ }

function RequireAuth({ children }: { children: ReactNode }) {
  const { user } = useStore()
  return user ? <>{children}</> : <Navigate to="/login" replace />
}
function F({ f, children }: { f: Feature; children: ReactNode }) {
  const { user } = useStore()
  if (!user) return <Navigate to="/login" replace />
  return access[f].includes(user.role) ? <>{children}</> : <Navigate to={homeFor(user.role)} replace />
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ToastProvider>
      <StoreProvider>
        <HashRouter>
          <Routes>
            <Route path="login" element={<Login />} />
            <Route element={<RequireAuth><Layout /></RequireAuth>}>
              <Route index element={<F f="dashboard"><Dashboard /></F>} />
              <Route path="patients" element={<F f="patients"><Patients /></F>} />
              <Route path="patients/:id" element={<F f="patients"><PatientDetail /></F>} />
              <Route path="appointments" element={<F f="appointments"><Appointments /></F>} />
              <Route path="doctors" element={<F f="doctors"><Doctors /></F>} />
              <Route path="staff" element={<F f="staff"><Staff /></F>} />
              <Route path="wards" element={<F f="wards"><Wards /></F>} />
              <Route path="emergency" element={<F f="emergency"><Emergency /></F>} />
              <Route path="surgeries" element={<F f="surgeries"><Surgeries /></F>} />
              <Route path="lab" element={<F f="lab"><Lab /></F>} />
              <Route path="pharmacy" element={<F f="pharmacy"><Pharmacy /></F>} />
              <Route path="inventory" element={<F f="inventory"><Inventory /></F>} />
              <Route path="billing" element={<F f="billing"><Billing /></F>} />
              <Route path="reports" element={<F f="reports"><Reports /></F>} />
              <Route path="audit" element={<F f="audit"><Audit /></F>} />
              <Route path="settings" element={<F f="settings"><SettingsPage /></F>} />
              <Route path="portal" element={<F f="portal"><Portal /></F>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </HashRouter>
      </StoreProvider>
    </ToastProvider>
  </StrictMode>
)
