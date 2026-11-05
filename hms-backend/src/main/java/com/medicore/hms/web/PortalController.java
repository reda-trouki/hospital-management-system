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
@RequestMapping("/api/portal")
@RequiredArgsConstructor
public class PortalController {
    private final PortalService portal;

    @GetMapping("/me")
    public PortalResponse me() { return portal.me(); }

    @GetMapping("/doctors")
    public List<PortalDoctor> doctors() { return portal.doctors(); }

    @PostMapping("/appointments")
    @ResponseStatus(HttpStatus.CREATED)
    public Appointment book(@Valid @RequestBody PortalBook r) { return portal.book(r); }

    @PostMapping("/appointments/{id}/cancel")
    public Appointment cancel(@PathVariable String id) { return portal.cancel(id); }

    @PostMapping("/invoices/{id}/payments")
    public InvoiceResponse pay(@PathVariable String id, @Valid @RequestBody PaymentCreate r) { return portal.pay(id, r); }
}
