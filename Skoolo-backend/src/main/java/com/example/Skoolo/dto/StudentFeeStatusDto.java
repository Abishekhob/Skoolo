package com.example.Skoolo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDate;

@Data
@AllArgsConstructor
public class StudentFeeStatusDto {
    private Long studentId;
    private String studentName;
    private boolean paid;
    private LocalDate paymentDate;
}
