export type Role = "Admin" | "Doctor" | "Nurse" | "Receptionist" | "Pharmacist" | "Lab Tech" | "Patient"
export type User = { id: string; name: string; email: string; password: string; role: Role; linkedId?: string }

export type Patient = {
  id: string; name: string; age: number; gender: "Male" | "Female" | "Other"
  phone: string; bloodType: string; condition: string
  status: "Admitted" | "Outpatient" | "Discharged"; admittedOn: string; bedId?: string
  allergies: string; emergencyContact: string; insurer: string; policyNo: string; coverage: number
}
export type Doctor = {
  id: string; name: string; specialty: string; phone: string
  status: "Available" | "In Surgery" | "On Leave"; patients: number
}
export type Appointment = {
  id: string; patientId: string; doctorId: string; date: string; time: string
  reason: string; status: "Scheduled" | "Completed" | "Cancelled"
}
export type Bed = { id: string; ward: string; number: number; patientId?: string }

export type LineItem = { desc: string; qty: number; price: number }
export type Payment = { date: string; amount: number; method: "Cash" | "Card" | "Transfer" }
export type Invoice = {
  id: string; patientId: string; items: LineItem[]; discount: number; tax: number; insurance: number
  payments: Payment[]; date: string; dueDate: string
}

export type Vital = { id: string; patientId: string; date: string; bp: string; hr: number; temp: number; spo2: number; weight: number; by: string }
export type Note = { id: string; patientId: string; date: string; author: string; type: "Progress" | "Diagnosis" | "Procedure" | "Discharge"; text: string }
export type Item = {
  id: string; name: string; category: "Medicine" | "Supply" | "Equipment"; stock: number; reorder: number
  unit: string; price: number; location: string; expiry?: string; nextMaintenance?: string
}
export type Prescription = {
  id: string; patientId: string; doctorId: string; itemId: string; dosage: string; duration: string
  qty: number; instructions: string; date: string; status: "Pending" | "Dispensed"
}
export type LabOrder = {
  id: string; patientId: string; doctorId: string; test: string; priority: "Routine" | "Urgent" | "STAT"; date: string
  status: "Ordered" | "In Progress" | "Completed"; result?: string; flag?: "Normal" | "Abnormal" | "Critical"
}
export type EmergencyCase = {
  id: string; name: string; age: number; complaint: string; triage: 1 | 2 | 3 | 4 | 5; arrival: string
  status: "Waiting" | "In Treatment" | "Admitted" | "Discharged"
}
export type Surgery = {
  id: string; patientId: string; surgeonId: string; procedure: string; room: string; date: string; time: string
  duration: number; status: "Scheduled" | "In Progress" | "Completed" | "Cancelled"
}
export type Shift = "Morning" | "Evening" | "Night" | "Off"
export type Staff = {
  id: string; name: string; role: "Nurse" | "Lab Technician" | "Pharmacist" | "Receptionist" | "Administrator"
  department: string; phone: string; shifts: Shift[]
}
export type AuditEntry = { id: string; time: string; user: string; role: string; action: string }
export type Settings = { hospitalName: string; taxRate: number }

export type DB = {
  users: User[]; patients: Patient[]; doctors: Doctor[]; appointments: Appointment[]; beds: Bed[]
  invoices: Invoice[]; vitals: Vital[]; notes: Note[]; items: Item[]; prescriptions: Prescription[]
  labs: LabOrder[]; emergency: EmergencyCase[]; surgeries: Surgery[]; staff: Staff[]
  audit: AuditEntry[]; settings: Settings
}
