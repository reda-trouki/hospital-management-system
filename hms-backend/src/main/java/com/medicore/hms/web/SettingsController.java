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
@RequestMapping("/api/settings")
@RequiredArgsConstructor
public class SettingsController {
    private final SettingsService settings;

    @GetMapping
    public HospitalSettings get() { return settings.get(); }

    /** Unauthenticated: the login page needs the hospital name. */
    @GetMapping("/public")
    public PublicSettings publicInfo() { return new PublicSettings(settings.get().getHospitalName()); }

    @PutMapping
    public HospitalSettings update(@Valid @RequestBody SettingsUpdate r) { return settings.update(r); }
}
