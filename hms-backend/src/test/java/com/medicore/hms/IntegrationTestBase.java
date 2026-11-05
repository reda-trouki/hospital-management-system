package com.medicore.hms;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Boots the whole app on H2 with the demo data, so every test starts from the seeded accounts. */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
abstract class IntegrationTestBase {
    @Autowired protected MockMvc mvc;
    @Autowired protected ObjectMapper json;

    protected String login(String email, String password) throws Exception {
        String body = mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + email + "\",\"password\":\"" + password + "\"}"))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        return json.readTree(body).get("token").asText();
    }

    protected String admin() throws Exception { return login("admin@medicore.com", "admin123"); }
    protected String doctor() throws Exception { return login("doctor@medicore.com", "doctor123"); }
    protected String nurse() throws Exception { return login("nurse@medicore.com", "nurse123"); }
    protected String reception() throws Exception { return login("reception@medicore.com", "reception123"); }
    protected String pharmacist() throws Exception { return login("pharmacy@medicore.com", "pharmacy123"); }
    protected String labTech() throws Exception { return login("lab@medicore.com", "lab123"); }
    protected String patient() throws Exception { return login("patient@medicore.com", "patient123"); }

    protected ResultActions getAs(String token, String path) throws Exception {
        return mvc.perform(get(path).header("Authorization", "Bearer " + token));
    }

    protected ResultActions send(String method, String token, String path, String body) throws Exception {
        var req = switch (method) {
            case "POST" -> post(path);
            case "PUT" -> put(path);
            case "PATCH" -> patch(path);
            default -> throw new IllegalArgumentException(method);
        };
        req.header("Authorization", "Bearer " + token);
        if (body != null) req.contentType(MediaType.APPLICATION_JSON).content(body);
        return mvc.perform(req);
    }

    protected ResultActions postAs(String token, String path, String body) throws Exception { return send("POST", token, path, body); }
    protected ResultActions patchAs(String token, String path, String body) throws Exception { return send("PATCH", token, path, body); }

    protected JsonNode body(ResultActions r) throws Exception {
        return json.readTree(r.andReturn().getResponse().getContentAsString());
    }

    /** Creates a throw-away outpatient and returns its id. */
    protected String newPatient(String token, String allergies) throws Exception {
        String payload = "{\"name\":\"Test Patient\",\"age\":40,\"gender\":\"Male\",\"condition\":\"Checkup\",\"allergies\":\"" + allergies + "\"}";
        return body(postAs(token, "/api/patients", payload).andExpect(status().isCreated())).get("id").asText();
    }
}
