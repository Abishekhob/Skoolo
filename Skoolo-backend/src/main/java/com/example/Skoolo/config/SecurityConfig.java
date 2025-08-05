package com.example.Skoolo.config;

import com.example.Skoolo.security.JwtAuthFilter;
import com.example.Skoolo.security.UserDetailsServiceImpl;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final UserDetailsServiceImpl userDetailsService;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(request -> {
                    var config = new CorsConfiguration();
                    config.setAllowedOrigins(List.of("https://skoolo.vercel.app"));
                    config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
                    config.setAllowedHeaders(List.of("*"));
                    config.setAllowCredentials(true);
                    return config;
                }))
// Using lambda for explicit configuration
                // Disable CSRF for REST APIs when using stateless JWT authentication
                .csrf(csrf -> csrf.disable()) // <-- Disable CSRF entirely
                // Alternatively, ignore specific paths if you only want to disable for some APIs:
                // .csrf(csrf -> csrf
                //         .ignoringRequestMatchers("/api/**") // Ignore all /api endpoints
                //         .ignoringRequestMatchers("/ws-chat/**")
                // )
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers("/api/auth/login", "/api/auth/register","/uploads/**").permitAll()
                        .requestMatchers(
                                "/ws-chat/**",
                                "/app/**",
                                "/topic/**"
                        ).permitAll()

                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/timetable/**").hasRole("ADMIN")
                        .requestMatchers("/api/user/**").hasAnyRole("TEACHER", "ADMIN","PARENT")
                        .requestMatchers("/api/teacher/**").hasAnyRole("TEACHER", "ADMIN","PARENT")
                        .requestMatchers("/api/subjects/**").hasAnyRole("TEACHER", "ADMIN")
                        .requestMatchers("/api/parents/**").hasAnyRole("PARENT", "ADMIN","TEACHER")
                        .requestMatchers("/api/student/**").hasRole("STUDENT")
                        .requestMatchers("/api/classes/**").hasAnyRole("ADMIN", "TEACHER")
                        .requestMatchers("/api/syllabus/**").hasAnyRole("ADMIN", "TEACHER")
                        .requestMatchers("/api/fees/**").hasAnyRole("ADMIN", "TEACHER", "STUDENT")
                        .requestMatchers("/api/attendance/**").hasAnyRole("ADMIN", "TEACHER")
                        .requestMatchers("/api/assignments/**").hasAnyRole("ADMIN", "TEACHER")
                        .requestMatchers("/api/marks/**").hasAnyRole("TEACHER", "ADMIN")
                        .requestMatchers("/api/conversations/**").hasAnyRole("TEACHER", "PARENT")
                        .requestMatchers("/api/messages/**").hasAnyRole("TEACHER", "PARENT")
                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }


    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}