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
@Table(name = "staff")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Staff {
    @Id @Column(length = 32) private String id;
    @Column(nullable = false, length = 120) private String name;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 30) private StaffRole role;
    @Column(length = 80) private String department;
    @Column(length = 40) private String phone;
    /** Seven entries, Monday to Sunday. */
    @Convert(converter = ShiftListConverter.class)
    @Column(nullable = false, length = 100) private List<Shift> shifts;
}
