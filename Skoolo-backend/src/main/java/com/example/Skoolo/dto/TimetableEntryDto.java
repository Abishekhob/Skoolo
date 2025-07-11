package com.example.Skoolo.dto;

import lombok.Data;

@Data
public class TimetableEntryDto {
    private String dayOfWeek;
    private String period;
    private String startTime;
    private String endTime;
    private String subjectName; // We'll look up Subject by this

    private Long classId;
    private Long sectionId;

    private String className;     // ✅ Add this
    private String sectionName;
}

