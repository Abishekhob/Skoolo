package com.example.Skoolo.controller;

import com.example.Skoolo.model.*;
import com.example.Skoolo.repo.*;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/assignments")
@RequiredArgsConstructor
public class AssignmentController {

    private final AssignmentRepository assignmentRepo;
    private final ClassRepository classEntityRepo;
    private final SectionRepository sectionRepo;
    private final SubjectRepository subjectRepo;
    private final TeacherRepository teacherRepo;

    @PostMapping
    public ResponseEntity<Assignment> createAssignment(@RequestBody Assignment assignment) {
        // Fetch managed entities from DB by ID to attach them properly
        ClassEntity classEntity = classEntityRepo.findById(assignment.getClassEntity().getId())
                .orElseThrow(() -> new RuntimeException("ClassEntity not found"));
        Section section = sectionRepo.findById(assignment.getSection().getId())
                .orElseThrow(() -> new RuntimeException("Section not found"));
        Subject subject = subjectRepo.findById(assignment.getSubject().getId())
                .orElseThrow(() -> new RuntimeException("Subject not found"));
        Teacher teacher = teacherRepo.findById(assignment.getTeacher().getId())
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        assignment.setClassEntity(classEntity);
        assignment.setSection(section);
        assignment.setSubject(subject);
        assignment.setTeacher(teacher);

        Assignment saved = assignmentRepo.save(assignment);
        return ResponseEntity.ok(saved);
    }


    @GetMapping
    public ResponseEntity<List<Assignment>> getAllAssignments() {
        return ResponseEntity.ok(assignmentRepo.findAll());
    }

    @GetMapping("/class/{classId}/section/{sectionId}")
    public ResponseEntity<List<Assignment>> getByClassAndSection(@PathVariable Long classId, @PathVariable Long sectionId) {
        return ResponseEntity.ok(assignmentRepo.findByClassEntity_IdAndSection_Id(classId, sectionId));
    }
}
