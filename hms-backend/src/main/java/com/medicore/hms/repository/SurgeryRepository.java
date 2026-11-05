package com.medicore.hms.repository;

import com.medicore.hms.domain.*;
import com.medicore.hms.domain.enums.*;
import org.springframework.data.jpa.repository.*;
import java.time.*;
import java.util.*;

public interface SurgeryRepository extends JpaRepository<Surgery, String> {
    List<Surgery> findByRoomAndDateAndStatusIn(String room, LocalDate date, Collection<SurgeryStatus> statuses);
}
