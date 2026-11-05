package com.medicore.hms.service;

import com.medicore.hms.domain.enums.*;
import com.medicore.hms.dto.Responses.Notice;
import com.medicore.hms.repository.*;
import com.medicore.hms.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;

/** Derived alerts (nothing is stored). Each notice is only shown to roles that can open the page it links to. */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NotificationService {
    private final EmergencyCaseRepository emergency;
    private final LabOrderRepository labs;
    private final PrescriptionRepository prescriptions;
    private final ItemRepository items;
    private final InvoiceRepository invoices;
    private final AppointmentRepository appointments;
    private final PatientRepository patients;

    private static final Map<String, Set<Role>> VISIBLE_TO = Map.of(
            "emergency", Set.of(Role.ADMIN, Role.DOCTOR, Role.NURSE, Role.RECEPTIONIST),
            "lab", Set.of(Role.ADMIN, Role.DOCTOR, Role.NURSE, Role.LAB_TECH),
            "pharmacy", Set.of(Role.ADMIN, Role.DOCTOR, Role.NURSE, Role.PHARMACIST),
            "inventory", Set.of(Role.ADMIN, Role.NURSE, Role.PHARMACIST),
            "billing", Set.of(Role.ADMIN, Role.RECEPTIONIST),
            "appointments", Set.of(Role.ADMIN, Role.DOCTOR, Role.NURSE, Role.RECEPTIONIST));

    public List<Notice> list() {
        Role role = CurrentUser.require().role();
        LocalDate today = LocalDate.now();
        List<Notice> out = new ArrayList<>();

        emergency.findAll().stream().filter(e -> e.getStatus() == ErStatus.WAITING && e.getTriage() <= 2)
                .forEach(e -> out.add(new Notice(e.getId(), "Critical ER case waiting: " + e.getName() + " (triage " + e.getTriage() + ")", "/emergency", "emergency", "danger")));

        labs.findAll().stream().filter(l -> l.getFlag() == LabFlag.CRITICAL).limit(3).forEach(l -> {
            String name = patients.findById(l.getPatientId()).map(p -> p.getName()).orElse(l.getPatientId());
            out.add(new Notice(l.getId(), "Critical lab result: " + l.getTest() + " (" + name + ")", "/patients/" + l.getPatientId(), "lab", "danger"));
        });
        long pendingLabs = labs.findAll().stream().filter(l -> l.getStatus() != LabStatus.COMPLETED).count();
        if (pendingLabs > 0) out.add(new Notice("labs", pendingLabs + " lab order(s) awaiting results", "/lab", "lab", "info"));

        long pendingRx = prescriptions.findAll().stream().filter(r -> r.getStatus() == RxStatus.PENDING).count();
        if (pendingRx > 0) out.add(new Notice("rx", pendingRx + " prescription(s) waiting to be dispensed", "/pharmacy", "pharmacy", "info"));

        for (var i : items.findAll()) {
            String page = i.getCategory() == ItemCategory.MEDICINE ? "pharmacy" : "inventory";
            if (DashboardService.isLow(i)) out.add(new Notice("low-" + i.getId(), "Low stock: " + i.getName() + " (" + i.getStock() + " " + i.getUnit() + " left)", "/" + page, page, "warning"));
            if (i.getExpiry() != null && !i.getExpiry().isAfter(today.plusDays(60))) out.add(new Notice("exp-" + i.getId(), i.getName() + " expires " + i.getExpiry(), "/pharmacy", "pharmacy", "warning"));
            if (i.getNextMaintenance() != null && !i.getNextMaintenance().isAfter(today.plusDays(14))) {
                boolean overdue = i.getNextMaintenance().isBefore(today);
                out.add(new Notice("mnt-" + i.getId(), "Maintenance " + (overdue ? "overdue" : "due") + ": " + i.getName(), "/inventory", "inventory", overdue ? "danger" : "warning"));
            }
        }

        long overdue = invoices.findAll().stream().filter(i -> InvoiceMath.compute(i, today).status() == InvoiceStatus.OVERDUE).count();
        if (overdue > 0) out.add(new Notice("inv", overdue + " overdue invoice(s)", "/billing", "billing", "warning"));

        long todays = appointments.findAll().stream().filter(a -> a.getDate().equals(today) && a.getStatus() == AppointmentStatus.SCHEDULED).count();
        if (todays > 0) out.add(new Notice("appt", todays + " appointment(s) scheduled today", "/appointments", "appointments", "info"));

        return out.stream().filter(n -> VISIBLE_TO.getOrDefault(n.feature(), Set.of()).contains(role)).toList();
    }
}
