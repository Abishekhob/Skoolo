package com.example.Skoolo.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.example.Skoolo.model.enums.Role;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String email;

    private String password;

    @Enumerated(EnumType.STRING)
    private Role role; // STUDENT, PARENT, TEACHER, ADMIN

    private boolean active = true;

    private String firstName;
    private String lastName;

    @Column(nullable = false)
    private boolean passwordSet = false;



}

