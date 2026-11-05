package com.medicore.hms.service;

import com.medicore.hms.common.BadRequestException;
import com.medicore.hms.common.ConflictException;
import com.medicore.hms.common.Ids;
import com.medicore.hms.common.NotFoundException;
import com.medicore.hms.common.Specs;
import com.medicore.hms.domain.Doctor;
import com.medicore.hms.domain.Item;
import com.medicore.hms.domain.Patient;
import com.medicore.hms.domain.Prescription;
import com.medicore.hms.domain.enums.ItemCategory;
import com.medicore.hms.domain.enums.Role;
import com.medicore.hms.domain.enums.RxStatus;
import com.medicore.hms.dto.Requests.ItemCreate;
import com.medicore.hms.dto.Requests.PrescriptionCreate;
import com.medicore.hms.repository.DoctorRepository;
import com.medicore.hms.repository.ItemRepository;
import com.medicore.hms.repository.PatientRepository;
import com.medicore.hms.repository.PrescriptionRepository;
import com.medicore.hms.security.AuthUser;
import com.medicore.hms.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/** Medicine / supply / equipment stock and prescriptions. */
@Service
@RequiredArgsConstructor
@Transactional
public class PharmacyService {
    private final ItemRepository items;
    private final PrescriptionRepository prescriptions;
    private final PatientRepository patients;
    private final DoctorRepository doctors;
    private final AuditService audit;

    // ---------- items ----------
    @Transactional(readOnly = true)
    public List<Item> items(ItemCategory category) {
        return items.findAll(Specs.eq("category", category), Sort.by("name"));
    }

    public Item createItem(ItemCreate r) {
        Item item = items.save(Item.builder().id(Ids.next("IT")).name(r.name().trim()).category(r.category())
                .stock(r.stock()).reorder(r.reorder() == null ? 0 : r.reorder()).unit(r.unit())
                .price(r.price() == null ? BigDecimal.ZERO : r.price()).location(r.location())
                .expiry(r.category() == ItemCategory.MEDICINE ? r.expiry() : null)
                .nextMaintenance(r.category() == ItemCategory.EQUIPMENT ? r.nextMaintenance() : null).build());
        audit.log("Added " + item.getName() + " to inventory");
        return item;
    }

    public Item restock(String id, int quantity) {
        Item item = lock(id);
        if (item.getCategory() == ItemCategory.EQUIPMENT) throw new BadRequestException("Equipment cannot be restocked; record maintenance instead");
        item.setStock(item.getStock() + quantity);
        audit.log("Restocked " + quantity + " × " + item.getName());
        return item;
    }

    public Item markServiced(String id) {
        Item item = lock(id);
        if (item.getCategory() != ItemCategory.EQUIPMENT) throw new BadRequestException("Only equipment has a maintenance schedule");
        item.setNextMaintenance(LocalDate.now().plusDays(180));
        audit.log("Maintenance completed on " + item.getName());
        return item;
    }

    // ---------- prescriptions ----------
    @Transactional(readOnly = true)
    public List<Prescription> prescriptions(String patientId, RxStatus status) {
        Specification<Prescription> spec = Specs.<Prescription>eq("patientId", patientId).and(Specs.eq("status", status));
        return prescriptions.findAll(spec, Sort.by(Sort.Direction.DESC, "date"));
    }

    public Prescription prescribe(PrescriptionCreate r) {
        Patient patient = patients.findById(r.patientId()).orElseThrow(() -> new NotFoundException("Patient " + r.patientId() + " not found"));
        Item item = items.findById(r.itemId()).orElseThrow(() -> new NotFoundException("Item " + r.itemId() + " not found"));
        if (item.getCategory() != ItemCategory.MEDICINE) throw new BadRequestException(item.getName() + " is not a medicine");
        if (allergyConflict(patient, item) && !r.allergyOverride()) {
            throw new ConflictException("Possible allergy conflict: " + patient.getName() + " is allergic to " + patient.getAllergies()
                    + ". Send allergyOverride=true to prescribe anyway.");
        }
        Doctor doctor = resolveDoctor(r.doctorId());
        Prescription rx = prescriptions.save(Prescription.builder().id(Ids.next("RX")).patientId(patient.getId())
                .doctorId(doctor.getId()).itemId(item.getId()).dosage(r.dosage().trim()).duration(r.duration())
                .qty(r.qty()).instructions(r.instructions()).date(LocalDate.now()).status(RxStatus.PENDING).build());
        audit.log("Prescribed " + item.getName() + " to " + patient.getName());
        return rx;
    }

    /** Pharmacist hands the medicine over: stock is checked and decremented under a row lock. */
    public Prescription dispense(String id) {
        Prescription rx = prescriptions.findById(id).orElseThrow(() -> new NotFoundException("Prescription " + id + " not found"));
        if (rx.getStatus() == RxStatus.DISPENSED) throw new ConflictException("Prescription " + id + " was already dispensed");
        Item item = lock(rx.getItemId());
        if (item.getStock() < rx.getQty()) {
            throw new ConflictException("Insufficient stock for " + item.getName() + " (" + item.getStock() + " " + item.getUnit() + " left, " + rx.getQty() + " needed)");
        }
        item.setStock(item.getStock() - rx.getQty());
        rx.setStatus(RxStatus.DISPENSED);
        audit.log("Dispensed " + rx.getQty() + " × " + item.getName());
        return rx;
    }

    private Item lock(String id) {
        return items.lockById(id).orElseThrow(() -> new NotFoundException("Item " + id + " not found"));
    }

    /** A doctor prescribes as themselves; admins must name the doctor. */
    private Doctor resolveDoctor(String requested) {
        AuthUser user = CurrentUser.require();
        String id = user.role() == Role.DOCTOR && user.linkedId() != null ? user.linkedId() : requested;
        if (id == null || id.isBlank()) throw new BadRequestException("doctorId is required");
        return doctors.findById(id).orElseThrow(() -> new NotFoundException("Doctor " + id + " not found"));
    }

    /** Same rule as the React app: any allergy keyword (first word) that appears in the medicine name. */
    static boolean allergyConflict(Patient patient, Item item) {
        String allergies = patient.getAllergies();
        if (allergies == null || allergies.isBlank()) return false;
        String name = item.getName().toLowerCase();
        for (String token : allergies.toLowerCase().split("[,;/]")) {
            String t = token.trim();
            if (t.isEmpty() || t.equals("none") || t.equals("none known")) continue;
            if (name.contains(t.split("\\s+")[0])) return true;
        }
        return false;
    }
}
