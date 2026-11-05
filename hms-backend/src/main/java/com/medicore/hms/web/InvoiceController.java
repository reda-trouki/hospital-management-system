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
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
public class InvoiceController {
    private final BillingService billing;

    @GetMapping
    public List<InvoiceResponse> list(@RequestParam(required = false) String patientId, @RequestParam(required = false) InvoiceStatus status) {
        return billing.list(patientId, status);
    }

    @GetMapping("/{id}")
    public InvoiceResponse get(@PathVariable String id) { return billing.get(id); }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public InvoiceResponse create(@Valid @RequestBody InvoiceCreate r) { return billing.create(r); }

    @PostMapping("/{id}/payments")
    public InvoiceResponse pay(@PathVariable String id, @Valid @RequestBody PaymentCreate r) { return billing.pay(id, r); }
}
