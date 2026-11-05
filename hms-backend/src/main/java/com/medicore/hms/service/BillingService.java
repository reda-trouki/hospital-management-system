package com.medicore.hms.service;

import com.medicore.hms.common.BadRequestException;
import com.medicore.hms.common.Ids;
import com.medicore.hms.common.NotFoundException;
import com.medicore.hms.common.Specs;
import com.medicore.hms.domain.Invoice;
import com.medicore.hms.domain.Payment;
import com.medicore.hms.domain.enums.InvoiceStatus;
import com.medicore.hms.dto.Requests.InvoiceCreate;
import com.medicore.hms.dto.Requests.PaymentCreate;
import com.medicore.hms.dto.Responses.InvoiceResponse;
import com.medicore.hms.repository.InvoiceRepository;
import com.medicore.hms.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class BillingService {
    private final InvoiceRepository invoices;
    private final PatientRepository patients;
    private final SettingsService settings;
    private final AuditService audit;

    @Transactional(readOnly = true)
    public List<InvoiceResponse> list(String patientId, InvoiceStatus status) {
        return invoices.findAll(Specs.eq("patientId", patientId), Sort.by(Sort.Direction.DESC, "date")).stream()
                .map(BillingService::toResponse)
                .filter(i -> status == null || i.status() == status)
                .toList();
    }

    @Transactional(readOnly = true)
    public InvoiceResponse get(String id) {
        return toResponse(find(id));
    }

    public InvoiceResponse create(InvoiceCreate r) {
        var patient = patients.findById(r.patientId()).orElseThrow(() -> new NotFoundException("Patient " + r.patientId() + " not found"));
        BigDecimal tax = r.tax() != null ? r.tax() : settings.get().getTaxRate();
        // Insurance share defaults to the coverage recorded on the patient.
        BigDecimal insurance = r.insurance() != null ? r.insurance() : BigDecimal.valueOf(patient.getCoverage());
        int dueDays = r.dueDays() == null ? 14 : r.dueDays();
        Invoice inv = Invoice.builder().id(Ids.next("INV")).patientId(patient.getId())
                .items(new ArrayList<>(r.items()))
                .discount(r.discount() == null ? BigDecimal.ZERO : r.discount()).tax(tax).insurance(insurance)
                .payments(new ArrayList<>()).date(LocalDate.now()).dueDate(LocalDate.now().plusDays(dueDays)).build();
        invoices.save(inv);
        audit.log("Created invoice " + inv.getId() + " for " + patient.getName());
        return toResponse(inv);
    }

    /** Takes a row lock so two simultaneous payments cannot overpay the invoice. */
    public InvoiceResponse pay(String id, PaymentCreate r) {
        Invoice inv = invoices.lockById(id).orElseThrow(() -> new NotFoundException("Invoice " + id + " not found"));
        BigDecimal balance = InvoiceMath.compute(inv, LocalDate.now()).balance();
        if (balance.signum() <= 0) throw new BadRequestException("Invoice " + id + " is already fully paid");
        if (r.amount().compareTo(balance) > 0) throw new BadRequestException("Payment exceeds the balance due (" + balance + ")");
        inv.getPayments().add(new Payment(LocalDate.now(), r.amount().setScale(2, java.math.RoundingMode.HALF_UP), r.method()));
        audit.log("Recorded payment of $" + r.amount().setScale(2, java.math.RoundingMode.HALF_UP) + " on " + id);
        return toResponse(inv);
    }

    public Invoice find(String id) {
        return invoices.findById(id).orElseThrow(() -> new NotFoundException("Invoice " + id + " not found"));
    }

    public static InvoiceResponse toResponse(Invoice i) {
        InvoiceMath.Totals t = InvoiceMath.compute(i, LocalDate.now());
        return new InvoiceResponse(i.getId(), i.getPatientId(), List.copyOf(i.getItems()), i.getDiscount(), i.getTax(), i.getInsurance(),
                List.copyOf(i.getPayments()), i.getDate(), i.getDueDate(), t.subtotal(), t.discount(), t.tax(), t.total(),
                t.insurance(), t.patientDue(), t.paid(), t.balance(), t.status());
    }
}
