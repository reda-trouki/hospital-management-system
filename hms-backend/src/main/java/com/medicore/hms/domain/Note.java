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
@Table(name = "notes")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Note {
    @Id @Column(length = 32) private String id;
    @Column(name = "patient_id", nullable = false, length = 32) private String patientId;
    @Column(name = "created_at", nullable = false) private Instant date;
    @Column(nullable = false, length = 120) private String author;
    @Enumerated(EnumType.STRING) @Column(name = "note_type", nullable = false, length = 20) private NoteType type;
    @Column(name = "note_text", nullable = false, length = 4000) private String text;
}
