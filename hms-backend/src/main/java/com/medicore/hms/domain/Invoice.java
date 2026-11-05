package com.medicore.hms.domain;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "invoices")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Invoice {
    @Id @Column(length = 32) private String id;
    @Column(name = "patient_id", nullable = false, length = 32) private String patientId;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "invoice_items", joinColumns = @JoinColumn(name = "invoice_id"))
    @OrderColumn(name = "line_no")
    @Builder.Default
    private List<InvoiceLine> items = new ArrayList<>();

    @Column(name = "discount_pct", nullable = false) private BigDecimal discount;
    @Column(name = "tax_pct", nullable = false) private BigDecimal tax;
    @Column(name = "insurance_pct", nullable = false) private BigDecimal insurance;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "invoice_payments", joinColumns = @JoinColumn(name = "invoice_id"))
    @OrderColumn(name = "payment_no")
    @Builder.Default
    private List<Payment> payments = new ArrayList<>();

    @Column(name = "issued_on", nullable = false) private LocalDate date;
    @Column(name = "due_on", nullable = false) private LocalDate dueDate;
}
