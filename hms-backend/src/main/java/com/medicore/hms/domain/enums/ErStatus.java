package com.medicore.hms.domain.enums;

import com.medicore.hms.common.Labels;

public enum ErStatus {
    WAITING, IN_TREATMENT, ADMITTED, DISCHARGED;

    @Override
    public String toString() {
        return Labels.of(this);
    }
}
