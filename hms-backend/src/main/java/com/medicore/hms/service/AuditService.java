package com.medicore.hms.service;

import com.medicore.hms.common.Ids;
import com.medicore.hms.common.Specs;
import com.medicore.hms.domain.AuditEntry;
import com.medicore.hms.dto.Responses.PageResponse;
import com.medicore.hms.repository.AuditEntryRepository;
import com.medicore.hms.security.AuthUser;
import com.medicore.hms.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

/** Append-only activity log. Written in the caller's transaction, so a rolled-back change leaves no entry. */
@Service
@RequiredArgsConstructor
public class AuditService {
    private final AuditEntryRepository repository;

    @Transactional(propagation = Propagation.REQUIRED)
    public void log(String action) {
        AuthUser user = CurrentUser.optional().orElse(null);
        logAs(user == null ? "System" : user.name(), user == null ? "-" : user.role().toString(), action);
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public void logAs(String userName, String role, String action) {
        String text = action.length() > 500 ? action.substring(0, 497) + "..." : action;
        repository.save(AuditEntry.builder().id(Ids.next("LOG")).time(Instant.now()).user(userName).role(role).action(text).build());
    }

    @Transactional(readOnly = true)
    public PageResponse<AuditEntry> search(String q, int page, int size) {
        int safeSize = Math.min(Math.max(size, 1), 200);
        Page<AuditEntry> result = repository.findAll(
                Specs.<AuditEntry>like(q, "user", "role", "action"),
                PageRequest.of(Math.max(page, 0), safeSize, Sort.by(Sort.Direction.DESC, "time")));
        return new PageResponse<>(result.getContent(), result.getNumber(), result.getSize(), result.getTotalElements(), result.getTotalPages());
    }
}
