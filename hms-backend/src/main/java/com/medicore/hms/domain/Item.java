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
@Table(name = "items")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Item {
    @Id @Column(length = 32) private String id;
    @Column(nullable = false, length = 160) private String name;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20) private ItemCategory category;
    @Column(nullable = false) private Integer stock;
    @Column(name = "reorder_level", nullable = false) private Integer reorder;
    @Column(length = 30) private String unit;
    @Column(nullable = false) private BigDecimal price;
    @Column(length = 80) private String location;
    @Column(name = "expiry_date") private LocalDate expiry;
    @Column(name = "next_maintenance") private LocalDate nextMaintenance;
}
