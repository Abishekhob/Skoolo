// dto/ParentTimetableResponseDTO.java
package com.example.Skoolo.dto;

import lombok.Data;

import java.util.List;

@Data
public class ParentTimetableResponseDTO {
    private String studentName;
    private List<TimetableResponseDTO> timetable;
}

