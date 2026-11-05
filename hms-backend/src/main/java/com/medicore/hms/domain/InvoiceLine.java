package com.medicore.hms.domain;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Embeddable
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class InvoiceLine {
    /** JSON name is "desc" to match the React app. */
    @JsonProperty("desc")
    @NotBlank
    @Column(name = "description", nullable = false, length = 200)
    private String description;

    @Min(1)
    @Column(nullable = false)
    private int qty;

    @NotNull @DecimalMin("0")
    @Column(nullable = false)
    private BigDecimal price;
}
