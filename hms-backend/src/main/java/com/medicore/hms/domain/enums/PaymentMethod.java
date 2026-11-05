package com.medicore.hms.domain.enums;

import com.medicore.hms.common.Labels;

public enum PaymentMethod {
    CASH, CARD, TRANSFER;

    @Override
    public String toString() {
        return Labels.of(this);
    }
}
