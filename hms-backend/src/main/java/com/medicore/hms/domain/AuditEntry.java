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
@Table(name = "audit_log")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AuditEntry {
    @Id @Column(length = 32) private String id;
    @Column(name = "created_at", nullable = false) private Instant time;
    @Column(name = "user_name", nullable = false, length = 120) private String user;
    @Column(name = "user_role", nullable = false, length = 20) private String role;
    @Column(nullable = false, length = 500) private String action;
}
