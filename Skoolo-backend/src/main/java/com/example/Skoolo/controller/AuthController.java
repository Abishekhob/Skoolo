package com.example.Skoolo.controller;

import com.example.Skoolo.dto.AuthRequest;
import com.example.Skoolo.dto.AuthResponse;
import com.example.Skoolo.dto.RegisterRequest;
import com.example.Skoolo.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public AuthResponse register(@RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody AuthRequest request) {
        return authService.login(request);
    }
}
