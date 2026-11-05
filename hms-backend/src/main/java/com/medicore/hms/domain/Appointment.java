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
@Table(name = "appointments")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Appointment {
    @Id @Column(length = 32) private String id;
    @Column(name = "patient_id", nullable = false, length = 32) private String patientId;
    @Column(name = "doctor_id", nullable = false, length = 32) private String doctorId;
    @Column(name = "appt_date", nullable = false) private LocalDate date;
    @JsonFormat(pattern = "HH:mm")
    @Column(name = "appt_time", nullable = false) private LocalTime time;
    @Column(nullable = false, length = 200) private String reason;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20) private AppointmentStatus status;
}
