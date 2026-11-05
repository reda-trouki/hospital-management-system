package com.medicore.hms.common;

public final class Enums {
    private Enums() {}

    /** Accepts either the constant name ("IN_PROGRESS") or its label ("In Progress"), case-insensitive. */
    public static <E extends Enum<E>> E parse(Class<E> type, String text) {
        if (text != null) {
            String t = text.trim();
            for (E constant : type.getEnumConstants()) {
                if (constant.name().equalsIgnoreCase(t) || constant.toString().equalsIgnoreCase(t)) {
                    return constant;
                }
            }
        }
        throw new BadRequestException("Invalid " + type.getSimpleName() + ": " + text);
    }
}
