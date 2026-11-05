package com.medicore.hms.domain.enums;

import com.medicore.hms.common.Labels;

public enum RxStatus {
    PENDING, DISPENSED;

    @Override
    public String toString() {
        return Labels.of(this);
    }
}
