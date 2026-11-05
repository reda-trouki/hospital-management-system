package com.medicore.hms.security;

import com.medicore.hms.common.TooManyRequestsException;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

/** Simple in-memory brute-force guard: 5 failed sign-ins per email in 15 minutes locks that email out. */
@Component
public class LoginAttemptService {
    private static final int MAX_FAILURES = 5;
    private static final Duration WINDOW = Duration.ofMinutes(15);

    private record State(int failures, Instant first) {}

    private final ConcurrentMap<String, State> attempts = new ConcurrentHashMap<>();

    public void check(String email) {
        State s = attempts.get(email);
        if (s == null) return;
        if (s.first().plus(WINDOW).isBefore(Instant.now())) {
            attempts.remove(email);
        } else if (s.failures() >= MAX_FAILURES) {
            throw new TooManyRequestsException("Too many failed sign-in attempts. Try again in a few minutes.");
        }
    }

    public void failed(String email) {
        attempts.merge(email, new State(1, Instant.now()),
                (old, fresh) -> old.first().plus(WINDOW).isBefore(Instant.now()) ? fresh : new State(old.failures() + 1, old.first()));
    }

    public void succeeded(String email) {
        attempts.remove(email);
    }
}
