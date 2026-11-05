package com.medicore.hms.service;

import com.medicore.hms.common.ConflictException;
import com.medicore.hms.common.NotFoundException;
import com.medicore.hms.common.BadRequestException;
import com.medicore.hms.common.Specs;
import com.medicore.hms.domain.Appointment;
import com.medicore.hms.domain.Doctor;
import com.medicore.hms.domain.Item;
import com.medicore.hms.domain.Patient;
import com.medicore.hms.domain.enums.AppointmentStatus;
import com.medicore.hms.domain.enums.DoctorStatus;
import com.medicore.hms.domain.enums.LabStatus;
import com.medicore.hms.dto.Requests.PaymentCreate;
import com.medicore.hms.dto.Requests.PortalBook;
import com.medicore.hms.dto.Responses.*;
import com.medicore.hms.repository.*;
import com.medicore.hms.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/** Everything a patient may see or do – always scoped to the patient linked to the signed-in account. */
@Service
@RequiredArgsConstructor
@Transactional
public class PortalService {
    private final PatientRepository patients;
    private final DoctorRepository doctors;
    private final AppointmentRepository appointments;
    private final PrescriptionRepository prescriptions;
    private final ItemRepository items;
    private final LabOrderRepository labs;
    private final InvoiceRepository invoices;
    private final AppointmentService appointmentService;
    private final BillingService billing;
    private final AuditService audit;

    @Transactional(readOnly = true)
    public PortalResponse me() {
        Patient p = patient();
        Map<String, String> doctorNames = doctors.findAll().stream().collect(Collectors.toMap(Doctor::getId, Doctor::getName));
        Map<String, String> medicineNames = items.findAll().stream().collect(Collectors.toMap(Item::getId, Item::getName));

        var appts = appointments.findAll(Specs.eq("patientId", p.getId()), Sort.by(Sort.Direction.DESC, "date", "time")).stream()
                .map(a -> new PortalAppointment(a.getId(), a.getDate(), a.getTime(), doctorNames.getOrDefault(a.getDoctorId(), "Doctor"), a.getReason(), a.getStatus())).toList();
        var rx = prescriptions.findAll(Specs.eq("patientId", p.getId()), Sort.by(Sort.Direction.DESC, "date")).stream()
                .map(r -> new PortalPrescription(r.getId(), r.getDate(), medicineNames.getOrDefault(r.getItemId(), "Medicine"), r.getDosage(), r.getDuration(), r.getInstructions(), r.getStatus())).toList();
        // Patients only see finished results.
        var results = labs.findAll(Specs.eq("patientId", p.getId()), Sort.by(Sort.Direction.DESC, "date")).stream()
                .filter(l -> l.getStatus() == LabStatus.COMPLETED)
                .map(l -> new PortalLab(l.getId(), l.getDate(), l.getTest(), l.getResult(), l.getFlag())).toList();
        List<InvoiceResponse> bills = invoices.findAll(Specs.eq("patientId", p.getId()), Sort.by(Sort.Direction.DESC, "date")).stream().map(BillingService::toResponse).toList();
        BigDecimal due = bills.stream().map(InvoiceResponse::balance).reduce(BigDecimal.ZERO, BigDecimal::add);
        return new PortalResponse(p, appts, rx, results, bills, due);
    }

    @Transactional(readOnly = true)
    public List<PortalDoctor> doctors() {
        return doctors.findAll(Sort.by("name")).stream().filter(d -> d.getStatus() != DoctorStatus.ON_LEAVE)
                .map(d -> new PortalDoctor(d.getId(), d.getName(), d.getSpecialty())).toList();
    }

    public Appointment book(PortalBook r) {
        Patient p = patient();
        if (r.date().isBefore(LocalDate.now())) throw new BadRequestException("Appointments cannot be booked in the past");
        return appointmentService.create(p.getId(), r.doctorId(), r.date(), r.time(), r.reason());
    }

    public Appointment cancel(String appointmentId) {
        Patient p = patient();
        Appointment a = appointmentService.get(appointmentId);
        // Same answer as "not found" so patients cannot probe other people's ids.
        if (!a.getPatientId().equals(p.getId())) throw new NotFoundException("Appointment " + appointmentId + " not found");
        if (a.getStatus() != AppointmentStatus.SCHEDULED) throw new ConflictException("Only scheduled appointments can be cancelled");
        a.setStatus(AppointmentStatus.CANCELLED);
        audit.log("Patient cancelled an appointment");
        return a;
    }

    public InvoiceResponse pay(String invoiceId, PaymentCreate r) {
        Patient p = patient();
        if (!billing.find(invoiceId).getPatientId().equals(p.getId())) throw new NotFoundException("Invoice " + invoiceId + " not found");
        return billing.pay(invoiceId, r);
    }

    private Patient patient() {
        String linked = CurrentUser.require().linkedId();
        if (linked == null) throw new NotFoundException("Your account is not linked to a patient record");
        return patients.findById(linked).orElseThrow(() -> new NotFoundException("Patient record not found"));
    }
}
