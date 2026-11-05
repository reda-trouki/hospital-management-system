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
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {
    private final AppointmentService appointments;

    @GetMapping
    public List<Appointment> list(@RequestParam(required = false) String patientId,
                                  @RequestParam(required = false) String doctorId,
                                  @RequestParam(required = false) AppointmentStatus status,
                                  @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return appointments.list(patientId, doctorId, status, date);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Appointment create(@Valid @RequestBody AppointmentCreate r) {
        return appointments.create(r.patientId(), r.doctorId(), r.date(), r.time(), r.reason());
    }

    @PatchMapping("/{id}/status")
    public Appointment setStatus(@PathVariable String id, @Valid @RequestBody AppointmentStatusUpdate r) { return appointments.setStatus(id, r.status()); }

    @PatchMapping("/{id}/reschedule")
    public Appointment reschedule(@PathVariable String id, @Valid @RequestBody Reschedule r) { return appointments.reschedule(id, r.date(), r.time()); }

    @PostMapping("/{id}/remind")
    public Message remind(@PathVariable String id) { return new Message(appointments.remind(id)); }
}
