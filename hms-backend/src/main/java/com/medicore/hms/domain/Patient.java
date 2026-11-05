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
@Table(name = "patients")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Patient {
    @Id @Column(length = 32) private String id;
    @Column(nullable = false, length = 120) private String name;
    @Column(nullable = false) private Integer age;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 10) private Gender gender;
    @Column(length = 40) private String phone;
    @Column(name = "blood_type", length = 4) private String bloodType;
    @Column(name = "medical_condition", nullable = false, length = 200) private String condition;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20) private PatientStatus status;
    @Column(name = "admitted_on") private LocalDate admittedOn;
    @Column(name = "bed_id", length = 32) private String bedId;
    @Column(length = 300) private String allergies;
    @Column(name = "emergency_contact", length = 200) private String emergencyContact;
    @Column(length = 100) private String insurer;
    @Column(name = "policy_no", length = 60) private String policyNo;
    @Column(nullable = false) private Integer coverage;
}
