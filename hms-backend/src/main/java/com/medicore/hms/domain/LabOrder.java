package com.medicore.hms.domain;

import jakarta.persistence.*;
import lombok.*;
import com.medicore.hms.domain.enums.*;
import java.math.BigDecimal;
import java.time.*;
import java.util.*;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;

@Entity
@Table(name = "lab_orders")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LabOrder {
    @Id @Column(length = 32) private String id;
    @Column(name = "patient_id", nullable = false, length = 32) private String patientId;
    @Column(name = "doctor_id", nullable = false, length = 32) private String doctorId;
    @Column(nullable = false, length = 120) private String test;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 10) private LabPriority priority;
    @Column(name = "ordered_at", nullable = false) private Instant date;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20) private LabStatus status;
    @Column(length = 2000) private String result;
    @Enumerated(EnumType.STRING) @Column(length = 10) private LabFlag flag;
}
