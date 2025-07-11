package com.example.Skoolo.dto;

import lombok.Data;

@Data
public class StudentAddRequest {
    private String firstName;
    private String lastName;
    private String gender;
    private String dob; // You can parse this to LocalDate in service
    private String contactNumber;
    private String parentEmail;
    private String address;
    private String enrollmentDate;

    private Long classId;
    private Long sectionId;
}
