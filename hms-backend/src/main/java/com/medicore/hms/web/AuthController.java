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
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService auth;
    private final UserService users;

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody Login r) {
        return auth.login(r.email(), r.password());
    }

    @GetMapping("/me")
    public UserView me() {
        return users.me();
    }
}
