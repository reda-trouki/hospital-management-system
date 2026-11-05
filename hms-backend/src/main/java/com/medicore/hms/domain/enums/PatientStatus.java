package com.medicore.hms.domain.enums;

import com.medicore.hms.common.Labels;

public enum PatientStatus {
    ADMITTED, OUTPATIENT, DISCHARGED;

    @Override
    public String toString() {
        return Labels.of(this);
    }
}
