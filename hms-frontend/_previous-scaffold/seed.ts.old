import type { DB, Shift } from "./types"
import { addDays as d } from "./utils"

const ago = (mins: number) => new Date(Date.now() - mins * 60000).toISOString()
const at = (offset: number, time: string) => `${d(offset)}T${time}:00.000Z`

const wardDefs = [["ICU", 4], ["General", 8], ["Maternity", 4], ["Pediatrics", 4]] as const
const beds = wardDefs.flatMap(([ward, n]) => Array.from({ length: n }, (_, i) => ({ id: `${ward.slice(0, 3).toUpperCase()}-${i + 1}`, ward, number: i + 1 } as DB["beds"][number])))
const occupy = (bedId: string, patientId: string) => { beds.find((b) => b.id === bedId)!.patientId = patientId }
occupy("ICU-1", "P-1001"); occupy("GEN-2", "P-1002"); occupy("MAT-1", "P-1004"); occupy("PED-3", "P-1006"); occupy("GEN-5", "P-1007")

const roster = (...s: Shift[]) => s

export const seed: DB = {
  settings: { hospitalName: "MediCore Hospital", taxRate: 5 },
  users: [
    { id: "U-1", name: "Admin User", email: "admin@medicore.com", password: "admin123", role: "Admin" },
    { id: "U-2", name: "Dr. Amina Benali", email: "doctor@medicore.com", password: "doctor123", role: "Doctor", linkedId: "D-01" },
    { id: "U-3", name: "Salma Nurse", email: "nurse@medicore.com", password: "nurse123", role: "Nurse" },
    { id: "U-4", name: "Rania Reception", email: "reception@medicore.com", password: "reception123", role: "Receptionist" },
    { id: "U-5", name: "Hamza Pharmacist", email: "pharmacy@medicore.com", password: "pharmacy123", role: "Pharmacist" },
    { id: "U-6", name: "Ilyas Lab", email: "lab@medicore.com", password: "lab123", role: "Lab Tech" },
    { id: "U-7", name: "Omar El Fassi", email: "patient@medicore.com", password: "patient123", role: "Patient", linkedId: "P-1001" },
  ],
  doctors: [
    { id: "D-01", name: "Dr. Amina Benali", specialty: "Cardiology", phone: "+212 600 111 222", status: "Available", patients: 14 },
    { id: "D-02", name: "Dr. Youssef Alaoui", specialty: "Neurology", phone: "+212 600 333 444", status: "In Surgery", patients: 9 },
    { id: "D-03", name: "Dr. Sarah Mitchell", specialty: "Pediatrics", phone: "+212 600 555 666", status: "Available", patients: 21 },
    { id: "D-04", name: "Dr. Karim Haddad", specialty: "Orthopedics", phone: "+212 600 777 888", status: "On Leave", patients: 6 },
    { id: "D-05", name: "Dr. Laila Idrissi", specialty: "Obstetrics", phone: "+212 600 999 000", status: "Available", patients: 17 },
  ],
  patients: [
    { id: "P-1001", name: "Omar El Fassi", age: 62, gender: "Male", phone: "+212 611 000 101", bloodType: "A+", condition: "Myocardial infarction", status: "Admitted", admittedOn: d(-3), bedId: "ICU-1", allergies: "Penicillin", emergencyContact: "Salma El Fassi · +212 611 900 001", insurer: "AXA Health", policyNo: "AX-77120", coverage: 80 },
    { id: "P-1002", name: "Fatima Zahra", age: 45, gender: "Female", phone: "+212 611 000 102", bloodType: "O+", condition: "Pneumonia", status: "Admitted", admittedOn: d(-5), bedId: "GEN-2", allergies: "None known", emergencyContact: "Youssef Zahra · +212 611 900 002", insurer: "CNSS", policyNo: "CN-55109", coverage: 70 },
    { id: "P-1003", name: "John Carter", age: 34, gender: "Male", phone: "+1 555 010 103", bloodType: "B-", condition: "Sprained ankle", status: "Outpatient", admittedOn: d(-1), allergies: "Latex", emergencyContact: "Mary Carter · +1 555 010 900", insurer: "", policyNo: "", coverage: 0 },
    { id: "P-1004", name: "Nadia Tazi", age: 29, gender: "Female", phone: "+212 611 000 104", bloodType: "AB+", condition: "Labor / delivery", status: "Admitted", admittedOn: d(-1), bedId: "MAT-1", allergies: "None known", emergencyContact: "Reda Tazi · +212 611 900 004", insurer: "AXA Health", policyNo: "AX-88231", coverage: 90 },
    { id: "P-1005", name: "Hassan Berrada", age: 71, gender: "Male", phone: "+212 611 000 105", bloodType: "O-", condition: "Hypertension review", status: "Discharged", admittedOn: d(-9), allergies: "Aspirin", emergencyContact: "Kenza Berrada · +212 611 900 005", insurer: "CNOPS", policyNo: "CP-30045", coverage: 60 },
    { id: "P-1006", name: "Lina Chraibi", age: 7, gender: "Female", phone: "+212 611 000 106", bloodType: "A-", condition: "Appendicitis", status: "Admitted", admittedOn: d(-2), bedId: "PED-3", allergies: "None known", emergencyContact: "Amal Chraibi · +212 611 900 006", insurer: "CNSS", policyNo: "CN-61822", coverage: 70 },
    { id: "P-1007", name: "Mehdi Soussi", age: 52, gender: "Male", phone: "+212 611 000 107", bloodType: "B+", condition: "Type 2 diabetes", status: "Admitted", admittedOn: d(-4), bedId: "GEN-5", allergies: "Sulfa drugs", emergencyContact: "Hind Soussi · +212 611 900 007", insurer: "", policyNo: "", coverage: 0 },
  ],
  appointments: [
    { id: "A-2001", patientId: "P-1003", doctorId: "D-04", date: d(0), time: "09:00", reason: "Follow-up X-ray", status: "Scheduled" },
    { id: "A-2002", patientId: "P-1005", doctorId: "D-01", date: d(0), time: "10:30", reason: "Blood pressure check", status: "Scheduled" },
    { id: "A-2003", patientId: "P-1006", doctorId: "D-03", date: d(0), time: "14:00", reason: "Post-op review", status: "Scheduled" },
    { id: "A-2004", patientId: "P-1007", doctorId: "D-01", date: d(1), time: "11:15", reason: "ECG", status: "Scheduled" },
    { id: "A-2005", patientId: "P-1002", doctorId: "D-02", date: d(-1), time: "16:00", reason: "Consultation", status: "Completed" },
    { id: "A-2006", patientId: "P-1004", doctorId: "D-05", date: d(-2), time: "08:30", reason: "Prenatal checkup", status: "Cancelled" },
    { id: "A-2007", patientId: "P-1001", doctorId: "D-01", date: d(2), time: "09:30", reason: "Cardiac follow-up", status: "Scheduled" },
  ],
  beds,
  invoices: [
    { id: "INV-3001", patientId: "P-1001", items: [{ desc: "ICU stay (3 days)", qty: 3, price: 1800 }, { desc: "Cardiac catheterization", qty: 1, price: 2800 }], discount: 0, tax: 5, insurance: 80, payments: [{ date: d(-1), amount: 500, method: "Card" }], date: d(-1), dueDate: d(13) },
    { id: "INV-3002", patientId: "P-1005", items: [{ desc: "Consultation", qty: 1, price: 120 }, { desc: "Lab panel", qty: 1, price: 200 }], discount: 0, tax: 0, insurance: 60, payments: [{ date: d(-8), amount: 128, method: "Cash" }], date: d(-8), dueDate: d(6) },
    { id: "INV-3003", patientId: "P-1003", items: [{ desc: "X-ray", qty: 1, price: 95 }, { desc: "Ankle brace", qty: 1, price: 90 }], discount: 0, tax: 0, insurance: 0, payments: [{ date: d(-1), amount: 185, method: "Card" }], date: d(-1), dueDate: d(13) },
    { id: "INV-3004", patientId: "P-1002", items: [{ desc: "General ward (5 days)", qty: 5, price: 350 }, { desc: "Chest CT", qty: 1, price: 350 }], discount: 5, tax: 5, insurance: 70, payments: [], date: d(-20), dueDate: d(-6) },
    { id: "INV-3005", patientId: "P-1006", items: [{ desc: "Appendectomy", qty: 1, price: 3400 }, { desc: "Pediatric ward (2 days)", qty: 2, price: 250 }], discount: 0, tax: 5, insurance: 70, payments: [], date: d(-2), dueDate: d(12) },
  ],
  vitals: [
    { id: "V-1", patientId: "P-1001", date: at(-3, "08:00"), bp: "160/100", hr: 112, temp: 37.2, spo2: 92, weight: 84, by: "Salma Nurse" },
    { id: "V-2", patientId: "P-1001", date: at(-2, "08:00"), bp: "150/95", hr: 98, temp: 37.0, spo2: 94, weight: 84, by: "Salma Nurse" },
    { id: "V-3", patientId: "P-1001", date: at(-1, "08:00"), bp: "138/88", hr: 88, temp: 36.8, spo2: 96, weight: 83, by: "Salma Nurse" },
    { id: "V-4", patientId: "P-1001", date: at(0, "07:30"), bp: "130/84", hr: 80, temp: 36.7, spo2: 97, weight: 83, by: "Salma Nurse" },
    { id: "V-5", patientId: "P-1002", date: at(-1, "09:00"), bp: "122/80", hr: 92, temp: 38.4, spo2: 93, weight: 68, by: "Salma Nurse" },
  ],
  notes: [
    { id: "N-1", patientId: "P-1001", date: at(-3, "09:15"), author: "Dr. Amina Benali", type: "Diagnosis", text: "Acute anterior STEMI. Emergency PCI performed, stent placed in LAD. Started dual antiplatelet therapy." },
    { id: "N-2", patientId: "P-1001", date: at(-1, "10:00"), author: "Dr. Amina Benali", type: "Progress", text: "Hemodynamically stable. Chest pain resolved. Plan: continue monitoring in ICU 24h, then step down." },
    { id: "N-3", patientId: "P-1002", date: at(-4, "11:00"), author: "Dr. Youssef Alaoui", type: "Diagnosis", text: "Community-acquired pneumonia, right lower lobe. Started IV antibiotics." },
  ],
  items: [
    { id: "IT-1", name: "Paracetamol 500mg", category: "Medicine", stock: 420, reorder: 100, unit: "tablets", price: 0.1, location: "Pharmacy A1", expiry: d(400) },
    { id: "IT-2", name: "Amoxicillin 500mg", category: "Medicine", stock: 60, reorder: 80, unit: "capsules", price: 0.4, location: "Pharmacy A2", expiry: d(220) },
    { id: "IT-3", name: "Metformin 850mg", category: "Medicine", stock: 310, reorder: 120, unit: "tablets", price: 0.15, location: "Pharmacy B1", expiry: d(500) },
    { id: "IT-4", name: "Aspirin 75mg", category: "Medicine", stock: 540, reorder: 150, unit: "tablets", price: 0.05, location: "Pharmacy B2", expiry: d(320) },
    { id: "IT-5", name: "Insulin glargine", category: "Medicine", stock: 24, reorder: 20, unit: "vials", price: 28, location: "Cold storage", expiry: d(35) },
    { id: "IT-6", name: "Atorvastatin 20mg", category: "Medicine", stock: 200, reorder: 80, unit: "tablets", price: 0.3, location: "Pharmacy C1", expiry: d(600) },
    { id: "IT-7", name: "Clopidogrel 75mg", category: "Medicine", stock: 150, reorder: 60, unit: "tablets", price: 0.35, location: "Pharmacy C2", expiry: d(450) },
    { id: "IT-8", name: "Surgical gloves (M)", category: "Supply", stock: 35, reorder: 40, unit: "boxes", price: 9, location: "Store 1" },
    { id: "IT-9", name: "Syringes 5ml", category: "Supply", stock: 900, reorder: 300, unit: "pcs", price: 0.2, location: "Store 1" },
    { id: "IT-10", name: "IV infusion sets", category: "Supply", stock: 140, reorder: 60, unit: "pcs", price: 1.5, location: "Store 2" },
    { id: "IT-11", name: "Face masks N95", category: "Supply", stock: 500, reorder: 200, unit: "pcs", price: 0.8, location: "Store 2" },
    { id: "IT-12", name: "Ventilator VT-200", category: "Equipment", stock: 6, reorder: 2, unit: "units", price: 18000, location: "ICU", nextMaintenance: d(10) },
    { id: "IT-13", name: "Defibrillator", category: "Equipment", stock: 5, reorder: 2, unit: "units", price: 4500, location: "ER", nextMaintenance: d(40) },
    { id: "IT-14", name: "Digital X-ray unit", category: "Equipment", stock: 2, reorder: 1, unit: "units", price: 65000, location: "Radiology", nextMaintenance: d(-3) },
    { id: "IT-15", name: "Patient monitor", category: "Equipment", stock: 14, reorder: 4, unit: "units", price: 2200, location: "Wards", nextMaintenance: d(90) },
  ],
  prescriptions: [
    { id: "RX-1", patientId: "P-1001", doctorId: "D-01", itemId: "IT-7", dosage: "75mg once daily", duration: "12 months", qty: 30, instructions: "Take with food", date: d(-1), status: "Pending" },
    { id: "RX-2", patientId: "P-1001", doctorId: "D-01", itemId: "IT-6", dosage: "20mg at night", duration: "Long term", qty: 30, instructions: "Take in the evening", date: d(-1), status: "Dispensed" },
    { id: "RX-3", patientId: "P-1002", doctorId: "D-02", itemId: "IT-2", dosage: "500mg three times daily", duration: "7 days", qty: 21, instructions: "Finish the full course", date: d(-4), status: "Pending" },
    { id: "RX-4", patientId: "P-1007", doctorId: "D-01", itemId: "IT-3", dosage: "850mg twice daily", duration: "3 months", qty: 180, instructions: "Take with meals", date: d(-3), status: "Dispensed" },
  ],
  labs: [
    { id: "LAB-1", patientId: "P-1001", doctorId: "D-01", test: "Troponin I", priority: "STAT", date: at(-3, "08:30"), status: "Completed", result: "Troponin I 4.8 ng/mL (ref < 0.04)", flag: "Critical" },
    { id: "LAB-2", patientId: "P-1002", doctorId: "D-02", test: "Complete Blood Count", priority: "Routine", date: at(-4, "10:00"), status: "Completed", result: "WBC 15.2 ×10⁹/L, Hb 12.8 g/dL, Plt 310", flag: "Abnormal" },
    { id: "LAB-3", patientId: "P-1007", doctorId: "D-01", test: "HbA1c", priority: "Routine", date: at(-1, "09:00"), status: "In Progress" },
    { id: "LAB-4", patientId: "P-1006", doctorId: "D-03", test: "Complete Blood Count", priority: "Urgent", date: at(0, "06:45"), status: "Ordered" },
    { id: "LAB-5", patientId: "P-1005", doctorId: "D-01", test: "Lipid Panel", priority: "Routine", date: at(-8, "09:00"), status: "Completed", result: "LDL 118 mg/dL, HDL 52 mg/dL", flag: "Normal" },
  ],
  emergency: [
    { id: "ER-1", name: "Unknown male (approx.)", age: 40, complaint: "Road traffic accident, head trauma", triage: 1, arrival: ago(8), status: "In Treatment" },
    { id: "ER-2", name: "Salim Ouazzani", age: 58, complaint: "Chest pain radiating to left arm", triage: 2, arrival: ago(22), status: "Waiting" },
    { id: "ER-3", name: "Imane Fassi", age: 24, complaint: "Severe abdominal pain", triage: 3, arrival: ago(47), status: "Waiting" },
    { id: "ER-4", name: "Yassine Bakkali", age: 12, complaint: "Wrist fracture after fall", triage: 4, arrival: ago(65), status: "Waiting" },
    { id: "ER-5", name: "Sara Moutawakil", age: 31, complaint: "Mild fever and sore throat", triage: 5, arrival: ago(90), status: "Waiting" },
  ],
  surgeries: [
    { id: "S-1", patientId: "P-1006", surgeonId: "D-03", procedure: "Appendectomy", room: "OR-1", date: d(-2), time: "10:00", duration: 90, status: "Completed" },
    { id: "S-2", patientId: "P-1001", surgeonId: "D-01", procedure: "Coronary angioplasty (PCI)", room: "OR-2", date: d(-3), time: "09:30", duration: 120, status: "Completed" },
    { id: "S-3", patientId: "P-1003", surgeonId: "D-04", procedure: "Ankle ligament repair", room: "OR-1", date: d(1), time: "08:30", duration: 150, status: "Scheduled" },
    { id: "S-4", patientId: "P-1004", surgeonId: "D-05", procedure: "Cesarean section (standby)", room: "OR-3", date: d(0), time: "15:00", duration: 75, status: "Scheduled" },
  ],
  staff: [
    { id: "ST-1", name: "Salma Nurse", role: "Nurse", department: "ICU", phone: "+212 622 000 001", shifts: roster("Morning", "Morning", "Morning", "Off", "Off", "Evening", "Evening") },
    { id: "ST-2", name: "Nabil Tahiri", role: "Nurse", department: "Emergency", phone: "+212 622 000 002", shifts: roster("Night", "Night", "Off", "Off", "Night", "Night", "Off") },
    { id: "ST-3", name: "Hamza Pharmacist", role: "Pharmacist", department: "Pharmacy", phone: "+212 622 000 003", shifts: roster("Morning", "Morning", "Morning", "Morning", "Morning", "Off", "Off") },
    { id: "ST-4", name: "Ilyas Lab", role: "Lab Technician", department: "Laboratory", phone: "+212 622 000 004", shifts: roster("Evening", "Evening", "Evening", "Off", "Morning", "Morning", "Off") },
    { id: "ST-5", name: "Rania Reception", role: "Receptionist", department: "Front desk", phone: "+212 622 000 005", shifts: roster("Morning", "Morning", "Off", "Evening", "Evening", "Evening", "Off") },
  ],
  audit: [],
}
