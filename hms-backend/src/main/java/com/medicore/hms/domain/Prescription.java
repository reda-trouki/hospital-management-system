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
@Table(name = "prescriptions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Prescription {
    @Id @Column(length = 32) private String id;
    @Column(name = "patient_id", nullable = false, length = 32) private String patientId;
    @Column(name = "doctor_id", nullable = false, length = 32) private String doctorId;
    @Column(name = "item_id", nullable = false, length = 32) private String itemId;
    @Column(nullable = false, length = 200) private String dosage;
    @Column(name = "duration_text", length = 80) private String duration;
    @Column(nullable = false) private Integer qty;
    @Column(length = 300) private String instructions;
    @Column(name = "rx_date", nullable = false) private LocalDate date;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20) private RxStatus status;
}
