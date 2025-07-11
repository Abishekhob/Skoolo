package com.example.Skoolo.dto;

import lombok.Data;

@Data
public class MarkRequest {
    private Long studentId;
    private Long subjectId;
    private Long classId;
    private Long sectionId;
    private int marksObtained;
    private int maxMarks;
    private String examName;
    private String academicYear;
}
