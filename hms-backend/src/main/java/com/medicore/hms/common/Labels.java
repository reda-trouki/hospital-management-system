package com.medicore.hms.common;

/** Turns IN_SURGERY into "In Surgery" – the labels the React app uses. */
public final class Labels {
    private Labels() {}

    public static String of(Enum<?> value) {
        StringBuilder sb = new StringBuilder();
        for (String part : value.name().split("_")) {
            if (sb.length() > 0) sb.append(' ');
            sb.append(part.charAt(0)).append(part.substring(1).toLowerCase());
        }
        return sb.toString();
    }
}
