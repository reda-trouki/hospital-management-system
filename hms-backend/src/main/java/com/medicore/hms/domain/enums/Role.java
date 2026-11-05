package com.medicore.hms.domain.enums;

import com.medicore.hms.common.Labels;

public enum Role {
    ADMIN, DOCTOR, NURSE, RECEPTIONIST, PHARMACIST, LAB_TECH, PATIENT;

    @Override
    public String toString() {
        return Labels.of(this);
    }
}
