package com.medicore.hms.domain.enums;

import com.medicore.hms.common.Labels;

public enum Shift {
    MORNING, EVENING, NIGHT, OFF;

    @Override
    public String toString() {
        return Labels.of(this);
    }
}
