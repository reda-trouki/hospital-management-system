package com.medicore.hms.domain.enums;

import com.medicore.hms.common.Labels;

public enum AppointmentStatus {
    SCHEDULED, COMPLETED, CANCELLED;

    @Override
    public String toString() {
        return Labels.of(this);
    }
}
