package com.medicore.hms.repository;

import com.medicore.hms.domain.HospitalSettings;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SettingsRepository extends JpaRepository<HospitalSettings, Long> {
}
