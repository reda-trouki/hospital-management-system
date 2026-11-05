package com.medicore.hms.security;

import com.medicore.hms.domain.enums.Role;

/** The authenticated principal placed in the SecurityContext. */
public record AuthUser(String id, String name, String email, Role role, String linkedId) {}
