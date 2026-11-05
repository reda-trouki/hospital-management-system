package com.medicore.hms.service;

import com.medicore.hms.common.BadRequestException;
import com.medicore.hms.common.ConflictException;
import com.medicore.hms.common.Ids;
import com.medicore.hms.common.NotFoundException;
import com.medicore.hms.domain.User;
import com.medicore.hms.domain.enums.Role;
import com.medicore.hms.dto.Requests.UserCreate;
import com.medicore.hms.dto.Responses.UserView;
import com.medicore.hms.repository.DoctorRepository;
import com.medicore.hms.repository.PatientRepository;
import com.medicore.hms.repository.UserRepository;
import com.medicore.hms.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {
    private final UserRepository users;
    private final PatientRepository patients;
    private final DoctorRepository doctors;
    private final PasswordEncoder encoder;
    private final AuditService audit;

    @Transactional(readOnly = true)
    public List<UserView> list() {
        return users.findAll(Sort.by("name")).stream().map(UserView::of).toList();
    }

    @Transactional(readOnly = true)
    public UserView me() {
        String id = CurrentUser.require().id();
        return users.findById(id).map(UserView::of).orElseThrow(() -> new NotFoundException("User not found"));
    }

    public UserView create(UserCreate r) {
        String email = r.email().trim().toLowerCase();
        if (users.existsByEmailIgnoreCase(email)) throw new ConflictException("That email is already in use");
        String linkedId = r.linkedId() == null || r.linkedId().isBlank() ? null : r.linkedId();
        if (r.role() == Role.PATIENT) {
            if (linkedId == null || !patients.existsById(linkedId)) throw new BadRequestException("A patient account must be linked to an existing patient record");
        } else if (r.role() == Role.DOCTOR) {
            if (linkedId != null && !doctors.existsById(linkedId)) throw new BadRequestException("linkedId does not match a doctor");
        } else {
            linkedId = null;
        }
        User saved = users.save(User.builder().id(Ids.next("U")).name(r.name().trim()).email(email)
                .password(encoder.encode(r.password())).role(r.role()).linkedId(linkedId).build());
        audit.log("Created " + r.role() + " account for " + saved.getName());
        return UserView.of(saved);
    }

    public void delete(String id) {
        User target = users.findById(id).orElseThrow(() -> new NotFoundException("User " + id + " not found"));
        if (target.getId().equals(CurrentUser.require().id())) throw new ConflictException("You cannot delete your own account");
        if (target.getRole() == Role.ADMIN && users.countByRole(Role.ADMIN) <= 1) throw new ConflictException("At least one administrator must remain");
        users.delete(target);
        audit.log("Deleted account of " + target.getName());
    }
}
