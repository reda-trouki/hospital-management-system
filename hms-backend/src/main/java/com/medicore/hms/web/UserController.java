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
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService users;

    @GetMapping
    public List<UserView> list() { return users.list(); }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UserView create(@Valid @RequestBody UserCreate r) { return users.create(r); }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id) { users.delete(id); }
}
