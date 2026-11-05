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
@RequestMapping("/api/prescriptions")
@RequiredArgsConstructor
public class PrescriptionController {
    private final PharmacyService pharmacy;

    @GetMapping
    public List<Prescription> list(@RequestParam(required = false) String patientId, @RequestParam(required = false) RxStatus status) {
        return pharmacy.prescriptions(patientId, status);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Prescription create(@Valid @RequestBody PrescriptionCreate r) { return pharmacy.prescribe(r); }

    @PostMapping("/{id}/dispense")
    public Prescription dispense(@PathVariable String id) { return pharmacy.dispense(id); }
}
