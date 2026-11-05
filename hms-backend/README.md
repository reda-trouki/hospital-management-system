# MediCore HMS – Spring Boot backend

REST API for the MediCore React frontend (patients, appointments, doctors, wards/beds, emergency, surgeries,
lab, pharmacy/inventory, billing, staff, audit, patient portal). Java 21, Spring Boot 3.5, JPA, Flyway,
PostgreSQL (H2 for dev/tests), JWT auth, role-based access.

> **Status: written but NOT compiled or tested.** It was generated in a sandbox with no access to Maven Central.
> Run `mvn clean verify` first and expect to fix a few compile or test issues. Dependency versions
> (Boot 3.5.0, springdoc 2.8.8, jjwt 0.12.6) were chosen from memory; `docker-compose.yml` and the `Dockerfile` are untested too.

## Run

```bash
# 1. Fastest: in-memory H2, demo data
mvn spring-boot:run -Dspring-boot.run.profiles=h2

# 2. PostgreSQL via Docker
docker compose up db            # then:  mvn spring-boot:run
docker compose up --build       # db + api

# 3. Tests (H2)
mvn clean verify
```

API: http://localhost:8080 · Swagger UI: `/swagger-ui.html` · Health: `/actuator/health`

## Configuration (env vars)

| Var | Default | Notes |
|---|---|---|
| `DB_URL` / `DB_USER` / `DB_PASSWORD` | local postgres | required in `prod` |
| `JWT_SECRET` | dev secret | **change it**; required in `prod` (>= 32 bytes) |
| `CORS_ORIGINS` | `http://localhost:5173,http://localhost:3000` | comma separated |
| `SEED_DEMO_DATA` | `true` | seeds only when the users table is empty; `false` in `prod` |

## Demo logins (seeded)

admin@ / doctor@ / nurse@ / reception@ / pharmacy@ / lab@ / patient@ `medicore.com`, with passwords
`admin123`, `doctor123`, `nurse123`, `reception123`, `pharmacy123`, `lab123`, `patient123`. Change or disable these before any real use.

## Auth

`POST /api/auth/login {email,password}` returns `{token, user}`. Send `Authorization: Bearer <token>` afterwards.
`GET /api/auth/me` returns the current user. Repeated failed logins are rate limited.

## Roles and access

| Area | Roles |
|---|---|
| Users, audit, reports, settings (write) | ADMIN |
| Billing / invoices | ADMIN, RECEPTIONIST |
| Patients, appointments | clinical + front desk (see `SecurityConfig`) |
| Prescriptions (write) | DOCTOR; dispense: PHARMACIST |
| Lab orders: doctor; results: LAB_TECH | |
| Portal `/api/portal/**` | PATIENT only, scoped to the linked patient |

The URL matrix is in `config/SecurityConfig.java`; finer rules (e.g. an admin cannot delete their own account)
are in the services. Unmatched `/api/**` routes are denied.

## Main endpoints

`/api/patients` (+`/{id}/discharge`) · `/api/appointments` (+`/{id}/status|reschedule|remind`) · `/api/doctors` ·
`/api/beds` (+`/{id}/assign|free`) · `/api/vitals` · `/api/notes` · `/api/items` (+`/{id}/restock|service`) ·
`/api/prescriptions` (+`/{id}/dispense`) · `/api/labs` (+`/{id}/start|result`) · `/api/emergency` (+`/{id}/status`) ·
`/api/surgeries` (+`/{id}/status`) · `/api/staff` (+`/{id}/shifts`) · `/api/invoices` (+`/{id}/payments`) ·
`/api/dashboard` · `/api/notifications` · `/api/reports/summary` · `/api/audit` (paged) · `/api/users` · `/api/settings` · `/api/portal/*`

Enum values are serialized as the same labels the React app uses ("In Surgery", "STAT", ...). JSON field names match
`src/lib/types.ts`. Errors are RFC 7807 `ProblemDetail`; validation errors add an `errors` map.

## Business rules ported from the frontend

Bed assignment and occupancy, discharge frees the bed, patient delete cascades, appointment doctor/time conflicts,
surgery room overlap, pharmacy stock checks with row locking, allergy block with `allergyOverride`, ER and surgery
status transitions, invoice maths in `BigDecimal` (same as the React `calc`), payments capped at the balance.

## Known gaps

- The React app still uses localStorage; it needs an API client (login, token storage, replace the store calls).
- Lists other than audit are not paginated.
- Tests use H2, not Testcontainers; PostgreSQL-specific behaviour is untested.
- Flyway migration `V1__init.sql` is the only schema source (`ddl-auto: none`).
