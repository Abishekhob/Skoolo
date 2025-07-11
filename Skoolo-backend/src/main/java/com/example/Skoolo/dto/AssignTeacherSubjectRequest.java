package com.example.Skoolo.dto;

import lombok.Data;

@Data
public class AssignTeacherSubjectRequest {
    private Long classId;
    private Long sectionId;
    private Long subjectId;
    private Long teacherId;

}
