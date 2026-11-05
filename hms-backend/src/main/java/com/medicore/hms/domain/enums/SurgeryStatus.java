package com.medicore.hms.domain.enums;

import com.medicore.hms.common.Labels;

public enum SurgeryStatus {
    SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED;

    @Override
    public String toString() {
        return Labels.of(this);
    }
}
