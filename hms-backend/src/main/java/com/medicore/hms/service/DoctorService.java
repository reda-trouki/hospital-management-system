package com.medicore.hms.service;

import com.medicore.hms.common.Ids;
import com.medicore.hms.common.NotFoundException;
import com.medicore.hms.domain.Doctor;
import com.medicore.hms.domain.enums.DoctorStatus;
import com.medicore.hms.dto.Requests.DoctorCreate;
import com.medicore.hms.repository.DoctorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class DoctorService {
    private final DoctorRepository doctors;
    private final AuditService audit;

    @Transactional(readOnly = true)
    public List<Doctor> list() {
        return doctors.findAll(Sort.by("name"));
    }

    public Doctor create(DoctorCreate r) {
        String name = r.name().trim();
        String full = name.toLowerCase().startsWith("dr.") || name.toLowerCase().startsWith("dr ") ? name : "Dr. " + name;
        Doctor d = doctors.save(Doctor.builder().id(Ids.next("D")).name(full).specialty(r.specialty().trim())
                .phone(r.phone()).status(DoctorStatus.AVAILABLE).patients(0).build());
        audit.log("Added " + d.getName());
        return d;
    }

    public Doctor setStatus(String id, DoctorStatus status) {
        Doctor d = doctors.findById(id).orElseThrow(() -> new NotFoundException("Doctor " + id + " not found"));
        d.setStatus(status);
        audit.log(d.getName() + " is now " + status);
        return d;
    }
}
