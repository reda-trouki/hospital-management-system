package com.medicore.hms.domain.enums;

import com.medicore.hms.common.Labels;

public enum LabPriority {
    ROUTINE, URGENT, STAT;

    @Override
    public String toString() {
        return this == STAT ? "STAT" : Labels.of(this);
    }
}
