package com.example.Skoolo.dto;

import com.example.Skoolo.model.enums.Role;
import lombok.Data;

@Data
public class RegisterRequest {
    private String email;
    private String password;
    private Role role;

    private String firstName;
    private String lastName;
}
