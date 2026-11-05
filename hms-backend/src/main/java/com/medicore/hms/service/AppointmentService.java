package com.medicore.hms.service;

import com.medicore.hms.common.ConflictException;
import com.medicore.hms.common.Ids;
import com.medicore.hms.common.NotFoundException;
import com.medicore.hms.common.Specs;
import com.medicore.hms.domain.Appointment;
import com.medicore.hms.domain.Doctor;
import com.medicore.hms.domain.Patient;
import com.medicore.hms.domain.enums.AppointmentStatus;
import com.medicore.hms.domain.enums.DoctorStatus;
import com.medicore.hms.repository.AppointmentRepository;
import com.medicore.hms.repository.DoctorRepository;
import com.medicore.hms.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AppointmentService {
    private final AppointmentRepository appointments;
    private final PatientRepository patients;
    private final DoctorRepository doctors;
    private final AuditService audit;

    @Transactional(readOnly = true)
    public List<Appointment> list(String patientId, String doctorId, AppointmentStatus status, LocalDate date) {
        Specification<Appointment> spec = Specs.<Appointment>eq("patientId", patientId)
                .and(Specs.eq("doctorId", doctorId)).and(Specs.eq("status", status)).and(Specs.eq("date", date));
        return appointments.findAll(spec, Sort.by("date", "time"));
    }

    public Appointment create(String patientId, String doctorId, LocalDate date, LocalTime time, String reason) {
        Patient patient = patients.findById(patientId).orElseThrow(() -> new NotFoundException("Patient " + patientId + " not found"));
        Doctor doctor = doctors.findById(doctorId).orElseThrow(() -> new NotFoundException("Doctor " + doctorId + " not found"));
        if (doctor.getStatus() == DoctorStatus.ON_LEAVE) throw new ConflictException(doctor.getName() + " is on leave");
        if (appointments.existsByDoctorIdAndDateAndTimeAndStatus(doctorId, date, time, AppointmentStatus.SCHEDULED)) {
            throw new ConflictException(doctor.getName() + " already has an appointment at " + date + " " + time);
        }
        Appointment a = appointments.save(Appointment.builder().id(Ids.next("A")).patientId(patientId).doctorId(doctorId)
                .date(date).time(time).reason(reason.trim()).status(AppointmentStatus.SCHEDULED).build());
        audit.log("Scheduled appointment for " + patient.getName() + " on " + date + " " + time);
        return a;
    }

    public Appointment setStatus(String id, AppointmentStatus status) {
        Appointment a = get(id);
        if (a.getStatus() != AppointmentStatus.SCHEDULED) throw new ConflictException("Only scheduled appointments can be changed");
        if (status == AppointmentStatus.SCHEDULED) throw new ConflictException("Use reschedule to move an appointment");
        a.setStatus(status);
        audit.log(status + " appointment " + id);
        return a;
    }

    public Appointment reschedule(String id, LocalDate date, LocalTime time) {
        Appointment a = get(id);
        if (a.getStatus() != AppointmentStatus.SCHEDULED) throw new ConflictException("Only scheduled appointments can be rescheduled");
        if (appointments.existsByDoctorIdAndDateAndTimeAndStatusAndIdNot(a.getDoctorId(), date, time, AppointmentStatus.SCHEDULED, id)) {
            throw new ConflictException("The doctor already has an appointment at " + date + " " + time);
        }
        a.setDate(date);
        a.setTime(time);
        audit.log("Rescheduled appointment " + id + " to " + date + " " + time);
        return a;
    }

    /** Simulated reminder: records the action; plug a real SMS/e-mail gateway in here. */
    public String remind(String id) {
        Appointment a = get(id);
        Patient p = patients.findById(a.getPatientId()).orElseThrow(() -> new NotFoundException("Patient not found"));
        String msg = "Reminder sent to " + p.getName() + " (" + p.getPhone() + ") for " + a.getDate() + " at " + a.getTime();
        audit.log(msg);
        return msg;
    }

    @Transactional(readOnly = true)
    public Appointment get(String id) {
        return appointments.findById(id).orElseThrow(() -> new NotFoundException("Appointment " + id + " not found"));
    }
}
