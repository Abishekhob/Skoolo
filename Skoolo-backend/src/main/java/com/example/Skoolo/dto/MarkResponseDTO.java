// dto/MarkResponseDTO.java
package com.example.Skoolo.dto;

import lombok.Data;

@Data
public class MarkResponseDTO {
    private Long markId;
    private String childName;
    private String subjectName;
    private String examName;
    private int marksObtained;
    private int maxMarks;
    private String grade;
    private String academicYear;
}
