package com.example.Skoolo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {
    private String token;
    private String role;

    private Long teacherId;
    private Long parentId;

    private String email;
    private String plainPassword; // Add this only for ADMIN, not persisted

}

