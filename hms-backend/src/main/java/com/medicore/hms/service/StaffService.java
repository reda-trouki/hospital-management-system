package com.medicore.hms.service;

import com.medicore.hms.common.Ids;
import com.medicore.hms.common.NotFoundException;
import com.medicore.hms.domain.Staff;
import com.medicore.hms.domain.enums.Shift;
import com.medicore.hms.dto.Requests.StaffCreate;
import com.medicore.hms.repository.StaffRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class StaffService {
    private final StaffRepository staff;
    private final AuditService audit;

    @Transactional(readOnly = true)
    public List<Staff> list() {
        return staff.findAll(Sort.by("name"));
    }

    public Staff create(StaffCreate r) {
        Staff s = staff.save(Staff.builder().id(Ids.next("ST")).name(r.name().trim()).role(r.role())
                .department(r.department()).phone(r.phone()).shifts(new ArrayList<>(Collections.nCopies(7, Shift.OFF))).build());
        audit.log("Added staff member " + s.getName());
        return s;
    }

    public Staff setShifts(String id, List<Shift> shifts) {
        Staff s = staff.findById(id).orElseThrow(() -> new NotFoundException("Staff member " + id + " not found"));
        s.setShifts(new ArrayList<>(shifts));
        audit.log("Updated roster of " + s.getName());
        return s;
    }

    public void delete(String id) {
        Staff s = staff.findById(id).orElseThrow(() -> new NotFoundException("Staff member " + id + " not found"));
        staff.delete(s);
        audit.log("Removed staff member " + s.getName());
    }
}
