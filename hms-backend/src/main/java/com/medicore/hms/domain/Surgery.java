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
@Table(name = "surgeries")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Surgery {
    @Id @Column(length = 32) private String id;
    @Column(name = "patient_id", nullable = false, length = 32) private String patientId;
    @Column(name = "surgeon_id", nullable = false, length = 32) private String surgeonId;
    @Column(name = "procedure_name", nullable = false, length = 200) private String procedure;
    @Column(nullable = false, length = 20) private String room;
    @Column(name = "surgery_date", nullable = false) private LocalDate date;
    @JsonFormat(pattern = "HH:mm")
    @Column(name = "start_time", nullable = false) private LocalTime time;
    @Column(name = "duration_min", nullable = false) private Integer duration;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20) private SurgeryStatus status;
}
