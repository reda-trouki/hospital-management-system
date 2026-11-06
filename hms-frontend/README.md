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


## Connecting to the Spring Boot backend

The app no longer uses localStorage for data: every list and action goes through the REST API in `hms-backend`.

1. Start the backend (`mvn spring-boot:run "-Dspring-boot.run.profiles=h2"` in PowerShell) so it listens on `http://localhost:8080`.
2. Optional: copy `.env.example` to `.env` and change `VITE_API_URL` if the API lives elsewhere.
3. `npm run dev` (http://localhost:5173) or `npm run build && npm run preview` (http://localhost:4173). Both origins are allowed by the backend's default CORS setting; for any other origin set `CORS_ORIGINS` on the backend.
4. Sign in with the demo accounts shown on the login page (they exist when the backend seeds demo data).

How it works: `src/lib/api.ts` is the fetch client (JWT in localStorage, 401 sends you back to login). `src/lib/store.tsx` keeps an in-memory copy of the data, loads the lists each role may read, and after every action calls the API and refreshes. Server errors (409 bed taken, insufficient stock, appointment clash, ...) appear as toasts. Patients use `/api/portal/*` instead of the staff endpoints.

Removed: "Reset demo data" (the backend has no such operation; restart it with the H2 profile to get fresh demo data).


## Design system

Palette: ink `#0B2526` (navigation rail, login panel), paper `#F2F5F4` (workspace), jade `#187A5E` (primary), mint (active states on ink), pulse `#FF5D73` (alerts and the logo's live dot). Tokens live in `src/index.css`; dark mode redefines them under `.dark`.
Type: Bricolage Grotesque for headings and large numbers, Instrument Sans for text, both self-hosted through `@fontsource-variable` (no network needed at runtime).
Logo: `src/components/Logo.tsx` (`LogoMark`, `Logo`); the same mark is `public/favicon.svg`.
Dialogs: `FormDialog` in `src/components/common.tsx` picks a lucide icon from the dialog title (`dialogIcon`), shows the description, and has a Cancel / confirm footer. Icons are lucide-react everywhere.
