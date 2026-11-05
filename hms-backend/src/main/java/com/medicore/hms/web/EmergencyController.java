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
@RequestMapping("/api/emergency")
@RequiredArgsConstructor
public class EmergencyController {
    private final EmergencyService emergency;

    @GetMapping
    public List<EmergencyCase> list(@RequestParam(required = false) ErStatus status) { return emergency.list(status); }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public EmergencyCase register(@Valid @RequestBody EmergencyCreate r) { return emergency.register(r); }

    @PatchMapping("/{id}/status")
    public EmergencyCase setStatus(@PathVariable String id, @Valid @RequestBody ErStatusUpdate r) { return emergency.setStatus(id, r.status()); }
}
