package com.medicore.hms;

import org.junit.jupiter.api.Test;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class WorkflowTest extends IntegrationTestBase {

    @Test
    void registeringWithABedAdmitsThePatientAndBlocksDoubleBooking() throws Exception {
        String t = admin();
        String payload = "{\"name\":\"Bed Test\",\"age\":30,\"gender\":\"Female\",\"condition\":\"Observation\",\"bedId\":\"GEN-1\"}";
        postAs(t, "/api/patients", payload).andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("Admitted")).andExpect(jsonPath("$.bedId").value("GEN-1"));
        postAs(t, "/api/patients", payload).andExpect(status().isConflict());
    }

    @Test
    void dischargeFreesTheBedAndCannotRepeat() throws Exception {
        String t = admin();
        String id = body(postAs(t, "/api/patients", "{\"name\":\"D\",\"age\":50,\"gender\":\"Male\",\"condition\":\"x\",\"bedId\":\"GEN-3\"}").andExpect(status().isCreated())).get("id").asText();
        postAs(t, "/api/patients/" + id + "/discharge", null).andExpect(status().isOk()).andExpect(jsonPath("$.status").value("Discharged"));
        postAs(t, "/api/patients/" + id + "/discharge", null).andExpect(status().isConflict());
        postAs(t, "/api/beds/GEN-3/assign", "{\"patientId\":\"" + id + "\"}").andExpect(status().isConflict()); // discharged patients need re-admission
    }

    @Test
    void deletingAPatientRemovesItsRecords() throws Exception {
        String t = admin();
        String id = newPatient(t, "None known");
        postAs(t, "/api/vitals", "{\"patientId\":\"" + id + "\",\"bp\":\"120/80\",\"hr\":70,\"temp\":36.8,\"spo2\":98}").andExpect(status().isCreated());
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete("/api/patients/" + id).header("Authorization", "Bearer " + t))
                .andExpect(status().isNoContent());
        getAs(t, "/api/patients/" + id).andExpect(status().isNotFound());
        getAs(t, "/api/vitals?patientId=" + id).andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void dispensingReducesStockAndCannotBeRepeated() throws Exception {
        String p = pharmacist();
        int before = body(getAs(p, "/api/items?category=Medicine")).findParents("id").stream().filter(n -> n.get("id").asText().equals("IT-7")).findFirst().orElseThrow().get("stock").asInt();
        postAs(p, "/api/prescriptions/RX-1/dispense", null).andExpect(status().isOk()).andExpect(jsonPath("$.status").value("Dispensed"));
        int after = body(getAs(p, "/api/items?category=Medicine")).findParents("id").stream().filter(n -> n.get("id").asText().equals("IT-7")).findFirst().orElseThrow().get("stock").asInt();
        org.junit.jupiter.api.Assertions.assertEquals(before - 30, after);
        postAs(p, "/api/prescriptions/RX-1/dispense", null).andExpect(status().isConflict());
    }

    @Test
    void dispensingWithoutEnoughStockIsRejected() throws Exception {
        String rxId = body(postAs(doctor(), "/api/prescriptions", "{\"patientId\":\"P-1002\",\"itemId\":\"IT-5\",\"dosage\":\"10u\",\"qty\":5000}").andExpect(status().isCreated())).get("id").asText();
        postAs(pharmacist(), "/api/prescriptions/" + rxId + "/dispense", null).andExpect(status().isConflict()).andExpect(jsonPath("$.detail").value(containsString("Insufficient stock")));
    }

    @Test
    void allergyConflictBlocksPrescribingUnlessOverridden() throws Exception {
        String t = doctor();
        String id = newPatient(admin(), "Aspirin");
        String rx = "{\"patientId\":\"" + id + "\",\"itemId\":\"IT-4\",\"dosage\":\"75mg\",\"qty\":10%s}";
        postAs(t, "/api/prescriptions", rx.formatted("")).andExpect(status().isConflict()).andExpect(jsonPath("$.detail").value(containsString("allergy")));
        postAs(t, "/api/prescriptions", rx.formatted(",\"allergyOverride\":true")).andExpect(status().isCreated()).andExpect(jsonPath("$.doctorId").value("D-01"));
    }

    @Test
    void appointmentSlotsCannotBeDoubleBookedForADoctor() throws Exception {
        String t = reception();
        String a = "{\"patientId\":\"P-1003\",\"doctorId\":\"D-03\",\"date\":\"2031-03-10\",\"time\":\"09:30\",\"reason\":\"Checkup\"}";
        postAs(t, "/api/appointments", a).andExpect(status().isCreated()).andExpect(jsonPath("$.time").value("09:30")).andExpect(jsonPath("$.status").value("Scheduled"));
        postAs(t, "/api/appointments", a).andExpect(status().isConflict());
        postAs(t, "/api/appointments", a.replace("D-03", "D-04")).andExpect(status().isConflict()); // D-04 is on leave
    }

    @Test
    void reschedulingChecksForClashes() throws Exception {
        String t = reception();
        String base = "{\"patientId\":\"P-1003\",\"doctorId\":\"D-05\",\"date\":\"2031-04-01\",\"time\":\"%s\",\"reason\":\"Visit\"}";
        postAs(t, "/api/appointments", base.formatted("10:00")).andExpect(status().isCreated());
        String second = body(postAs(t, "/api/appointments", base.formatted("11:00")).andExpect(status().isCreated())).get("id").asText();
        patchAs(t, "/api/appointments/" + second + "/reschedule", "{\"date\":\"2031-04-01\",\"time\":\"10:00\"}").andExpect(status().isConflict());
        patchAs(t, "/api/appointments/" + second + "/reschedule", "{\"date\":\"2031-04-01\",\"time\":\"12:00\"}").andExpect(status().isOk());
    }

    @Test
    void surgeryRoomsCannotOverlap() throws Exception {
        String t = doctor();
        String s = "{\"patientId\":\"P-1003\",\"surgeonId\":\"D-01\",\"procedure\":\"Test op\",\"room\":\"OR-4\",\"date\":\"2031-05-02\",\"time\":\"%s\",\"duration\":60}";
        postAs(t, "/api/surgeries", s.formatted("08:00")).andExpect(status().isCreated());
        postAs(t, "/api/surgeries", s.formatted("08:30")).andExpect(status().isConflict());
        postAs(t, "/api/surgeries", s.formatted("09:00")).andExpect(status().isCreated());
    }

    @Test
    void emergencyCasesFollowTheTriageFlow() throws Exception {
        String t = nurse();
        String id = body(postAs(t, "/api/emergency", "{\"name\":\"ER Test\",\"age\":33,\"complaint\":\"Fever\",\"triage\":4}").andExpect(status().isCreated()).andExpect(jsonPath("$.status").value("Waiting"))).get("id").asText();
        patchAs(t, "/api/emergency/" + id + "/status", "{\"status\":\"Admitted\"}").andExpect(status().isConflict());
        patchAs(t, "/api/emergency/" + id + "/status", "{\"status\":\"In Treatment\"}").andExpect(status().isOk());
        patchAs(t, "/api/emergency/" + id + "/status", "{\"status\":\"Discharged\"}").andExpect(status().isOk());
    }

    @Test
    void labResultsFlowFromOrderToCompleted() throws Exception {
        String id = body(postAs(doctor(), "/api/labs", "{\"patientId\":\"P-1003\",\"test\":\"Urinalysis\",\"priority\":\"Urgent\"}").andExpect(status().isCreated())).get("id").asText();
        String t = labTech();
        patchAs(t, "/api/labs/" + id + "/start", null).andExpect(status().isOk()).andExpect(jsonPath("$.status").value("In Progress"));
        patchAs(t, "/api/labs/" + id + "/result", "{\"result\":\"Normal\",\"flag\":\"Normal\"}").andExpect(status().isOk()).andExpect(jsonPath("$.status").value("Completed"));
        patchAs(t, "/api/labs/" + id + "/result", "{\"result\":\"Again\",\"flag\":\"Normal\"}").andExpect(status().isConflict());
    }

    @Test
    void invoiceTotalsAndPaymentsAreEnforced() throws Exception {
        String t = reception();
        String create = "{\"patientId\":\"P-1003\",\"items\":[{\"desc\":\"Service\",\"qty\":2,\"price\":100}],\"discount\":10,\"tax\":10,\"insurance\":50}";
        var created = body(postAs(t, "/api/invoices", create).andExpect(status().isCreated()));
        String id = created.get("id").asText();
        org.junit.jupiter.api.Assertions.assertEquals(0, new java.math.BigDecimal("198.00").compareTo(created.get("total").decimalValue()));
        org.junit.jupiter.api.Assertions.assertEquals(0, new java.math.BigDecimal("99.00").compareTo(created.get("patientDue").decimalValue()));
        postAs(t, "/api/invoices/" + id + "/payments", "{\"amount\":100,\"method\":\"Cash\"}").andExpect(status().isBadRequest()); // exceeds balance
        postAs(t, "/api/invoices/" + id + "/payments", "{\"amount\":40,\"method\":\"Card\"}").andExpect(status().isOk()).andExpect(jsonPath("$.status").value("Partial"));
        postAs(t, "/api/invoices/" + id + "/payments", "{\"amount\":59,\"method\":\"Card\"}").andExpect(status().isOk()).andExpect(jsonPath("$.status").value("Paid"));
        postAs(t, "/api/invoices/" + id + "/payments", "{\"amount\":1,\"method\":\"Card\"}").andExpect(status().isBadRequest());
    }

    @Test
    void patientsCanBookAndCancelButNotTouchOthersData() throws Exception {
        String t = patient();
        String id = body(postAs(t, "/api/portal/appointments", "{\"doctorId\":\"D-03\",\"date\":\"2031-06-01\",\"time\":\"15:00\",\"reason\":\"Check\"}").andExpect(status().isCreated())).get("id").asText();
        postAs(t, "/api/portal/appointments/" + id + "/cancel", null).andExpect(status().isOk()).andExpect(jsonPath("$.status").value("Cancelled"));
        postAs(t, "/api/portal/appointments/A-2001/cancel", null).andExpect(status().isNotFound()); // belongs to another patient
        postAs(t, "/api/portal/invoices/INV-3002/payments", "{\"amount\":1,\"method\":\"Card\"}").andExpect(status().isNotFound());
        postAs(t, "/api/portal/appointments", "{\"doctorId\":\"D-03\",\"date\":\"2001-01-01\",\"time\":\"15:00\",\"reason\":\"Past\"}").andExpect(status().isBadRequest());
    }

    @Test
    void actionsAreWrittenToTheAuditLog() throws Exception {
        String t = admin();
        newPatient(t, "None known");
        getAs(t, "/api/audit?q=Registered&size=5").andExpect(status().isOk()).andExpect(jsonPath("$.content[0].action").value(containsString("Registered patient")));
    }

    @Test
    void adminCannotDeleteTheirOwnAccount() throws Exception {
        String t = admin();
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete("/api/users/U-1").header("Authorization", "Bearer " + t))
                .andExpect(status().isConflict());
    }

    @Test
    void dashboardHidesBillingFiguresFromClinicalRoles() throws Exception {
        getAs(admin(), "/api/dashboard").andExpect(status().isOk()).andExpect(jsonPath("$.outstandingBilling").isNotEmpty());
        getAs(doctor(), "/api/dashboard").andExpect(status().isOk()).andExpect(jsonPath("$.outstandingBilling").isEmpty());
    }
}
