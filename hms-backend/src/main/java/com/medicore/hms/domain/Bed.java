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
@Table(name = "beds")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Bed {
    @Id @Column(length = 32) private String id;
    @Column(nullable = false, length = 40) private String ward;
    @Column(name = "bed_number", nullable = false) private Integer number;
    @Column(name = "patient_id", length = 32) private String patientId;
}
