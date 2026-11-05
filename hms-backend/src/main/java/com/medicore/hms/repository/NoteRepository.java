package com.medicore.hms.repository;

import com.medicore.hms.domain.*;
import com.medicore.hms.domain.enums.*;
import org.springframework.data.jpa.repository.*;
import java.time.*;
import java.util.*;

public interface NoteRepository extends JpaRepository<Note, String>, JpaSpecificationExecutor<Note> {

}
