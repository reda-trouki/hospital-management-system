package com.medicore.hms.service;

import com.medicore.hms.domain.HospitalSettings;
import com.medicore.hms.dto.Requests.SettingsUpdate;
import com.medicore.hms.repository.SettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
@Transactional
public class SettingsService {
    private static final long ID = 1L;
    private final SettingsRepository repository;
    private final AuditService audit;

    public HospitalSettings get() {
        return repository.findById(ID).orElseGet(() ->
                repository.save(new HospitalSettings(ID, "MediCore Hospital", new BigDecimal("5.00"))));
    }

    public HospitalSettings update(SettingsUpdate r) {
        HospitalSettings s = get();
        s.setHospitalName(r.hospitalName().trim());
        s.setTaxRate(r.taxRate());
        audit.log("Updated hospital settings");
        return s;
    }
}
