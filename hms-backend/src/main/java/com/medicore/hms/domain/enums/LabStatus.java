package com.medicore.hms.domain.enums;

import com.medicore.hms.common.Labels;

public enum LabStatus {
    ORDERED, IN_PROGRESS, COMPLETED;

    @Override
    public String toString() {
        return Labels.of(this);
    }
}
