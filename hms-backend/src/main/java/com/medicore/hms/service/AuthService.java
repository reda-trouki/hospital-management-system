package com.medicore.hms.service;

import com.medicore.hms.domain.User;
import com.medicore.hms.dto.Responses.AuthResponse;
import com.medicore.hms.dto.Responses.UserView;
import com.medicore.hms.repository.UserRepository;
import com.medicore.hms.security.JwtService;
import com.medicore.hms.security.LoginAttemptService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final JwtService jwt;
    private final LoginAttemptService attempts;
    private final AuditService audit;

    @Transactional
    public AuthResponse login(String email, String password) {
        String key = email.trim().toLowerCase();
        attempts.check(key);
        User user = users.findByEmailIgnoreCase(key).orElse(null);
        // Same error for unknown email and wrong password, so accounts cannot be enumerated.
        if (user == null || !encoder.matches(password, user.getPassword())) {
            attempts.failed(key);
            throw new BadCredentialsException("Invalid email or password");
        }
        attempts.succeeded(key);
        audit.logAs(user.getName(), user.getRole().toString(), "Signed in");
        Instant now = Instant.now();
        return new AuthResponse(jwt.issue(user, now), jwt.expiryFrom(now), UserView.of(user));
    }
}
