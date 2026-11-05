package com.medicore.hms.repository;

import com.medicore.hms.domain.*;
import com.medicore.hms.domain.enums.*;
import org.springframework.data.jpa.repository.*;
import java.time.*;
import java.util.*;

public interface BedRepository extends JpaRepository<Bed, String> {
    Optional<Bed> findByPatientId(String patientId);
}
