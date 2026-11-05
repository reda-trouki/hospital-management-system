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
@RequestMapping("/api/audit")
@RequiredArgsConstructor
public class AuditController {
    private final AuditService audit;

    @GetMapping
    public PageResponse<AuditEntry> search(@RequestParam(required = false) String q,
                                           @RequestParam(defaultValue = "0") int page,
                                           @RequestParam(defaultValue = "25") int size) {
        return audit.search(q, page, size);
    }
}
