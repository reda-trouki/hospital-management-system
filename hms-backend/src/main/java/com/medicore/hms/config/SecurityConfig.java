package com.medicore.hms.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medicore.hms.repository.UserRepository;
import com.medicore.hms.security.JwtAuthFilter;
import com.medicore.hms.security.JwtService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ProblemDetail;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.io.IOException;
import java.time.Duration;
import java.util.List;

/**
 * Central access-control matrix. It mirrors the role rules in the React app (src/lib/auth.ts):
 * first matching rule wins and anything not listed is denied.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private static final String ADMIN = "ADMIN", DOCTOR = "DOCTOR", NURSE = "NURSE", RECEPTIONIST = "RECEPTIONIST",
            PHARMACIST = "PHARMACIST", LAB_TECH = "LAB_TECH", PATIENT = "PATIENT";
    private static final String[] STAFF = {ADMIN, DOCTOR, NURSE, RECEPTIONIST, PHARMACIST, LAB_TECH};

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(10);
    }

    @Bean
    SecurityFilterChain filterChain(HttpSecurity http, JwtService jwt, UserRepository users, ObjectMapper mapper) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)                       // stateless API, no cookies
            .cors(Customizer.withDefaults())
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(e -> e
                .authenticationEntryPoint((req, res, ex) -> writeProblem(mapper, res, HttpStatus.UNAUTHORIZED, "Authentication is required"))
                .accessDeniedHandler((req, res, ex) -> writeProblem(mapper, res, HttpStatus.FORBIDDEN, "Your role is not allowed to do this")))
            .authorizeHttpRequests(a -> a
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/error").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/settings/public", "/actuator/health", "/actuator/health/**",
                        "/v3/api-docs", "/v3/api-docs/**", "/swagger-ui.html", "/swagger-ui/**").permitAll()
                .requestMatchers("/api/auth/me").authenticated()

                // Patient self-service portal
                .requestMatchers("/api/portal/**").hasRole(PATIENT)

                // Administration
                .requestMatchers("/api/users/**", "/api/audit/**", "/api/reports/**", "/api/staff/**").hasRole(ADMIN)
                .requestMatchers(HttpMethod.GET, "/api/settings").hasAnyRole(STAFF)
                .requestMatchers(HttpMethod.PUT, "/api/settings").hasRole(ADMIN)

                // Patients
                .requestMatchers(HttpMethod.POST, "/api/patients/*/discharge").hasAnyRole(ADMIN, DOCTOR)
                .requestMatchers(HttpMethod.GET, "/api/patients", "/api/patients/**").hasAnyRole(STAFF)
                .requestMatchers(HttpMethod.DELETE, "/api/patients/**").hasRole(ADMIN)
                .requestMatchers(HttpMethod.POST, "/api/patients").hasAnyRole(ADMIN, RECEPTIONIST, NURSE)
                .requestMatchers(HttpMethod.PUT, "/api/patients/**").hasAnyRole(ADMIN, RECEPTIONIST, NURSE)

                // Front desk / clinical scheduling
                .requestMatchers("/api/appointments", "/api/appointments/**").hasAnyRole(ADMIN, DOCTOR, NURSE, RECEPTIONIST)
                .requestMatchers("/api/beds", "/api/beds/**").hasAnyRole(ADMIN, DOCTOR, NURSE, RECEPTIONIST)
                .requestMatchers("/api/emergency", "/api/emergency/**").hasAnyRole(ADMIN, DOCTOR, NURSE, RECEPTIONIST)
                .requestMatchers(HttpMethod.GET, "/api/doctors", "/api/doctors/**").hasAnyRole(STAFF)
                .requestMatchers(HttpMethod.PATCH, "/api/doctors/*/status").hasAnyRole(ADMIN, RECEPTIONIST)
                .requestMatchers(HttpMethod.POST, "/api/doctors").hasRole(ADMIN)

                // Clinical record
                .requestMatchers(HttpMethod.GET, "/api/vitals", "/api/notes").hasAnyRole(STAFF)
                .requestMatchers(HttpMethod.POST, "/api/vitals").hasAnyRole(ADMIN, DOCTOR, NURSE)
                .requestMatchers(HttpMethod.POST, "/api/notes").hasAnyRole(ADMIN, DOCTOR)
                .requestMatchers(HttpMethod.GET, "/api/surgeries", "/api/surgeries/**").hasAnyRole(ADMIN, DOCTOR, NURSE)
                .requestMatchers("/api/surgeries", "/api/surgeries/**").hasAnyRole(ADMIN, DOCTOR)

                // Pharmacy, laboratory, inventory
                .requestMatchers(HttpMethod.POST, "/api/prescriptions/*/dispense").hasAnyRole(ADMIN, PHARMACIST)
                .requestMatchers(HttpMethod.GET, "/api/prescriptions", "/api/prescriptions/**").hasAnyRole(ADMIN, DOCTOR, NURSE, PHARMACIST)
                .requestMatchers(HttpMethod.POST, "/api/prescriptions").hasAnyRole(ADMIN, DOCTOR)
                .requestMatchers(HttpMethod.GET, "/api/labs", "/api/labs/**").hasAnyRole(ADMIN, DOCTOR, NURSE, LAB_TECH)
                .requestMatchers(HttpMethod.POST, "/api/labs").hasAnyRole(ADMIN, DOCTOR)
                .requestMatchers(HttpMethod.PATCH, "/api/labs/**").hasAnyRole(ADMIN, LAB_TECH)
                .requestMatchers(HttpMethod.GET, "/api/items", "/api/items/**").hasAnyRole(ADMIN, DOCTOR, NURSE, PHARMACIST)
                .requestMatchers("/api/items", "/api/items/**").hasAnyRole(ADMIN, PHARMACIST, NURSE)

                // Billing
                .requestMatchers("/api/invoices", "/api/invoices/**").hasAnyRole(ADMIN, RECEPTIONIST)

                // Dashboard & notifications
                .requestMatchers("/api/dashboard", "/api/notifications").hasAnyRole(STAFF)

                .anyRequest().denyAll())
            .addFilterBefore(new JwtAuthFilter(jwt, users), UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource(AppProperties props) {
        CorsConfiguration cfg = new CorsConfiguration();
        cfg.setAllowedOrigins(props.cors().allowedOrigins());
        cfg.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        cfg.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept"));
        cfg.setMaxAge(Duration.ofHours(1));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", cfg);
        return source;
    }

    private static void writeProblem(ObjectMapper mapper, HttpServletResponse res, HttpStatus status, String detail) throws IOException {
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(status, detail);
        pd.setTitle(status.getReasonPhrase());
        res.setStatus(status.value());
        res.setContentType(MediaType.APPLICATION_PROBLEM_JSON_VALUE);
        mapper.writeValue(res.getWriter(), pd);
    }
}
