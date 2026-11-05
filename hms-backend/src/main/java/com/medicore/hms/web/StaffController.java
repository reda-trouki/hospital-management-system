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
@RequestMapping("/api/staff")
@RequiredArgsConstructor
public class StaffController {
    private final StaffService staff;

    @GetMapping
    public List<Staff> list() { return staff.list(); }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Staff create(@Valid @RequestBody StaffCreate r) { return staff.create(r); }

    @PutMapping("/{id}/shifts")
    public Staff setShifts(@PathVariable String id, @Valid @RequestBody ShiftsUpdate r) { return staff.setShifts(id, r.shifts()); }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id) { staff.delete(id); }
}
