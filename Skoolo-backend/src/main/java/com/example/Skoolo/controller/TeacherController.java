package com.example.Skoolo.controller;

import com.example.Skoolo.dto.TeacherDTO;
import com.example.Skoolo.dto.TimetableEntryDto;
import com.example.Skoolo.model.Section;
import com.example.Skoolo.model.Teacher;
import com.example.Skoolo.model.TeacherSubjectAssignment;
import com.example.Skoolo.repo.SectionRepository;
import com.example.Skoolo.repo.TeacherRepository;
import com.example.Skoolo.repo.TeacherSubjectAssignmentRepository;
import com.example.Skoolo.service.TeacherService;
import com.example.Skoolo.service.TimetableService;
import java.util.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/teacher")
@RequiredArgsConstructor
public class TeacherController {

    @Autowired
    private TeacherService teacherService;

    @Autowired
    private TimetableService timetableService;

    @Autowired
    private TeacherSubjectAssignmentRepository teacherSubjectAssignmentRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private SectionRepository sectionRepository;

    @GetMapping
    public List<TeacherDTO> getAllTeachers() {
        return teacherService.getAllTeachers();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/teachers/by-subject")
    public ResponseEntity<List<Teacher>> getTeachersBySubject(@RequestParam Long subjectId) {
        List<Teacher> teachers = teacherService.findTeachersBySubjectId(subjectId);
        return ResponseEntity.ok(teachers);
    }


    @GetMapping("/{teacherId}/timetable")
    public List<TimetableEntryDto> getTimetable(@PathVariable Long teacherId) {
        return timetableService.getTimetableForTeacher(teacherId);
    }



    @GetMapping("/{teacherId}/assigned-classes")
    public ResponseEntity<?> getAssignedClasses(@PathVariable Long teacherId) {
        Optional<Teacher> teacherOpt = teacherRepository.findById(teacherId);
        if (teacherOpt.isEmpty()) return ResponseEntity.notFound().build();

        Teacher teacher = teacherOpt.get();

        List<Section> classTeacherSections = sectionRepository.findByClassTeacher(teacher);
        Set<String> seenKeys = new HashSet<>();
        List<Map<String, Object>> result = new ArrayList<>();

        // 1. Class teacher assignments
        for (Section sec : classTeacherSections) {
            String key = sec.getClassEntity().getId() + "-" + sec.getId();
            seenKeys.add(key);
            result.add(Map.of(
                    "classId", sec.getClassEntity().getId(),
                    "sectionId", sec.getId(),
                    "className", sec.getClassEntity().getClassName(),
                    "sectionName", sec.getSectionName(),
                    "isClassTeacher", true
            ));
        }

        // 2. Subject teacher assignments
        List<TeacherSubjectAssignment> assignments = teacherSubjectAssignmentRepository.findByTeacher(teacher);
        for (TeacherSubjectAssignment assign : assignments) {
            String key = assign.getClassEntity().getId() + "-" + assign.getSection().getId() + "-" + assign.getSubject().getId();

            // allow multiple entries with same class-section but different subject
            result.add(Map.of(
                    "classId", assign.getClassEntity().getId(),
                    "sectionId", assign.getSection().getId(),
                    "className", assign.getClassEntity().getClassName(),
                    "sectionName", assign.getSection().getSectionName(),
                    "subjectId", assign.getSubject().getId(),
                    "subjectName", assign.getSubject().getSubjectName(),
                    "isClassTeacher", false
            ));
        }

        return ResponseEntity.ok(result);
    }

    @GetMapping("/{teacherId}/marking-assignments")
    public ResponseEntity<?> getMarkingAssignments(@PathVariable Long teacherId) {
        Optional<Teacher> teacherOpt = teacherRepository.findById(teacherId);
        if (teacherOpt.isEmpty()) return ResponseEntity.notFound().build();

        Teacher teacher = teacherOpt.get();
        List<TeacherSubjectAssignment> assignments = teacherSubjectAssignmentRepository.findByTeacher(teacher);

        List<Map<String, Object>> result = new ArrayList<>();

        for (TeacherSubjectAssignment assign : assignments) {
            Map<String, Object> map = new HashMap<>();
            map.put("classId", assign.getClassEntity().getId());
            map.put("className", assign.getClassEntity().getClassName());
            map.put("sectionId", assign.getSection().getId());
            map.put("sectionName", assign.getSection().getSectionName());
            map.put("subjectId", assign.getSubject().getId());
            map.put("subjectName", assign.getSubject().getSubjectName());
            result.add(map);
        }

        return ResponseEntity.ok(result);
    }

    @GetMapping("/{teacherId}")
    public ResponseEntity<?> getTeacherById(@PathVariable Long teacherId) {
        return teacherRepository.findById(teacherId)
                .map(teacher -> {
                    // return minimal info, including userId
                    return ResponseEntity.ok(new TeacherUserIdDTO(teacher.getId(), teacher.getUser().getId()));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // DTO class to return minimal data
    static class TeacherUserIdDTO {
        private Long teacherId;
        private Long userId;

        public TeacherUserIdDTO(Long teacherId, Long userId) {
            this.teacherId = teacherId;
            this.userId = userId;
        }

        public Long getTeacherId() {
            return teacherId;
        }

        public Long getUserId() {
            return userId;
        }
    }
}
