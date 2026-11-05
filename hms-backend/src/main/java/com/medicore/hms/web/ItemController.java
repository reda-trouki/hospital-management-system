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
@RequestMapping("/api/items")
@RequiredArgsConstructor
public class ItemController {
    private final PharmacyService pharmacy;

    @GetMapping
    public List<Item> list(@RequestParam(required = false) ItemCategory category) { return pharmacy.items(category); }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Item create(@Valid @RequestBody ItemCreate r) { return pharmacy.createItem(r); }

    @PostMapping("/{id}/restock")
    public Item restock(@PathVariable String id, @Valid @RequestBody Restock r) { return pharmacy.restock(id, r.quantity()); }

    /** Equipment maintenance done: next service is scheduled 180 days out. */
    @PostMapping("/{id}/service")
    public Item service(@PathVariable String id) { return pharmacy.markServiced(id); }
}
