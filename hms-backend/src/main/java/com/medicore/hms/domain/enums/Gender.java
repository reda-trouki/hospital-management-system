package com.medicore.hms.domain.enums;

import com.medicore.hms.common.Labels;

public enum Gender {
    MALE, FEMALE, OTHER;

    @Override
    public String toString() {
        return Labels.of(this);
    }
}
