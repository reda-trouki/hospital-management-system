package com.medicore.hms;

import com.medicore.hms.domain.Invoice;
import com.medicore.hms.domain.InvoiceLine;
import com.medicore.hms.domain.Payment;
import com.medicore.hms.domain.enums.InvoiceStatus;
import com.medicore.hms.domain.enums.PaymentMethod;
import com.medicore.hms.service.InvoiceMath;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class InvoiceMathTest {
    private static final LocalDate TODAY = LocalDate.of(2030, 1, 15);

    private static Invoice invoice(String discount, String tax, String insurance, LocalDate due, Payment... payments) {
        return Invoice.builder().id("INV-T").patientId("P-1")
                .items(new ArrayList<>(List.of(new InvoiceLine("A", 3, new BigDecimal("1800")), new InvoiceLine("B", 1, new BigDecimal("2800")))))
                .discount(new BigDecimal(discount)).tax(new BigDecimal(tax)).insurance(new BigDecimal(insurance))
                .payments(new ArrayList<>(List.of(payments))).date(TODAY).dueDate(due).build();
    }

    @Test
    void matchesTheReactCalculation() {
        // ICU example from the demo data: 8200 subtotal, 5% tax, 80% insurance
        var t = InvoiceMath.compute(invoice("0", "5", "80", TODAY.plusDays(10)), TODAY);
        assertEquals(new BigDecimal("8200.00"), t.subtotal());
        assertEquals(new BigDecimal("410.00"), t.tax());
        assertEquals(new BigDecimal("8610.00"), t.total());
        assertEquals(new BigDecimal("6888.00"), t.insurance());
        assertEquals(new BigDecimal("1722.00"), t.patientDue());
        assertEquals(InvoiceStatus.PENDING, t.status());
    }

    @Test
    void statusFollowsPaymentsAndDueDate() {
        Payment part = new Payment(TODAY, new BigDecimal("500"), PaymentMethod.CARD);
        assertEquals(InvoiceStatus.PARTIAL, InvoiceMath.compute(invoice("0", "5", "80", TODAY.plusDays(1), part), TODAY).status());
        assertEquals(InvoiceStatus.OVERDUE, InvoiceMath.compute(invoice("0", "5", "80", TODAY.minusDays(1), part), TODAY).status());
        Payment full = new Payment(TODAY, new BigDecimal("1722.00"), PaymentMethod.CASH);
        var paid = InvoiceMath.compute(invoice("0", "5", "80", TODAY.minusDays(30), full), TODAY);
        assertEquals(InvoiceStatus.PAID, paid.status());
        assertEquals(new BigDecimal("0.00"), paid.balance());
    }
}
