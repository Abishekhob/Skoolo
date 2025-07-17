// dto/TimetableResponseDTO.java
package com.example.Skoolo.dto;

import lombok.Data;

@Data
public class TimetableResponseDTO {
    private String dayOfWeek;
    private String period;
    private String startTime;
    private String endTime;
    private String subjectName;
    private String teacherName;
    private String className;
    private String sectionName;
}
