package com.medicore.hms.service;

import com.medicore.hms.common.ConflictException;
import com.medicore.hms.common.Ids;
import com.medicore.hms.common.NotFoundException;
import com.medicore.hms.common.Specs;
import com.medicore.hms.domain.Bed;
import com.medicore.hms.domain.Patient;
import com.medicore.hms.domain.enums.PatientStatus;
import com.medicore.hms.dto.Requests.PatientCreate;
import com.medicore.hms.dto.Requests.PatientUpdate;
import com.medicore.hms.repository.BedRepository;
import com.medicore.hms.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class PatientService {
    private final PatientRepository patients;
    private final BedRepository beds;
    private final AuditService audit;

    @Transactional(readOnly = true)
    public List<Patient> list(String q, PatientStatus status) {
        Specification<Patient> spec = Specs.<Patient>eq("status", status).and(Specs.like(q, "name", "id", "condition", "phone"));
        return patients.findAll(spec, Sort.by(Sort.Direction.DESC, "admittedOn").and(Sort.by("name")));
    }

    @Transactional(readOnly = true)
    public Patient get(String id) {
        return patients.findById(id).orElseThrow(() -> new NotFoundException("Patient " + id + " not found"));
    }

    public Patient create(PatientCreate r) {
        Patient p = Patient.builder()
                .id(Ids.next("P")).name(r.name().trim()).age(r.age()).gender(r.gender())
                .phone(r.phone()).bloodType(r.bloodType()).condition(r.condition().trim())
                .allergies(blankTo(r.allergies(), "None known")).emergencyContact(r.emergencyContact())
                .insurer(r.insurer()).policyNo(r.policyNo()).coverage(r.coverage() == null ? 0 : r.coverage())
                .status(PatientStatus.OUTPATIENT).admittedOn(LocalDate.now()).build();
        Bed bed = null;
        if (r.bedId() != null && !r.bedId().isBlank()) {
            bed = beds.findById(r.bedId()).orElseThrow(() -> new NotFoundException("Bed " + r.bedId() + " not found"));
            if (bed.getPatientId() != null) throw new ConflictException("Bed " + bed.getId() + " is already occupied");
            p.setBedId(bed.getId());
            p.setStatus(PatientStatus.ADMITTED);
        }
        patients.save(p);
        if (bed != null) bed.setPatientId(p.getId());
        audit.log("Registered patient " + p.getName());
        return p;
    }

    public Patient update(String id, PatientUpdate r) {
        Patient p = get(id);
        if (r.name() != null && !r.name().isBlank()) p.setName(r.name().trim());
        if (r.age() != null) p.setAge(r.age());
        if (r.gender() != null) p.setGender(r.gender());
        if (r.phone() != null) p.setPhone(r.phone());
        if (r.bloodType() != null) p.setBloodType(r.bloodType());
        if (r.condition() != null && !r.condition().isBlank()) p.setCondition(r.condition().trim());
        if (r.allergies() != null) p.setAllergies(blankTo(r.allergies(), "None known"));
        if (r.emergencyContact() != null) p.setEmergencyContact(r.emergencyContact());
        if (r.insurer() != null) p.setInsurer(r.insurer());
        if (r.policyNo() != null) p.setPolicyNo(r.policyNo());
        if (r.coverage() != null) p.setCoverage(r.coverage());
        audit.log("Updated record of " + p.getName());
        return p;
    }

    public Patient discharge(String id) {
        Patient p = get(id);
        if (p.getStatus() == PatientStatus.DISCHARGED) throw new ConflictException(p.getName() + " is already discharged");
        beds.findByPatientId(id).ifPresent(b -> b.setPatientId(null));
        p.setStatus(PatientStatus.DISCHARGED);
        p.setBedId(null);
        audit.log("Discharged " + p.getName());
        return p;
    }

    /** Child records (appointments, vitals, notes, prescriptions, labs, surgeries, invoices) are removed by FK cascade. */
    public void delete(String id) {
        Patient p = get(id);
        beds.findByPatientId(id).ifPresent(b -> b.setPatientId(null));
        beds.flush();
        patients.delete(p);
        audit.log("Deleted patient " + p.getName() + " and all related records");
    }

    private static String blankTo(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value.trim();
    }
}
