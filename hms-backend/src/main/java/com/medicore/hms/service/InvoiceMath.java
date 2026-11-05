package com.medicore.hms.service;

import com.medicore.hms.domain.Invoice;
import com.medicore.hms.domain.InvoiceLine;
import com.medicore.hms.domain.Payment;
import com.medicore.hms.domain.enums.InvoiceStatus;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;

/** Pure calculation, identical to src/lib/billing.ts in the React app. All amounts are rounded to cents. */
public final class InvoiceMath {
    private static final BigDecimal HUNDRED = new BigDecimal("100");

    private InvoiceMath() {}

    public record Totals(BigDecimal subtotal, BigDecimal discount, BigDecimal tax, BigDecimal total,
                         BigDecimal insurance, BigDecimal patientDue, BigDecimal paid, BigDecimal balance,
                         InvoiceStatus status) {}

    public static Totals compute(Invoice inv, LocalDate today) {
        BigDecimal subtotal = BigDecimal.ZERO;
        for (InvoiceLine line : inv.getItems()) {
            subtotal = subtotal.add(line.getPrice().multiply(BigDecimal.valueOf(line.getQty())));
        }
        subtotal = money(subtotal);
        BigDecimal discount = pct(subtotal, inv.getDiscount());
        BigDecimal tax = pct(subtotal.subtract(discount), inv.getTax());
        BigDecimal total = money(subtotal.subtract(discount).add(tax));
        BigDecimal insurance = pct(total, inv.getInsurance());
        BigDecimal patientDue = money(total.subtract(insurance));
        BigDecimal paid = BigDecimal.ZERO;
        for (Payment p : inv.getPayments()) paid = paid.add(p.getAmount());
        paid = money(paid);
        BigDecimal balance = money(patientDue.subtract(paid).max(BigDecimal.ZERO));

        InvoiceStatus status;
        if (balance.signum() <= 0) status = InvoiceStatus.PAID;
        else if (inv.getDueDate().isBefore(today)) status = InvoiceStatus.OVERDUE;
        else if (paid.signum() > 0) status = InvoiceStatus.PARTIAL;
        else status = InvoiceStatus.PENDING;
        return new Totals(subtotal, discount, tax, total, insurance, patientDue, paid, balance, status);
    }

    private static BigDecimal pct(BigDecimal base, BigDecimal percent) {
        return base.multiply(percent).divide(HUNDRED, 2, RoundingMode.HALF_UP);
    }

    private static BigDecimal money(BigDecimal v) {
        return v.setScale(2, RoundingMode.HALF_UP);
    }
}
