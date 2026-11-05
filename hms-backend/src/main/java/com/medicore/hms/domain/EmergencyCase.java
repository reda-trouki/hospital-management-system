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
@Table(name = "emergency_cases")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EmergencyCase {
    @Id @Column(length = 32) private String id;
    @Column(nullable = false, length = 120) private String name;
    @Column(nullable = false) private Integer age;
    @Column(nullable = false, length = 300) private String complaint;
    @Column(nullable = false) private Integer triage;
    @Column(name = "arrival_time", nullable = false) private Instant arrival;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20) private ErStatus status;
}
