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
@Table(name = "vitals")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Vital {
    @Id @Column(length = 32) private String id;
    @Column(name = "patient_id", nullable = false, length = 32) private String patientId;
    @Column(name = "recorded_at", nullable = false) private Instant date;
    @Column(nullable = false, length = 12) private String bp;
    @Column(nullable = false) private Integer hr;
    @Column(nullable = false) private Double temp;
    @Column(nullable = false) private Integer spo2;
    private Double weight;
    @Column(name = "recorded_by", nullable = false, length = 120) private String by;
}
