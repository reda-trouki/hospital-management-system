package com.medicore.hms.service;

import com.medicore.hms.common.BadRequestException;
import com.medicore.hms.common.ConflictException;
import com.medicore.hms.common.Ids;
import com.medicore.hms.common.NotFoundException;
import com.medicore.hms.common.Specs;
import com.medicore.hms.domain.LabOrder;
import com.medicore.hms.domain.Patient;
import com.medicore.hms.domain.enums.LabStatus;
import com.medicore.hms.domain.enums.Role;
import com.medicore.hms.dto.Requests.LabCreate;
import com.medicore.hms.dto.Requests.LabResultUpdate;
import com.medicore.hms.repository.DoctorRepository;
import com.medicore.hms.repository.LabOrderRepository;
import com.medicore.hms.repository.PatientRepository;
import com.medicore.hms.security.AuthUser;
import com.medicore.hms.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class LabService {
    private final LabOrderRepository labs;
    private final PatientRepository patients;
    private final DoctorRepository doctors;
    private final AuditService audit;

    @Transactional(readOnly = true)
    public List<LabOrder> list(String patientId, LabStatus status) {
        Specification<LabOrder> spec = Specs.<LabOrder>eq("patientId", patientId).and(Specs.eq("status", status));
        return labs.findAll(spec, Sort.by(Sort.Direction.DESC, "date"));
    }

    public LabOrder order(LabCreate r) {
        Patient p = patients.findById(r.patientId()).orElseThrow(() -> new NotFoundException("Patient " + r.patientId() + " not found"));
        AuthUser user = CurrentUser.require();
        String doctorId = user.role() == Role.DOCTOR && user.linkedId() != null ? user.linkedId() : r.doctorId();
        if (doctorId == null || doctorId.isBlank()) throw new BadRequestException("doctorId is required");
        if (!doctors.existsById(doctorId)) throw new NotFoundException("Doctor " + doctorId + " not found");
        LabOrder order = labs.save(LabOrder.builder().id(Ids.next("LAB")).patientId(p.getId()).doctorId(doctorId)
                .test(r.test().trim()).priority(r.priority()).date(Instant.now()).status(LabStatus.ORDERED).build());
        audit.log("Ordered " + order.getTest() + " for " + p.getName());
        return order;
    }

    public LabOrder start(String id) {
        LabOrder l = get(id);
        if (l.getStatus() != LabStatus.ORDERED) throw new ConflictException("Only ordered tests can be started");
        l.setStatus(LabStatus.IN_PROGRESS);
        audit.log("Started " + l.getTest() + " (" + l.getPatientId() + ")");
        return l;
    }

    public LabOrder enterResult(String id, LabResultUpdate r) {
        LabOrder l = get(id);
        if (l.getStatus() == LabStatus.COMPLETED) throw new ConflictException("This result was already entered");
        l.setResult(r.result().trim());
        l.setFlag(r.flag());
        l.setStatus(LabStatus.COMPLETED);
        audit.log("Result entered: " + l.getTest() + " (" + l.getPatientId() + ") — " + r.flag());
        return l;
    }

    private LabOrder get(String id) {
        return labs.findById(id).orElseThrow(() -> new NotFoundException("Lab order " + id + " not found"));
    }
}
