package com.medicore.hms.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.medicore.hms.domain.InvoiceLine;
import com.medicore.hms.domain.enums.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

/** Request bodies. Server-controlled fields (ids, statuses, timestamps) are deliberately absent. */
public final class Requests {
    private Requests() {}

    public record Login(@NotBlank @Email String email, @NotBlank String password) {}

    public record PatientCreate(
            @NotBlank @Size(max = 120) String name,
            @NotNull @Min(0) @Max(130) Integer age,
            @NotNull Gender gender,
            @Size(max = 40) String phone,
            @Size(max = 4) String bloodType,
            @NotBlank @Size(max = 200) String condition,
            @Size(max = 300) String allergies,
            @Size(max = 200) String emergencyContact,
            @Size(max = 100) String insurer,
            @Size(max = 60) String policyNo,
            @Min(0) @Max(100) Integer coverage,
            String bedId) {}

    /** Null fields are left unchanged. */
    public record PatientUpdate(
            @Size(max = 120) String name,
            @Min(0) @Max(130) Integer age,
            Gender gender,
            @Size(max = 40) String phone,
            @Size(max = 4) String bloodType,
            @Size(max = 200) String condition,
            @Size(max = 300) String allergies,
            @Size(max = 200) String emergencyContact,
            @Size(max = 100) String insurer,
            @Size(max = 60) String policyNo,
            @Min(0) @Max(100) Integer coverage) {}

    public record DoctorCreate(@NotBlank @Size(max = 120) String name, @NotBlank @Size(max = 80) String specialty, @Size(max = 40) String phone) {}
    public record DoctorStatusUpdate(@NotNull DoctorStatus status) {}

    public record AppointmentCreate(
            @NotBlank String patientId,
            @NotBlank String doctorId,
            @NotNull LocalDate date,
            @NotNull @JsonFormat(pattern = "HH:mm") LocalTime time,
            @NotBlank @Size(max = 200) String reason) {}
    public record AppointmentStatusUpdate(@NotNull AppointmentStatus status) {}
    public record Reschedule(@NotNull LocalDate date, @NotNull @JsonFormat(pattern = "HH:mm") LocalTime time) {}

    public record AssignBed(@NotBlank String patientId) {}

    public record VitalCreate(
            @NotBlank @Size(max = 12) String bp,
            @NotNull @Min(20) @Max(300) Integer hr,
            @NotNull @DecimalMin("25.0") @DecimalMax("45.0") Double temp,
            @NotNull @Min(0) @Max(100) Integer spo2,
            @DecimalMin("0.0") Double weight,
            @NotBlank String patientId) {}

    public record NoteCreate(@NotBlank String patientId, @NotNull NoteType type, @NotBlank @Size(max = 4000) String text) {}

    public record ItemCreate(
            @NotBlank @Size(max = 160) String name,
            @NotNull ItemCategory category,
            @NotNull @Min(0) Integer stock,
            @Min(0) Integer reorder,
            @Size(max = 30) String unit,
            @DecimalMin("0") BigDecimal price,
            @Size(max = 80) String location,
            LocalDate expiry,
            LocalDate nextMaintenance) {}
    public record Restock(@NotNull @Min(1) Integer quantity) {}

    public record PrescriptionCreate(
            @NotBlank String patientId,
            String doctorId,
            @NotBlank String itemId,
            @NotBlank @Size(max = 200) String dosage,
            @Size(max = 80) String duration,
            @NotNull @Min(1) Integer qty,
            @Size(max = 300) String instructions,
            boolean allergyOverride) {}

    public record LabCreate(@NotBlank String patientId, String doctorId, @NotBlank @Size(max = 120) String test, @NotNull LabPriority priority) {}
    public record LabResultUpdate(@NotBlank @Size(max = 2000) String result, @NotNull LabFlag flag) {}

    public record EmergencyCreate(
            @NotBlank @Size(max = 120) String name,
            @NotNull @Min(0) @Max(130) Integer age,
            @NotBlank @Size(max = 300) String complaint,
            @NotNull @Min(1) @Max(5) Integer triage) {}
    public record ErStatusUpdate(@NotNull ErStatus status) {}

    public record SurgeryCreate(
            @NotBlank String patientId,
            @NotBlank String surgeonId,
            @NotBlank @Size(max = 200) String procedure,
            @NotBlank @Size(max = 20) String room,
            @NotNull LocalDate date,
            @NotNull @JsonFormat(pattern = "HH:mm") LocalTime time,
            @NotNull @Min(15) @Max(1440) Integer duration) {}
    public record SurgeryStatusUpdate(@NotNull SurgeryStatus status) {}

    public record StaffCreate(@NotBlank @Size(max = 120) String name, @NotNull StaffRole role, @Size(max = 80) String department, @Size(max = 40) String phone) {}
    public record ShiftsUpdate(@NotNull @Size(min = 7, max = 7) List<@NotNull Shift> shifts) {}

    public record InvoiceCreate(
            @NotBlank String patientId,
            @NotEmpty @Valid List<InvoiceLine> items,
            @DecimalMin("0") @DecimalMax("100") BigDecimal discount,
            @DecimalMin("0") @DecimalMax("100") BigDecimal tax,
            @DecimalMin("0") @DecimalMax("100") BigDecimal insurance,
            @Min(0) @Max(365) Integer dueDays) {}
    public record PaymentCreate(@NotNull @DecimalMin("0.01") BigDecimal amount, @NotNull PaymentMethod method) {}

    public record UserCreate(
            @NotBlank @Size(max = 120) String name,
            @NotBlank @Email @Size(max = 160) String email,
            @NotBlank @Size(min = 6, max = 72) String password,
            @NotNull Role role,
            String linkedId) {}

    public record SettingsUpdate(@NotBlank @Size(max = 120) String hospitalName, @NotNull @DecimalMin("0") @DecimalMax("100") BigDecimal taxRate) {}

    public record PortalBook(
            @NotBlank String doctorId,
            @NotNull LocalDate date,
            @NotNull @JsonFormat(pattern = "HH:mm") LocalTime time,
            @NotBlank @Size(max = 200) String reason) {}
}
