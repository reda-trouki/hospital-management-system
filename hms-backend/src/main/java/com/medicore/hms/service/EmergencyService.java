package com.medicore.hms.service;

import com.medicore.hms.common.ConflictException;
import com.medicore.hms.common.Ids;
import com.medicore.hms.common.NotFoundException;
import com.medicore.hms.domain.EmergencyCase;
import com.medicore.hms.domain.enums.ErStatus;
import com.medicore.hms.dto.Requests.EmergencyCreate;
import com.medicore.hms.repository.EmergencyCaseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class EmergencyService {
    private final EmergencyCaseRepository cases;
    private final AuditService audit;

    /** Most urgent first, then longest waiting. */
    @Transactional(readOnly = true)
    public List<EmergencyCase> list(ErStatus status) {
        return cases.findAll(Sort.by("triage", "arrival")).stream().filter(c -> status == null || c.getStatus() == status).toList();
    }

    public EmergencyCase register(EmergencyCreate r) {
        EmergencyCase c = cases.save(EmergencyCase.builder().id(Ids.next("ER")).name(r.name().trim()).age(r.age())
                .complaint(r.complaint().trim()).triage(r.triage()).arrival(Instant.now()).status(ErStatus.WAITING).build());
        audit.log("ER arrival: " + c.getName() + " (triage " + c.getTriage() + ")");
        return c;
    }

    /** WAITING → IN_TREATMENT → ADMITTED | DISCHARGED */
    public EmergencyCase setStatus(String id, ErStatus next) {
        EmergencyCase c = cases.findById(id).orElseThrow(() -> new NotFoundException("ER case " + id + " not found"));
        boolean ok = (c.getStatus() == ErStatus.WAITING && next == ErStatus.IN_TREATMENT)
                || (c.getStatus() == ErStatus.IN_TREATMENT && (next == ErStatus.ADMITTED || next == ErStatus.DISCHARGED));
        if (!ok) throw new ConflictException("Cannot move an ER case from " + c.getStatus() + " to " + next);
        c.setStatus(next);
        audit.log("ER: " + c.getName() + " → " + next);
        return c;
    }
}
