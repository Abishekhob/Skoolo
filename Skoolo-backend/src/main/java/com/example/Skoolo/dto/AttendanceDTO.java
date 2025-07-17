package com.example.Skoolo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDate;

@Data
@AllArgsConstructor
public class AttendanceDTO {
    private Long id;
    private LocalDate date;
    private String status;
    private String studentName;
    private String teacherName;
}

