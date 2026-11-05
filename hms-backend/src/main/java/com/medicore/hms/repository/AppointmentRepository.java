package com.medicore.hms.repository;

import com.medicore.hms.domain.*;
import com.medicore.hms.domain.enums.*;
import org.springframework.data.jpa.repository.*;
import java.time.*;
import java.util.*;

public interface AppointmentRepository extends JpaRepository<Appointment, String>, JpaSpecificationExecutor<Appointment> {
    boolean existsByDoctorIdAndDateAndTimeAndStatus(String doctorId, LocalDate date, LocalTime time, AppointmentStatus status);
    boolean existsByDoctorIdAndDateAndTimeAndStatusAndIdNot(String doctorId, LocalDate date, LocalTime time, AppointmentStatus status, String id);
    List<Appointment> findByPatientIdOrderByDateDescTimeDesc(String patientId);
}
