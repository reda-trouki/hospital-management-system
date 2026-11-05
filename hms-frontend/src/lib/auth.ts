import type { Role } from "./types"

export const ROLES: Role[] = ["Admin", "Doctor", "Nurse", "Receptionist", "Pharmacist", "Lab Tech", "Patient"]

export type Feature = "dashboard" | "patients" | "appointments" | "doctors" | "staff" | "wards" | "emergency" | "surgeries" | "lab" | "pharmacy" | "inventory" | "billing" | "reports" | "audit" | "settings" | "portal"

export const access: Record<Feature, Role[]> = {
  dashboard: ["Admin", "Doctor", "Nurse", "Receptionist", "Pharmacist", "Lab Tech"],
  patients: ["Admin", "Doctor", "Nurse", "Receptionist", "Pharmacist", "Lab Tech"],
  appointments: ["Admin", "Doctor", "Nurse", "Receptionist"],
  doctors: ["Admin", "Doctor", "Nurse", "Receptionist"],
  staff: ["Admin"],
  wards: ["Admin", "Doctor", "Nurse", "Receptionist"],
  emergency: ["Admin", "Doctor", "Nurse", "Receptionist"],
  surgeries: ["Admin", "Doctor", "Nurse"],
  lab: ["Admin", "Doctor", "Nurse", "Lab Tech"],
  pharmacy: ["Admin", "Doctor", "Nurse", "Pharmacist"],
  inventory: ["Admin", "Nurse", "Pharmacist"],
  billing: ["Admin", "Receptionist"],
  reports: ["Admin"],
  audit: ["Admin"],
  settings: ["Admin"],
  portal: ["Patient"],
}

// Fine-grained actions
export const caps = {
  writeClinical: ["Admin", "Doctor"],
  recordVitals: ["Admin", "Doctor", "Nurse"],
  orderLab: ["Admin", "Doctor"],
  enterLabResult: ["Admin", "Lab Tech"],
  dispense: ["Admin", "Pharmacist"],
  manageStock: ["Admin", "Pharmacist", "Nurse"],
  registerPatient: ["Admin", "Receptionist", "Nurse"],
  deletePatient: ["Admin"],
  discharge: ["Admin", "Doctor"],
  scheduleSurgery: ["Admin", "Doctor"],
} satisfies Record<string, Role[]>

export const can = (role: Role | undefined, cap: keyof typeof caps) => !!role && (caps[cap] as Role[]).includes(role)
export const homeFor = (role: Role) => (role === "Patient" ? "/portal" : "/")
