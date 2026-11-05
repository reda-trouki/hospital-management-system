package com.medicore.hms.common;

import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

/** Tiny helpers for optional filters. A null value means "no restriction". */
public final class Specs {
    private Specs() {}

    public static <T> Specification<T> eq(String field, Object value) {
        return (root, query, cb) -> value == null ? null : cb.equal(root.get(field), value);
    }

    /** Case-insensitive "contains" across several string fields. */
    public static <T> Specification<T> like(String text, String... fields) {
        return (root, query, cb) -> {
            if (text == null || text.isBlank()) return null;
            String pattern = "%" + text.trim().toLowerCase() + "%";
            List<Predicate> any = new ArrayList<>();
            for (String f : fields) {
                any.add(cb.like(cb.lower(root.<String>get(f)), pattern));
            }
            return cb.or(any.toArray(new Predicate[0]));
        };
    }
}
