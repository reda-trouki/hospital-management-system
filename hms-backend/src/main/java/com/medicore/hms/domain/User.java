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
@Table(name = "users")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class User {
    @Id @Column(length = 32) private String id;
    @Column(nullable = false, length = 120) private String name;
    @Column(nullable = false, unique = true, length = 160) private String email;
    /** BCrypt hash – never serialised. */
    @com.fasterxml.jackson.annotation.JsonProperty(access = com.fasterxml.jackson.annotation.JsonProperty.Access.WRITE_ONLY)
    @Column(nullable = false, length = 100) private String password;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20) private Role role;
    /** Doctor id for doctors, patient id for patient accounts. */
    @Column(name = "linked_id", length = 32) private String linkedId;
}
