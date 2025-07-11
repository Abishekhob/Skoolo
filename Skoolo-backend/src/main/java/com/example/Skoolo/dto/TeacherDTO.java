package com.example.Skoolo.dto;

import com.example.Skoolo.model.Teacher;
import lombok.Data;

import java.util.List;

@Data
public class TeacherDTO {
    private Long id;
    private String fullName;
    private String email;
    private String contactNumber;
    private String role;
    private List<String> subjects;

    private String firstName;
    private String lastName;



}
