# MediCore – Hospital Management System

React + TypeScript + Vite, styled with Tailwind CSS v4 and shadcn/ui-style components (Radix primitives in `src/components/ui`).

## Run
    npm install
    npm run dev      # development
    npm run build    # production build

## Demo accounts (password shown)
| Role         | Email                    | Password     |
|--------------|--------------------------|--------------|
| Admin        | admin@medicore.com       | admin123     |
| Doctor       | doctor@medicore.com      | doctor123    |
| Nurse        | nurse@medicore.com       | nurse123     |
| Receptionist | reception@medicore.com   | reception123 |
| Pharmacist   | pharmacy@medicore.com    | pharmacy123  |
| Lab Tech     | lab@medicore.com         | lab123       |
| Patient      | patient@medicore.com     | patient123   |

## Modules
Dashboard · Patients (+ full medical record: vitals, notes, prescriptions, labs, billing) · Appointments ·
Emergency triage · Surgeries · Wards & Beds · Laboratory · Pharmacy · Inventory · Billing & insurance ·
Doctors · Staff & shifts · Reports · Audit log · Settings & users · Patient portal

## Notes
Front-end only: data and sessions are stored in the browser (localStorage); passwords are plain text.
A real deployment needs a backend with proper authentication, access control and a database.
