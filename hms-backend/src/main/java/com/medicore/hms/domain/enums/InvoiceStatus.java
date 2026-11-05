package com.medicore.hms.domain.enums;

import com.medicore.hms.common.Labels;

public enum InvoiceStatus {
    PENDING, PARTIAL, OVERDUE, PAID;

    @Override
    public String toString() {
        return Labels.of(this);
    }
}
