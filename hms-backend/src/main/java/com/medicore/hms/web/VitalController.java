package com.medicore.hms.web;

import com.medicore.hms.domain.*;
import com.medicore.hms.domain.enums.*;
import com.medicore.hms.dto.Requests.*;
import com.medicore.hms.dto.Responses.*;
import com.medicore.hms.service.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/vitals")
@RequiredArgsConstructor
public class VitalController {
    private final RecordService records;

    @GetMapping
    public List<Vital> list(@RequestParam(required = false) String patientId) { return records.vitals(patientId); }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Vital create(@Valid @RequestBody VitalCreate r) { return records.addVital(r); }
}
