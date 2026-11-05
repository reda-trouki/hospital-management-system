package com.medicore.hms.service;

import com.medicore.hms.domain.Appointment;
import com.medicore.hms.domain.Doctor;
import com.medicore.hms.domain.enums.AppointmentStatus;
import com.medicore.hms.dto.Responses.MonthRevenue;
import com.medicore.hms.dto.Responses.NameCount;
import com.medicore.hms.dto.Responses.ReportResponse;
import com.medicore.hms.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportService {
    private final PatientRepository patients;
    private final AppointmentRepository appointments;
    private final DoctorRepository doctors;
    private final InvoiceRepository invoices;
    private final LabOrderRepository labs;
    private final EmergencyCaseRepository emergency;
    private final SurgeryRepository surgeries;

    public ReportResponse build() {
        LocalDate today = LocalDate.now();
        List<Appointment> appts = appointments.findAll();
        BigDecimal billed = BigDecimal.ZERO, collected = BigDecimal.ZERO;
        Map<String, BigDecimal> byMonth = new TreeMap<>();
        for (var inv : invoices.findAll()) {
            var t = InvoiceMath.compute(inv, today);
            billed = billed.add(t.total());
            collected = collected.add(t.paid());
            for (var p : inv.getPayments()) byMonth.merge(p.getDate().toString().substring(0, 7), p.getAmount(), BigDecimal::add);
        }
        long completed = appts.stream().filter(a -> a.getStatus() == AppointmentStatus.COMPLETED).count();
        Map<String, String> doctorNames = doctors.findAll().stream().collect(Collectors.toMap(Doctor::getId, Doctor::getName));

        return new ReportResponse(
                patients.count(), appts.size(), appts.isEmpty() ? 0 : (int) Math.round(completed * 100.0 / appts.size()),
                billed, collected, emergency.count(), surgeries.count(), labs.count(),
                byMonth.entrySet().stream().map(e -> new MonthRevenue(e.getKey(), e.getValue())).toList(),
                counts(patients.findAll(), p -> p.getStatus().toString()),
                counts(appts, a -> doctorNames.getOrDefault(a.getDoctorId(), a.getDoctorId())),
                counts(labs.findAll(), l -> l.getStatus().toString()));
    }

    private static <T> List<NameCount> counts(List<T> rows, Function<T, String> key) {
        return rows.stream().collect(Collectors.groupingBy(key, TreeMap::new, Collectors.counting()))
                .entrySet().stream().map(e -> new NameCount(e.getKey(), e.getValue())).toList();
    }
}
