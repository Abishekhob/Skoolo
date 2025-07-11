package com.example.Skoolo.service;

import com.example.Skoolo.dto.AuthRequest;
import com.example.Skoolo.dto.AuthResponse;
import com.example.Skoolo.dto.RegisterRequest;
import com.example.Skoolo.model.User;
import com.example.Skoolo.repo.ParentRepository;
import com.example.Skoolo.repo.TeacherRepository;
import com.example.Skoolo.repo.UserRepository;
import com.example.Skoolo.security.CustomUserDetails;
import com.example.Skoolo.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final AuthenticationManager authenticationManager;
    private final TeacherRepository teacherRepository;
    private final ParentRepository parentRepository;


    public AuthResponse register(RegisterRequest request) {
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());

        userRepository.save(user);

        String token = jwtUtils.generateToken(new CustomUserDetails(user));
        AuthResponse response = new AuthResponse();
        response.setToken(token);
        response.setRole(user.getRole().name());
        return response;


    }

    public AuthResponse login(AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow();

        String token = jwtUtils.generateToken(new CustomUserDetails(user));

        AuthResponse response = new AuthResponse();
        response.setToken(token);
        response.setRole(user.getRole().name());

        if (user.getRole().name().equals("TEACHER")) {
            teacherRepository.findByUser(user).ifPresent(teacher -> {
                response.setTeacherId(teacher.getId());
            });
        } else if (user.getRole().name().equals("PARENT")) {
            parentRepository.findByUser(user).ifPresent(parent -> {
                response.setParentId(parent.getId());
            });
        }

        return response;
    }


}
