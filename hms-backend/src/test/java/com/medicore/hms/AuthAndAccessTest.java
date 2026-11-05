package com.medicore.hms;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class AuthAndAccessTest extends IntegrationTestBase {

    @Test
    void loginReturnsTokenAndRoleLabel() throws Exception {
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"lab@medicore.com\",\"password\":\"lab123\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.user.role").value("Lab Tech"))
                .andExpect(jsonPath("$.user.password").doesNotExist());
    }

    @Test
    void wrongPasswordIsUnauthorizedWithGenericMessage() throws Exception {
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"nobody-" + System.nanoTime() + "@medicore.com\",\"password\":\"nope\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.detail").value("Invalid email or password"));
    }

    @Test
    void invalidLoginBodyIsRejectedWithFieldErrors() throws Exception {
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON).content("{\"email\":\"not-an-email\",\"password\":\"\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.email").exists())
                .andExpect(jsonPath("$.errors.password").exists());
    }

    @Test
    void protectedEndpointsNeedAToken() throws Exception {
        mvc.perform(get("/api/patients")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/patients").header("Authorization", "Bearer not.a.jwt")).andExpect(status().isUnauthorized());
    }

    @Test
    void publicEndpointsStayOpen() throws Exception {
        mvc.perform(get("/api/settings/public")).andExpect(status().isOk()).andExpect(jsonPath("$.hospitalName").value("MediCore Hospital"));
        mvc.perform(get("/actuator/health")).andExpect(status().isOk());
    }

    @Test
    void meReturnsTheSignedInUser() throws Exception {
        getAs(doctor(), "/api/auth/me").andExpect(status().isOk()).andExpect(jsonPath("$.role").value("Doctor")).andExpect(jsonPath("$.linkedId").value("D-01"));
    }

    @Test
    void roleMatrixMatchesTheFrontEnd() throws Exception {
        // billing: admin + receptionist only
        getAs(reception(), "/api/invoices").andExpect(status().isOk());
        getAs(admin(), "/api/invoices").andExpect(status().isOk());
        getAs(doctor(), "/api/invoices").andExpect(status().isForbidden());
        getAs(pharmacist(), "/api/invoices").andExpect(status().isForbidden());
        // administration
        getAs(admin(), "/api/audit").andExpect(status().isOk());
        getAs(nurse(), "/api/audit").andExpect(status().isForbidden());
        getAs(admin(), "/api/users").andExpect(status().isOk());
        getAs(reception(), "/api/users").andExpect(status().isForbidden());
        getAs(admin(), "/api/reports/summary").andExpect(status().isOk());
        getAs(doctor(), "/api/reports/summary").andExpect(status().isForbidden());
        // clinical
        getAs(labTech(), "/api/labs").andExpect(status().isOk());
        getAs(labTech(), "/api/prescriptions").andExpect(status().isForbidden());
        getAs(pharmacist(), "/api/prescriptions").andExpect(status().isOk());
        getAs(pharmacist(), "/api/surgeries").andExpect(status().isForbidden());
        // lab tech may not order tests, pharmacist may not prescribe
        postAs(labTech(), "/api/labs", "{\"patientId\":\"P-1001\",\"test\":\"HbA1c\",\"priority\":\"Routine\"}").andExpect(status().isForbidden());
        postAs(pharmacist(), "/api/prescriptions", "{\"patientId\":\"P-1001\",\"itemId\":\"IT-1\",\"dosage\":\"1\",\"qty\":1}").andExpect(status().isForbidden());
    }

    @Test
    void patientsAreLockedIntoThePortal() throws Exception {
        String t = patient();
        getAs(t, "/api/patients").andExpect(status().isForbidden());
        getAs(t, "/api/invoices").andExpect(status().isForbidden());
        getAs(t, "/api/portal/me").andExpect(status().isOk()).andExpect(jsonPath("$.patient.id").value("P-1001"));
        getAs(doctor(), "/api/portal/me").andExpect(status().isForbidden());
    }

    @Test
    void portalOnlyExposesFinishedLabResults() throws Exception {
        getAs(patient(), "/api/portal/me").andExpect(status().isOk()).andExpect(jsonPath("$.labs", hasSize(1))).andExpect(jsonPath("$.labs[0].test").value("Troponin I"));
    }

    @Test
    void unknownRoutesAreDenied() throws Exception {
        getAs(admin(), "/api/does-not-exist").andExpect(status().isForbidden());
    }
}
