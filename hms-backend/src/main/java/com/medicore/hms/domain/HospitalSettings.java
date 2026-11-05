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
@Table(name = "app_settings")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class HospitalSettings {
    @Id private Long id;
    @Column(name = "hospital_name", nullable = false, length = 120) private String hospitalName;
    @Column(name = "tax_rate", nullable = false) private BigDecimal taxRate;
}
