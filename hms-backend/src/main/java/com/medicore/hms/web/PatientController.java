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
@RequestMapping("/api/patients")
@RequiredArgsConstructor
public class PatientController {
    private final PatientService patients;

    @GetMapping
    public List<Patient> list(@RequestParam(required = false) String q, @RequestParam(required = false) PatientStatus status) {
        return patients.list(q, status);
    }

    @GetMapping("/{id}")
    public Patient get(@PathVariable String id) { return patients.get(id); }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Patient create(@Valid @RequestBody PatientCreate r) { return patients.create(r); }

    @PutMapping("/{id}")
    public Patient update(@PathVariable String id, @Valid @RequestBody PatientUpdate r) { return patients.update(id, r); }

    @PostMapping("/{id}/discharge")
    public Patient discharge(@PathVariable String id) { return patients.discharge(id); }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id) { patients.delete(id); }
}
