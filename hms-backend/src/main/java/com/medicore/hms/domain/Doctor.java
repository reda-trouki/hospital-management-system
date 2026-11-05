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
@Table(name = "doctors")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Doctor {
    @Id @Column(length = 32) private String id;
    @Column(nullable = false, length = 120) private String name;
    @Column(nullable = false, length = 80) private String specialty;
    @Column(length = 40) private String phone;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20) private DoctorStatus status;
    @Column(name = "patient_count", nullable = false) private Integer patients;
}
