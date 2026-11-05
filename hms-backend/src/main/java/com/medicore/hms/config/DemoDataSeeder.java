package com.medicore.hms.config;

import com.medicore.hms.domain.*;
import com.medicore.hms.domain.enums.*;
import com.medicore.hms.repository.*;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;

/**
 * Loads the same demo records as the React app, only into an empty database and only when
 * app.seed-demo-data=true (the "prod" profile turns it off).
 */
@Component
@ConditionalOnProperty(name = "app.seed-demo-data", havingValue = "true")
@RequiredArgsConstructor
public class DemoDataSeeder implements ApplicationRunner {
    private static final Logger log = LoggerFactory.getLogger(DemoDataSeeder.class);

    private final UserRepository users;
    private final PatientRepository patients;
    private final DoctorRepository doctors;
    private final AppointmentRepository appointments;
    private final BedRepository beds;
    private final InvoiceRepository invoices;
    private final VitalRepository vitals;
    private final NoteRepository notes;
    private final ItemRepository items;
    private final PrescriptionRepository prescriptions;
    private final LabOrderRepository labs;
    private final EmergencyCaseRepository emergency;
    private final SurgeryRepository surgeries;
    private final StaffRepository staff;
    private final SettingsRepository settings;
    private final PasswordEncoder encoder;

    private static LocalDate d(int offset) { return LocalDate.now().plusDays(offset); }
    private static Instant at(int offset, String time) { return d(offset).atTime(LocalTime.parse(time)).toInstant(ZoneOffset.UTC); }
    private static Instant ago(int minutes) { return Instant.now().minusSeconds(minutes * 60L); }
    private static BigDecimal n(String v) { return new BigDecimal(v); }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (users.count() > 0) return;
        log.info("Seeding demo data (disable with app.seed-demo-data=false)");

        settings.save(new HospitalSettings(1L, "MediCore Hospital", n("5.00")));

        user("U-1", "Admin User", "admin@medicore.com", "admin123", Role.ADMIN, null);
        user("U-2", "Dr. Amina Benali", "doctor@medicore.com", "doctor123", Role.DOCTOR, "D-01");
        user("U-3", "Salma Nurse", "nurse@medicore.com", "nurse123", Role.NURSE, null);
        user("U-4", "Rania Reception", "reception@medicore.com", "reception123", Role.RECEPTIONIST, null);
        user("U-5", "Hamza Pharmacist", "pharmacy@medicore.com", "pharmacy123", Role.PHARMACIST, null);
        user("U-6", "Ilyas Lab", "lab@medicore.com", "lab123", Role.LAB_TECH, null);
        user("U-7", "Omar El Fassi", "patient@medicore.com", "patient123", Role.PATIENT, "P-1001");

        doctors.saveAll(List.of(
                doc("D-01", "Dr. Amina Benali", "Cardiology", "+212 600 111 222", DoctorStatus.AVAILABLE, 14),
                doc("D-02", "Dr. Youssef Alaoui", "Neurology", "+212 600 333 444", DoctorStatus.IN_SURGERY, 9),
                doc("D-03", "Dr. Sarah Mitchell", "Pediatrics", "+212 600 555 666", DoctorStatus.AVAILABLE, 21),
                doc("D-04", "Dr. Karim Haddad", "Orthopedics", "+212 600 777 888", DoctorStatus.ON_LEAVE, 6),
                doc("D-05", "Dr. Laila Idrissi", "Obstetrics", "+212 600 999 000", DoctorStatus.AVAILABLE, 17)));

        patients.saveAll(List.of(
                pat("P-1001", "Omar El Fassi", 62, Gender.MALE, "+212 611 000 101", "A+", "Myocardial infarction", PatientStatus.ADMITTED, -3, "ICU-1", "Penicillin", "Salma El Fassi · +212 611 900 001", "AXA Health", "AX-77120", 80),
                pat("P-1002", "Fatima Zahra", 45, Gender.FEMALE, "+212 611 000 102", "O+", "Pneumonia", PatientStatus.ADMITTED, -5, "GEN-2", "None known", "Youssef Zahra · +212 611 900 002", "CNSS", "CN-55109", 70),
                pat("P-1003", "John Carter", 34, Gender.MALE, "+1 555 010 103", "B-", "Sprained ankle", PatientStatus.OUTPATIENT, -1, null, "Latex", "Mary Carter · +1 555 010 900", "", "", 0),
                pat("P-1004", "Nadia Tazi", 29, Gender.FEMALE, "+212 611 000 104", "AB+", "Labor / delivery", PatientStatus.ADMITTED, -1, "MAT-1", "None known", "Reda Tazi · +212 611 900 004", "AXA Health", "AX-88231", 90),
                pat("P-1005", "Hassan Berrada", 71, Gender.MALE, "+212 611 000 105", "O-", "Hypertension review", PatientStatus.DISCHARGED, -9, null, "Aspirin", "Kenza Berrada · +212 611 900 005", "CNOPS", "CP-30045", 60),
                pat("P-1006", "Lina Chraibi", 7, Gender.FEMALE, "+212 611 000 106", "A-", "Appendicitis", PatientStatus.ADMITTED, -2, "PED-3", "None known", "Amal Chraibi · +212 611 900 006", "CNSS", "CN-61822", 70),
                pat("P-1007", "Mehdi Soussi", 52, Gender.MALE, "+212 611 000 107", "B+", "Type 2 diabetes", PatientStatus.ADMITTED, -4, "GEN-5", "Sulfa drugs", "Hind Soussi · +212 611 900 007", "", "", 0)));

        items.saveAll(List.of(
                med("IT-1", "Paracetamol 500mg", 420, 100, "tablets", "0.10", "Pharmacy A1", 400),
                med("IT-2", "Amoxicillin 500mg", 60, 80, "capsules", "0.40", "Pharmacy A2", 220),
                med("IT-3", "Metformin 850mg", 310, 120, "tablets", "0.15", "Pharmacy B1", 500),
                med("IT-4", "Aspirin 75mg", 540, 150, "tablets", "0.05", "Pharmacy B2", 320),
                med("IT-5", "Insulin glargine", 24, 20, "vials", "28.00", "Cold storage", 35),
                med("IT-6", "Atorvastatin 20mg", 200, 80, "tablets", "0.30", "Pharmacy C1", 600),
                med("IT-7", "Clopidogrel 75mg", 150, 60, "tablets", "0.35", "Pharmacy C2", 450),
                supply("IT-8", "Surgical gloves (M)", 35, 40, "boxes", "9.00", "Store 1"),
                supply("IT-9", "Syringes 5ml", 900, 300, "pcs", "0.20", "Store 1"),
                supply("IT-10", "IV infusion sets", 140, 60, "pcs", "1.50", "Store 2"),
                supply("IT-11", "Face masks N95", 500, 200, "pcs", "0.80", "Store 2"),
                equip("IT-12", "Ventilator VT-200", 6, 2, "18000", "ICU", 10),
                equip("IT-13", "Defibrillator", 5, 2, "4500", "ER", 40),
                equip("IT-14", "Digital X-ray unit", 2, 1, "65000", "Radiology", -3),
                equip("IT-15", "Patient monitor", 14, 4, "2200", "Wards", 90)));

        beds.saveAll(buildBeds());

        appointments.saveAll(List.of(
                appt("A-2001", "P-1003", "D-04", 0, "09:00", "Follow-up X-ray", AppointmentStatus.SCHEDULED),
                appt("A-2002", "P-1005", "D-01", 0, "10:30", "Blood pressure check", AppointmentStatus.SCHEDULED),
                appt("A-2003", "P-1006", "D-03", 0, "14:00", "Post-op review", AppointmentStatus.SCHEDULED),
                appt("A-2004", "P-1007", "D-01", 1, "11:15", "ECG", AppointmentStatus.SCHEDULED),
                appt("A-2005", "P-1002", "D-02", -1, "16:00", "Consultation", AppointmentStatus.COMPLETED),
                appt("A-2006", "P-1004", "D-05", -2, "08:30", "Prenatal checkup", AppointmentStatus.CANCELLED),
                appt("A-2007", "P-1001", "D-01", 2, "09:30", "Cardiac follow-up", AppointmentStatus.SCHEDULED)));

        invoices.saveAll(List.of(
                inv("INV-3001", "P-1001", "0", "5", "80", -1, 13, List.of(line("ICU stay (3 days)", 3, "1800"), line("Cardiac catheterization", 1, "2800")), pay(-1, "500", PaymentMethod.CARD)),
                inv("INV-3002", "P-1005", "0", "0", "60", -8, 6, List.of(line("Consultation", 1, "120"), line("Lab panel", 1, "200")), pay(-8, "128", PaymentMethod.CASH)),
                inv("INV-3003", "P-1003", "0", "0", "0", -1, 13, List.of(line("X-ray", 1, "95"), line("Ankle brace", 1, "90")), pay(-1, "185", PaymentMethod.CARD)),
                inv("INV-3004", "P-1002", "5", "5", "70", -20, -6, List.of(line("General ward (5 days)", 5, "350"), line("Chest CT", 1, "350"))),
                inv("INV-3005", "P-1006", "0", "5", "70", -2, 12, List.of(line("Appendectomy", 1, "3400"), line("Pediatric ward (2 days)", 2, "250")))));

        vitals.saveAll(List.of(
                vit("V-1", "P-1001", at(-3, "08:00"), "160/100", 112, 37.2, 92, 84.0),
                vit("V-2", "P-1001", at(-2, "08:00"), "150/95", 98, 37.0, 94, 84.0),
                vit("V-3", "P-1001", at(-1, "08:00"), "138/88", 88, 36.8, 96, 83.0),
                vit("V-4", "P-1001", at(0, "07:30"), "130/84", 80, 36.7, 97, 83.0),
                vit("V-5", "P-1002", at(-1, "09:00"), "122/80", 92, 38.4, 93, 68.0)));

        notes.saveAll(List.of(
                note("N-1", "P-1001", at(-3, "09:15"), "Dr. Amina Benali", NoteType.DIAGNOSIS, "Acute anterior STEMI. Emergency PCI performed, stent placed in LAD. Started dual antiplatelet therapy."),
                note("N-2", "P-1001", at(-1, "10:00"), "Dr. Amina Benali", NoteType.PROGRESS, "Hemodynamically stable. Chest pain resolved. Plan: continue monitoring in ICU 24h, then step down."),
                note("N-3", "P-1002", at(-4, "11:00"), "Dr. Youssef Alaoui", NoteType.DIAGNOSIS, "Community-acquired pneumonia, right lower lobe. Started IV antibiotics.")));

        prescriptions.saveAll(List.of(
                rx("RX-1", "P-1001", "D-01", "IT-7", "75mg once daily", "12 months", 30, "Take with food", -1, RxStatus.PENDING),
                rx("RX-2", "P-1001", "D-01", "IT-6", "20mg at night", "Long term", 30, "Take in the evening", -1, RxStatus.DISPENSED),
                rx("RX-3", "P-1002", "D-02", "IT-2", "500mg three times daily", "7 days", 21, "Finish the full course", -4, RxStatus.PENDING),
                rx("RX-4", "P-1007", "D-01", "IT-3", "850mg twice daily", "3 months", 180, "Take with meals", -3, RxStatus.DISPENSED)));

        labs.saveAll(List.of(
                lab("LAB-1", "P-1001", "D-01", "Troponin I", LabPriority.STAT, at(-3, "08:30"), LabStatus.COMPLETED, "Troponin I 4.8 ng/mL (ref < 0.04)", LabFlag.CRITICAL),
                lab("LAB-2", "P-1002", "D-02", "Complete Blood Count", LabPriority.ROUTINE, at(-4, "10:00"), LabStatus.COMPLETED, "WBC 15.2 ×10⁹/L, Hb 12.8 g/dL, Plt 310", LabFlag.ABNORMAL),
                lab("LAB-3", "P-1007", "D-01", "HbA1c", LabPriority.ROUTINE, at(-1, "09:00"), LabStatus.IN_PROGRESS, null, null),
                lab("LAB-4", "P-1006", "D-03", "Complete Blood Count", LabPriority.URGENT, at(0, "06:45"), LabStatus.ORDERED, null, null),
                lab("LAB-5", "P-1005", "D-01", "Lipid Panel", LabPriority.ROUTINE, at(-8, "09:00"), LabStatus.COMPLETED, "LDL 118 mg/dL, HDL 52 mg/dL", LabFlag.NORMAL)));

        emergency.saveAll(List.of(
                er("ER-1", "Unknown male (approx.)", 40, "Road traffic accident, head trauma", 1, 8, ErStatus.IN_TREATMENT),
                er("ER-2", "Salim Ouazzani", 58, "Chest pain radiating to left arm", 2, 22, ErStatus.WAITING),
                er("ER-3", "Imane Fassi", 24, "Severe abdominal pain", 3, 47, ErStatus.WAITING),
                er("ER-4", "Yassine Bakkali", 12, "Wrist fracture after fall", 4, 65, ErStatus.WAITING),
                er("ER-5", "Sara Moutawakil", 31, "Mild fever and sore throat", 5, 90, ErStatus.WAITING)));

        surgeries.saveAll(List.of(
                surg("S-1", "P-1006", "D-03", "Appendectomy", "OR-1", -2, "10:00", 90, SurgeryStatus.COMPLETED),
                surg("S-2", "P-1001", "D-01", "Coronary angioplasty (PCI)", "OR-2", -3, "09:30", 120, SurgeryStatus.COMPLETED),
                surg("S-3", "P-1003", "D-04", "Ankle ligament repair", "OR-1", 1, "08:30", 150, SurgeryStatus.SCHEDULED),
                surg("S-4", "P-1004", "D-05", "Cesarean section (standby)", "OR-3", 0, "15:00", 75, SurgeryStatus.SCHEDULED)));

        staff.saveAll(List.of(
                stf("ST-1", "Salma Nurse", StaffRole.NURSE, "ICU", "+212 622 000 001", Shift.MORNING, Shift.MORNING, Shift.MORNING, Shift.OFF, Shift.OFF, Shift.EVENING, Shift.EVENING),
                stf("ST-2", "Nabil Tahiri", StaffRole.NURSE, "Emergency", "+212 622 000 002", Shift.NIGHT, Shift.NIGHT, Shift.OFF, Shift.OFF, Shift.NIGHT, Shift.NIGHT, Shift.OFF),
                stf("ST-3", "Hamza Pharmacist", StaffRole.PHARMACIST, "Pharmacy", "+212 622 000 003", Shift.MORNING, Shift.MORNING, Shift.MORNING, Shift.MORNING, Shift.MORNING, Shift.OFF, Shift.OFF),
                stf("ST-4", "Ilyas Lab", StaffRole.LAB_TECHNICIAN, "Laboratory", "+212 622 000 004", Shift.EVENING, Shift.EVENING, Shift.EVENING, Shift.OFF, Shift.MORNING, Shift.MORNING, Shift.OFF),
                stf("ST-5", "Rania Reception", StaffRole.RECEPTIONIST, "Front desk", "+212 622 000 005", Shift.MORNING, Shift.MORNING, Shift.OFF, Shift.EVENING, Shift.EVENING, Shift.EVENING, Shift.OFF)));
    }

    // ---------- builders ----------
    private void user(String id, String name, String email, String password, Role role, String linkedId) {
        users.save(User.builder().id(id).name(name).email(email).password(encoder.encode(password)).role(role).linkedId(linkedId).build());
    }
    private static Doctor doc(String id, String name, String specialty, String phone, DoctorStatus status, int count) {
        return Doctor.builder().id(id).name(name).specialty(specialty).phone(phone).status(status).patients(count).build();
    }
    private static Patient pat(String id, String name, int age, Gender g, String phone, String blood, String condition, PatientStatus status,
                               int admittedOffset, String bedId, String allergies, String contact, String insurer, String policy, int coverage) {
        return Patient.builder().id(id).name(name).age(age).gender(g).phone(phone).bloodType(blood).condition(condition).status(status)
                .admittedOn(d(admittedOffset)).bedId(bedId).allergies(allergies).emergencyContact(contact).insurer(insurer).policyNo(policy).coverage(coverage).build();
    }
    private static Item med(String id, String name, int stock, int reorder, String unit, String price, String loc, int expiryDays) {
        return Item.builder().id(id).name(name).category(ItemCategory.MEDICINE).stock(stock).reorder(reorder).unit(unit).price(n(price)).location(loc).expiry(d(expiryDays)).build();
    }
    private static Item supply(String id, String name, int stock, int reorder, String unit, String price, String loc) {
        return Item.builder().id(id).name(name).category(ItemCategory.SUPPLY).stock(stock).reorder(reorder).unit(unit).price(n(price)).location(loc).build();
    }
    private static Item equip(String id, String name, int stock, int reorder, String price, String loc, int maintenanceDays) {
        return Item.builder().id(id).name(name).category(ItemCategory.EQUIPMENT).stock(stock).reorder(reorder).unit("units").price(n(price)).location(loc).nextMaintenance(d(maintenanceDays)).build();
    }
    private static List<Bed> buildBeds() {
        List<Bed> out = new ArrayList<>();
        String[][] wards = {{"ICU", "ICU", "4"}, {"General", "GEN", "8"}, {"Maternity", "MAT", "4"}, {"Pediatrics", "PED", "4"}};
        for (String[] w : wards) {
            for (int i = 1; i <= Integer.parseInt(w[2]); i++) {
                out.add(Bed.builder().id(w[1] + "-" + i).ward(w[0]).number(i).build());
            }
        }
        String[][] occupied = {{"ICU-1", "P-1001"}, {"GEN-2", "P-1002"}, {"MAT-1", "P-1004"}, {"PED-3", "P-1006"}, {"GEN-5", "P-1007"}};
        for (String[] o : occupied) out.stream().filter(b -> b.getId().equals(o[0])).findFirst().ifPresent(b -> b.setPatientId(o[1]));
        return out;
    }
    private static Appointment appt(String id, String patientId, String doctorId, int offset, String time, String reason, AppointmentStatus s) {
        return Appointment.builder().id(id).patientId(patientId).doctorId(doctorId).date(d(offset)).time(LocalTime.parse(time)).reason(reason).status(s).build();
    }
    private static InvoiceLine line(String desc, int qty, String price) { return new InvoiceLine(desc, qty, n(price)); }
    private static Payment pay(int offset, String amount, PaymentMethod m) { return new Payment(d(offset), n(amount), m); }
    private static Invoice inv(String id, String patientId, String discount, String tax, String insurance, int issuedOffset, int dueOffset,
                               List<InvoiceLine> lines, Payment... payments) {
        return Invoice.builder().id(id).patientId(patientId).items(new ArrayList<>(lines)).discount(n(discount)).tax(n(tax)).insurance(n(insurance))
                .payments(new ArrayList<>(List.of(payments))).date(d(issuedOffset)).dueDate(d(dueOffset)).build();
    }
    private static Vital vit(String id, String patientId, Instant when, String bp, int hr, double temp, int spo2, double weight) {
        return Vital.builder().id(id).patientId(patientId).date(when).bp(bp).hr(hr).temp(temp).spo2(spo2).weight(weight).by("Salma Nurse").build();
    }
    private static Note note(String id, String patientId, Instant when, String author, NoteType type, String text) {
        return Note.builder().id(id).patientId(patientId).date(when).author(author).type(type).text(text).build();
    }
    private static Prescription rx(String id, String patientId, String doctorId, String itemId, String dosage, String duration, int qty, String instr, int offset, RxStatus s) {
        return Prescription.builder().id(id).patientId(patientId).doctorId(doctorId).itemId(itemId).dosage(dosage).duration(duration).qty(qty).instructions(instr).date(d(offset)).status(s).build();
    }
    private static LabOrder lab(String id, String patientId, String doctorId, String test, LabPriority p, Instant when, LabStatus s, String result, LabFlag flag) {
        return LabOrder.builder().id(id).patientId(patientId).doctorId(doctorId).test(test).priority(p).date(when).status(s).result(result).flag(flag).build();
    }
    private static EmergencyCase er(String id, String name, int age, String complaint, int triage, int minutesAgo, ErStatus s) {
        return EmergencyCase.builder().id(id).name(name).age(age).complaint(complaint).triage(triage).arrival(ago(minutesAgo)).status(s).build();
    }
    private static Surgery surg(String id, String patientId, String surgeonId, String procedure, String room, int offset, String time, int duration, SurgeryStatus s) {
        return Surgery.builder().id(id).patientId(patientId).surgeonId(surgeonId).procedure(procedure).room(room).date(d(offset)).time(LocalTime.parse(time)).duration(duration).status(s).build();
    }
    private static Staff stf(String id, String name, StaffRole role, String dept, String phone, Shift... shifts) {
        return Staff.builder().id(id).name(name).role(role).department(dept).phone(phone).shifts(new ArrayList<>(List.of(shifts))).build();
    }
}
