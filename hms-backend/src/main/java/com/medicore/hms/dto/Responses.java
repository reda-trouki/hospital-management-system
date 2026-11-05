package com.medicore.hms.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.medicore.hms.domain.*;
import com.medicore.hms.domain.enums.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public final class Responses {
    private Responses() {}

    public record UserView(String id, String name, String email, Role role, String linkedId) {
        public static UserView of(User u) {
            return new UserView(u.getId(), u.getName(), u.getEmail(), u.getRole(), u.getLinkedId());
        }
    }

    public record AuthResponse(String token, Instant expiresAt, UserView user) {}

    public record PublicSettings(String hospitalName) {}

    public record PageResponse<T>(List<T> content, int page, int size, long totalElements, int totalPages) {}

    public record Message(String message) {}

    /** Invoice plus the amounts the UI would otherwise have to calculate. */
    public record InvoiceResponse(
            String id, String patientId, List<InvoiceLine> items,
            BigDecimal discount, BigDecimal tax, BigDecimal insurance,
            List<Payment> payments, LocalDate date, LocalDate dueDate,
            BigDecimal subtotal, BigDecimal discountAmount, BigDecimal taxAmount, BigDecimal total,
            BigDecimal insuranceAmount, BigDecimal patientDue, BigDecimal paid, BigDecimal balance,
            InvoiceStatus status) {}

    public record WardOccupancy(String ward, long occupied, long free) {}

    public record DashboardResponse(
            long admittedPatients, long totalPatients, long todaysAppointments,
            long bedsTotal, long bedsOccupied, int occupancyPercent,
            /** Only filled in for roles that may see billing (Admin, Receptionist). */
            BigDecimal outstandingBilling, long unpaidInvoices,
            long erWaiting, long erInTreatment, long pendingLabs, long lowStockItems, long surgeriesToday,
            List<WardOccupancy> wards, List<Appointment> todaysSchedule) {}

    public record Notice(String id, String text, String to, String feature, String level) {}

    public record NameCount(String name, long value) {}
    public record MonthRevenue(String month, BigDecimal revenue) {}
    public record ReportResponse(
            long patients, long appointments, int appointmentCompletionRate,
            BigDecimal totalBilled, BigDecimal collected, long erCases, long surgeries, long labOrders,
            List<MonthRevenue> revenueByMonth, List<NameCount> patientsByStatus,
            List<NameCount> appointmentsByDoctor, List<NameCount> labsByStatus) {}

    // ---- patient portal (names are resolved server-side because patients cannot read /api/doctors or /api/items) ----
    public record PortalDoctor(String id, String name, String specialty) {}
    public record PortalAppointment(String id, LocalDate date, @JsonFormat(pattern = "HH:mm") LocalTime time,
                                    String doctorName, String reason, AppointmentStatus status) {}
    public record PortalPrescription(String id, LocalDate date, String medicine, String dosage, String duration,
                                     String instructions, RxStatus status) {}
    public record PortalLab(String id, Instant date, String test, String result, LabFlag flag) {}
    public record PortalResponse(Patient patient, List<PortalAppointment> appointments, List<PortalPrescription> prescriptions,
                                 List<PortalLab> labs, List<InvoiceResponse> invoices, BigDecimal balanceDue) {}
}
