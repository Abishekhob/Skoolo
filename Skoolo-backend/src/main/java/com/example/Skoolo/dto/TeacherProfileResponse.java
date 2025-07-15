package com.example.Skoolo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TeacherProfileResponse {
    private Long teacherId;
    private String firstName;
    private String lastName;
    private String contactNumber;
    private String profilePicUrl;

    private List<String> subjects;
    private List<ClassSectionSubjectDTO> classAssignments;

    // List of class teacher assignments (class + section names)
    private List<ClassTeacherDTO> classTeacherOf;

    @Data
    public static class ClassSectionSubjectDTO {
        private String className;
        private String sectionName;
        private String subjectName;
    }

    @Data
    public static class ClassTeacherDTO {
        private String className;
        private String sectionName;
    }
}
