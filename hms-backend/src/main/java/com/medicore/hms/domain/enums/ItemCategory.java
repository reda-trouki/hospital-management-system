package com.medicore.hms.domain.enums;

import com.medicore.hms.common.Labels;

public enum ItemCategory {
    MEDICINE, SUPPLY, EQUIPMENT;

    @Override
    public String toString() {
        return Labels.of(this);
    }
}
