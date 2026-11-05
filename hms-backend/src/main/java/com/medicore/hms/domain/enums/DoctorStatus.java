package com.medicore.hms.domain.enums;

import com.medicore.hms.common.Labels;

public enum DoctorStatus {
    AVAILABLE, IN_SURGERY, ON_LEAVE;

    @Override
    public String toString() {
        return Labels.of(this);
    }
}
