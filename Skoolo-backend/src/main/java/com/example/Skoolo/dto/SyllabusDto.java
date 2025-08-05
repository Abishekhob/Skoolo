package com.example.Skoolo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SyllabusDto {
    private Long id;
    private String className;      // added
    private String sectionName;    // added
    private String subjectName;
    private String fileName;
    private String fileUrl;
    private String uploadedAt;
}
