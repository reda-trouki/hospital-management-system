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
@RequestMapping("/api/labs")
@RequiredArgsConstructor
public class LabController {
    private final LabService labs;

    @GetMapping
    public List<LabOrder> list(@RequestParam(required = false) String patientId, @RequestParam(required = false) LabStatus status) {
        return labs.list(patientId, status);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public LabOrder order(@Valid @RequestBody LabCreate r) { return labs.order(r); }

    @PatchMapping("/{id}/start")
    public LabOrder start(@PathVariable String id) { return labs.start(id); }

    @PatchMapping("/{id}/result")
    public LabOrder result(@PathVariable String id, @Valid @RequestBody LabResultUpdate r) { return labs.enterResult(id, r); }
}
