package com.example.Skoolo.dto;

// dto/StudentUpdateRequest.java
import lombok.Data;

@Data
public class StudentUpdateRequest {
    private String firstName;
    private String lastName;
    private String gender;
    private String dob;
    private String contactNumber;
    private String address;
    private String enrollmentDate;
}

