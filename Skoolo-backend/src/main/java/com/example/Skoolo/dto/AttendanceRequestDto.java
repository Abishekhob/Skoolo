package com.example.Skoolo.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class AttendanceRequestDto {
    private Long studentId;
    private String status;
    private LocalDate date;
}
