package com.medicore.hms.service;

import com.medicore.hms.common.Ids;
import com.medicore.hms.common.NotFoundException;
import com.medicore.hms.common.Specs;
import com.medicore.hms.domain.Note;
import com.medicore.hms.domain.Patient;
import com.medicore.hms.domain.Vital;
import com.medicore.hms.dto.Requests.NoteCreate;
import com.medicore.hms.dto.Requests.VitalCreate;
import com.medicore.hms.repository.NoteRepository;
import com.medicore.hms.repository.PatientRepository;
import com.medicore.hms.repository.VitalRepository;
import com.medicore.hms.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

/** Vitals and clinical notes. */
@Service
@RequiredArgsConstructor
@Transactional
public class RecordService {
    private final VitalRepository vitals;
    private final NoteRepository notes;
    private final PatientRepository patients;
    private final AuditService audit;

    @Transactional(readOnly = true)
    public List<Vital> vitals(String patientId) {
        return vitals.findAll(Specs.eq("patientId", patientId), Sort.by(Sort.Direction.DESC, "date"));
    }

    @Transactional(readOnly = true)
    public List<Note> notes(String patientId) {
        return notes.findAll(Specs.eq("patientId", patientId), Sort.by(Sort.Direction.DESC, "date"));
    }

    public Vital addVital(VitalCreate r) {
        Patient p = patient(r.patientId());
        Vital v = vitals.save(Vital.builder().id(Ids.next("V")).patientId(p.getId()).date(Instant.now())
                .bp(r.bp().trim()).hr(r.hr()).temp(r.temp()).spo2(r.spo2()).weight(r.weight())
                .by(CurrentUser.require().name()).build());
        audit.log("Recorded vitals for " + p.getName());
        return v;
    }

    public Note addNote(NoteCreate r) {
        Patient p = patient(r.patientId());
        Note n = notes.save(Note.builder().id(Ids.next("N")).patientId(p.getId()).date(Instant.now())
                .author(CurrentUser.require().name()).type(r.type()).text(r.text().trim()).build());
        audit.log("Added " + r.type().toString().toLowerCase() + " note for " + p.getName());
        return n;
    }

    private Patient patient(String id) {
        return patients.findById(id).orElseThrow(() -> new NotFoundException("Patient " + id + " not found"));
    }
}
