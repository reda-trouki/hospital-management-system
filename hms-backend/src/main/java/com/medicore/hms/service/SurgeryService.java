package com.medicore.hms.service;

import com.medicore.hms.common.ConflictException;
import com.medicore.hms.common.Ids;
import com.medicore.hms.common.NotFoundException;
import com.medicore.hms.domain.Doctor;
import com.medicore.hms.domain.Patient;
import com.medicore.hms.domain.Surgery;
import com.medicore.hms.domain.enums.DoctorStatus;
import com.medicore.hms.domain.enums.SurgeryStatus;
import com.medicore.hms.dto.Requests.SurgeryCreate;
import com.medicore.hms.repository.DoctorRepository;
import com.medicore.hms.repository.PatientRepository;
import com.medicore.hms.repository.SurgeryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class SurgeryService {
    private final SurgeryRepository surgeries;
    private final PatientRepository patients;
    private final DoctorRepository doctors;
    private final AuditService audit;

    @Transactional(readOnly = true)
    public List<Surgery> list(SurgeryStatus status) {
        return surgeries.findAll(Sort.by("date", "time")).stream().filter(s -> status == null || s.getStatus() == status).toList();
    }

    public Surgery schedule(SurgeryCreate r) {
        Patient p = patients.findById(r.patientId()).orElseThrow(() -> new NotFoundException("Patient " + r.patientId() + " not found"));
        Doctor surgeon = doctors.findById(r.surgeonId()).orElseThrow(() -> new NotFoundException("Doctor " + r.surgeonId() + " not found"));
        if (surgeon.getStatus() == DoctorStatus.ON_LEAVE) throw new ConflictException(surgeon.getName() + " is on leave");
        int start = r.time().getHour() * 60 + r.time().getMinute();
        int end = start + r.duration();
        for (Surgery other : surgeries.findByRoomAndDateAndStatusIn(r.room(), r.date(), List.of(SurgeryStatus.SCHEDULED, SurgeryStatus.IN_PROGRESS))) {
            int os = other.getTime().getHour() * 60 + other.getTime().getMinute();
            if (start < os + other.getDuration() && os < end) {
                throw new ConflictException(r.room() + " is booked from " + other.getTime() + " for " + other.getDuration() + " min (" + other.getProcedure() + ")");
            }
        }
        Surgery s = surgeries.save(Surgery.builder().id(Ids.next("S")).patientId(p.getId()).surgeonId(surgeon.getId())
                .procedure(r.procedure().trim()).room(r.room()).date(r.date()).time(r.time()).duration(r.duration())
                .status(SurgeryStatus.SCHEDULED).build());
        audit.log("Scheduled " + s.getProcedure() + " for " + p.getName());
        return s;
    }

    /** SCHEDULED → IN_PROGRESS | CANCELLED, IN_PROGRESS → COMPLETED */
    public Surgery setStatus(String id, SurgeryStatus next) {
        Surgery s = surgeries.findById(id).orElseThrow(() -> new NotFoundException("Surgery " + id + " not found"));
        boolean ok = (s.getStatus() == SurgeryStatus.SCHEDULED && (next == SurgeryStatus.IN_PROGRESS || next == SurgeryStatus.CANCELLED))
                || (s.getStatus() == SurgeryStatus.IN_PROGRESS && next == SurgeryStatus.COMPLETED);
        if (!ok) throw new ConflictException("Cannot move a surgery from " + s.getStatus() + " to " + next);
        s.setStatus(next);
        audit.log(s.getProcedure() + " (" + s.getPatientId() + ") → " + next);
        return s;
    }
}
