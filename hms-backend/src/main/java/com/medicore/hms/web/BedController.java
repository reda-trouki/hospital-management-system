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
@RequestMapping("/api/beds")
@RequiredArgsConstructor
public class BedController {
    private final BedService beds;

    @GetMapping
    public List<Bed> list() { return beds.list(); }

    @PostMapping("/{id}/assign")
    public Bed assign(@PathVariable String id, @Valid @RequestBody AssignBed r) { return beds.assign(id, r.patientId()); }

    @PostMapping("/{id}/free")
    public Bed free(@PathVariable String id) { return beds.free(id); }
}
