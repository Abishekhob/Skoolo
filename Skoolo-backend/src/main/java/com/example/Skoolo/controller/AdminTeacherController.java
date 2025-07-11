package com.example.Skoolo.controller;

import com.example.Skoolo.dto.TeacherDTO;
import com.example.Skoolo.model.*;
import com.example.Skoolo.repo.SectionRepository;
import com.example.Skoolo.repo.TeacherRepository;
import com.example.Skoolo.service.TeacherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.example.Skoolo.dto.TeacherRequest;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin/teachers")
public class AdminTeacherController {

    @Autowired
    private TeacherService teacherService;

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private SectionRepository sectionRepository;


    // ✅ 1. Upload teachers from Excel or CSV
    @PostMapping("/upload")
    public ResponseEntity<?> uploadTeachers(@RequestParam("file") MultipartFile file) {
        try {
            teacherService.processTeacherFile(file);
            return ResponseEntity.ok("Teachers uploaded successfully.");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Failed to upload teachers: " + e.getMessage());
        }
    }

    // ✅ 2. Assign class teacher to section
    @PostMapping("/{teacherId}/assign-class-teacher")
    public ResponseEntity<?> assignClassTeacher(@PathVariable Long teacherId, @RequestParam Long sectionId) {
        try {
            teacherService.assignClassTeacher(teacherId, sectionId);
            return ResponseEntity.ok("Teacher assigned as class teacher to section.");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Assignment failed: " + e.getMessage());
        }
    }

    @GetMapping("/{id}/subjects")
    public ResponseEntity<?> getSubjectsForTeacher(@PathVariable Long id) {
        Optional<Teacher> teacherOpt = teacherRepository.findById(id);
        if (teacherOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Teacher not found");
        }

        Teacher teacher = teacherOpt.get();

        List<String> subjectNames = teacher.getSubjects().stream()
                .map(Subject::getSubjectName) // Assuming Subject has getName()
                .toList();

        return ResponseEntity.ok(subjectNames);
    }

    // ✅ Get current class teacher
    @GetMapping("/class-teacher")
    public ResponseEntity<?> getClassTeacher(
            @RequestParam Long classId,
            @RequestParam Long sectionId
    ) {
        Optional<Section> sectionOpt = sectionRepository.findByClassIdAndSectionId(classId, sectionId);
        if (sectionOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Section not found");
        }

        Teacher currentTeacher = sectionOpt.get().getClassTeacher();
        if (currentTeacher == null) {
            return ResponseEntity.ok("No class teacher assigned yet");
        }

        return ResponseEntity.ok(currentTeacher);
    }

    @GetMapping("/{teacherId}/class-teacher-of")
    public ResponseEntity<?> getClassTeacherAssignment(@PathVariable Long teacherId) {
        List<Section> sections = sectionRepository.findByClassTeacherId(teacherId);
        if (sections.isEmpty()) {
            return ResponseEntity.ok("Not a class teacher");
        }

        // Return class name + section name for all assignments
        List<String> assignments = sections.stream()
                .map(sec ->  sec.getClassEntity().getClassName() + " " +sec.getSectionName())
                .toList();

        return ResponseEntity.ok(assignments);
    }

    @PostMapping("/add-teacher")
    public ResponseEntity<?> addTeacher(@RequestBody TeacherRequest req) {
        return teacherService.addTeacherManually(req);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateTeacher(@PathVariable Long id, @RequestBody TeacherDTO dto) {
        Optional<Teacher> optionalTeacher = teacherRepository.findById(id);

        if (optionalTeacher.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Teacher not found");
        }

        Teacher teacher = optionalTeacher.get();

        // Update teacher fields
        teacher.setFirstName(dto.getFirstName());
        teacher.setLastName(dto.getLastName());
        teacher.setContactNumber(dto.getContactNumber());

        // If email is from User entity
        if (teacher.getUser() != null && dto.getEmail() != null) {
            teacher.getUser().setEmail(dto.getEmail());
        }

        teacherRepository.save(teacher);
        return ResponseEntity.ok("Teacher updated successfully");
    }


}

