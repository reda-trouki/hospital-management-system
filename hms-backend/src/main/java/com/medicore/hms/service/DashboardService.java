package com.medicore.hms.service;

import com.medicore.hms.domain.Appointment;
import com.medicore.hms.domain.Bed;
import com.medicore.hms.domain.Item;
import com.medicore.hms.domain.enums.*;
import com.medicore.hms.dto.Responses.DashboardResponse;
import com.medicore.hms.dto.Responses.WardOccupancy;
import com.medicore.hms.repository.*;
import com.medicore.hms.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {
    private final PatientRepository patients;
    private final AppointmentRepository appointments;
    private final BedRepository beds;
    private final InvoiceRepository invoices;
    private final EmergencyCaseRepository emergency;
    private final LabOrderRepository labs;
    private final ItemRepository items;
    private final SurgeryRepository surgeries;

    public DashboardResponse build() {
        Role role = CurrentUser.require().role();
        LocalDate today = LocalDate.now();

        List<Bed> allBeds = beds.findAll(Sort.by("ward", "number"));
        long occupied = allBeds.stream().filter(b -> b.getPatientId() != null).count();
        Map<String, long[]> perWard = new LinkedHashMap<>();
        for (Bed b : allBeds) {
            long[] c = perWard.computeIfAbsent(b.getWard(), k -> new long[2]);
            c[b.getPatientId() != null ? 0 : 1]++;
        }
        List<WardOccupancy> wards = perWard.entrySet().stream().map(e -> new WardOccupancy(e.getKey(), e.getValue()[0], e.getValue()[1])).toList();

        BigDecimal outstanding = null;
        long unpaid = 0;
        if (role == Role.ADMIN || role == Role.RECEPTIONIST) {
            outstanding = BigDecimal.ZERO;
            for (var inv : invoices.findAll()) {
                BigDecimal balance = InvoiceMath.compute(inv, today).balance();
                if (balance.signum() > 0) {
                    outstanding = outstanding.add(balance);
                    unpaid++;
                }
            }
        }

        long lowStock = items.findAll().stream().filter(DashboardService::isLow).count();
        Specification<Appointment> todaysSpec = (root, q, cb) ->
                cb.and(cb.equal(root.get("date"), today), cb.equal(root.get("status"), AppointmentStatus.SCHEDULED));
        List<Appointment> schedule = appointments.findAll(todaysSpec, Sort.by("time"));

        return new DashboardResponse(
                patients.findAll().stream().filter(p -> p.getStatus() == PatientStatus.ADMITTED).count(), patients.count(), schedule.size(),
                allBeds.size(), occupied, allBeds.isEmpty() ? 0 : (int) Math.round(occupied * 100.0 / allBeds.size()),
                outstanding, unpaid,
                emergency.findAll().stream().filter(c -> c.getStatus() == ErStatus.WAITING).count(),
                emergency.findAll().stream().filter(c -> c.getStatus() == ErStatus.IN_TREATMENT).count(),
                labs.findAll().stream().filter(l -> l.getStatus() != LabStatus.COMPLETED).count(),
                lowStock,
                surgeries.findAll().stream().filter(s -> s.getDate().equals(today) && s.getStatus() != SurgeryStatus.CANCELLED).count(),
                wards, schedule);
    }

    static boolean isLow(Item i) {
        return i.getCategory() != ItemCategory.EQUIPMENT && i.getStock() <= i.getReorder();
    }
}
