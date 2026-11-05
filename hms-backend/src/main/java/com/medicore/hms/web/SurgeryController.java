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
@RequestMapping("/api/surgeries")
@RequiredArgsConstructor
public class SurgeryController {
    private final SurgeryService surgeries;

    @GetMapping
    public List<Surgery> list(@RequestParam(required = false) SurgeryStatus status) { return surgeries.list(status); }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Surgery schedule(@Valid @RequestBody SurgeryCreate r) { return surgeries.schedule(r); }

    @PatchMapping("/{id}/status")
    public Surgery setStatus(@PathVariable String id, @Valid @RequestBody SurgeryStatusUpdate r) { return surgeries.setStatus(id, r.status()); }
}
