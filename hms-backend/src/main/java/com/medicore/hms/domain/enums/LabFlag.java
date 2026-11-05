package com.medicore.hms.domain.enums;

import com.medicore.hms.common.Labels;

public enum LabFlag {
    NORMAL, ABNORMAL, CRITICAL;

    @Override
    public String toString() {
        return Labels.of(this);
    }
}
