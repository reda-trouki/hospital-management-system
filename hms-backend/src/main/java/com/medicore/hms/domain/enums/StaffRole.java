package com.medicore.hms.domain.enums;

import com.medicore.hms.common.Labels;

public enum StaffRole {
    NURSE, LAB_TECHNICIAN, PHARMACIST, RECEPTIONIST, ADMINISTRATOR;

    @Override
    public String toString() {
        return Labels.of(this);
    }
}
