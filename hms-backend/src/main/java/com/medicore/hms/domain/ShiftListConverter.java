package com.medicore.hms.domain;

import com.medicore.hms.domain.enums.Shift;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/** Stores a week of shifts as "MORNING,OFF,NIGHT,...". */
@Converter
public class ShiftListConverter implements AttributeConverter<List<Shift>, String> {
    @Override
    public String convertToDatabaseColumn(List<Shift> attribute) {
        if (attribute == null) return "";
        return attribute.stream().map(Shift::name).collect(Collectors.joining(","));
    }

    @Override
    public List<Shift> convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isBlank()) return new ArrayList<>();
        return Arrays.stream(dbData.split(",")).map(String::trim).map(Shift::valueOf).collect(Collectors.toCollection(ArrayList::new));
    }
}
