package com.medicore.hms.domain.enums;

import com.medicore.hms.common.Labels;

public enum NoteType {
    PROGRESS, DIAGNOSIS, PROCEDURE, DISCHARGE;

    @Override
    public String toString() {
        return Labels.of(this);
    }
}
