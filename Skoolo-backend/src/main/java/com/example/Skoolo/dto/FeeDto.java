package com.example.Skoolo.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FeeDto {
    private Long id;
    private String feeType;
    private BigDecimal amount;
    private LocalDate dueDate;
    private Long classId;
    private Long sectionId; // can be null if "All Sections"

    private String className;
    private String sectionName;
}


