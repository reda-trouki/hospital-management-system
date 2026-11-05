package com.medicore.hms.service;

import com.medicore.hms.common.ConflictException;
import com.medicore.hms.common.NotFoundException;
import com.medicore.hms.domain.Bed;
import com.medicore.hms.domain.Patient;
import com.medicore.hms.domain.enums.PatientStatus;
import com.medicore.hms.repository.BedRepository;
import com.medicore.hms.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class BedService {
    private final BedRepository beds;
    private final PatientRepository patients;
    private final AuditService audit;

    @Transactional(readOnly = true)
    public List<Bed> list() {
        return beds.findAll(Sort.by("ward", "number"));
    }

    public Bed assign(String bedId, String patientId) {
        Bed bed = beds.findById(bedId).orElseThrow(() -> new NotFoundException("Bed " + bedId + " not found"));
        Patient patient = patients.findById(patientId).orElseThrow(() -> new NotFoundException("Patient " + patientId + " not found"));
        if (bed.getPatientId() != null && !bed.getPatientId().equals(patientId)) throw new ConflictException("Bed " + bedId + " is already occupied");
        if (patient.getStatus() == PatientStatus.DISCHARGED) throw new ConflictException("Discharged patients cannot be assigned a bed. Admit them first.");
        beds.findByPatientId(patientId).ifPresent(old -> { if (!old.getId().equals(bedId)) old.setPatientId(null); });
        beds.flush();
        bed.setPatientId(patientId);
        patient.setBedId(bedId);
        patient.setStatus(PatientStatus.ADMITTED);
        audit.log("Assigned bed " + bedId + " to " + patient.getName());
        return bed;
    }

    public Bed free(String bedId) {
        Bed bed = beds.findById(bedId).orElseThrow(() -> new NotFoundException("Bed " + bedId + " not found"));
        if (bed.getPatientId() != null) {
            patients.findById(bed.getPatientId()).ifPresent(p -> p.setBedId(null));
        }
        bed.setPatientId(null);
        audit.log("Freed bed " + bedId);
        return bed;
    }
}
