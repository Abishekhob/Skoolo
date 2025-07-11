package com.example.Skoolo.controller;

import com.example.Skoolo.dto.ParentDTO;
import com.example.Skoolo.dto.StudentAddRequest;
import com.example.Skoolo.dto.StudentUpdateRequest;
import com.example.Skoolo.model.ClassEntity;
import com.example.Skoolo.model.Section;
import com.example.Skoolo.repo.ClassRepository;
import com.example.Skoolo.repo.SectionRepository;
import com.example.Skoolo.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private UserService userService;

    @Autowired
    private StudentService studentService;

    @Autowired
    private ParentService parentService;

    @Autowired
    private ClassRepository classRepository;

    @Autowired
    private SectionRepository sectionRepository;

    @Autowired
    private TeacherService teacherService;

    @Autowired
    private TimetableService timetableService;

    @PostMapping("/upload-users")
    public ResponseEntity<?> uploadUsers(@RequestParam("file") MultipartFile file) {
        String filename = file.getOriginalFilename();
        if (filename == null) return ResponseEntity.badRequest().body("Invalid file");

        try {
            if (filename.endsWith(".csv")) {
                userService.processCsv(file);
            } else if (filename.endsWith(".xls") || filename.endsWith(".xlsx")) {
                userService.processExcel(file);
            } else {
                return ResponseEntity.badRequest().body("Unsupported file type. Upload .csv or .xlsx");
            }

            return ResponseEntity.ok("Users uploaded successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to upload users: " + e.getMessage());
        }
    }

    @PostMapping("/upload-students")
    public ResponseEntity<?> uploadStudents(
            @RequestParam("file") MultipartFile file,
            @RequestParam Long classId,
            @RequestParam Long sectionId
    ) {
        try {
            studentService.processStudentFile(file, classId, sectionId);
            return ResponseEntity.ok("Students uploaded successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error uploading students: " + e.getMessage());
        }
    }

    @PostMapping("/upload-parents")
    public ResponseEntity<String> uploadParents(@RequestParam("file") MultipartFile file) {
        try {
            parentService.processParentCsv(file);
            return ResponseEntity.ok("Parents uploaded successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to upload parents: " + e.getMessage());
        }
    }

    @GetMapping("/classes")
    public List<ClassEntity> getAllClasses() {
        return classRepository.findAll();
    }

    @GetMapping("/classes/{classId}/sections")
    public List<Section> getSectionsByClass(@PathVariable Long classId) {
        return sectionRepository.findByClassEntityId(classId);
    }

    @PutMapping("/assign-subjects/{teacherId}")
    public ResponseEntity<?> assignSubjectsToTeacher(
            @PathVariable Long teacherId,
            @RequestBody Set<Long> subjectIds
    ) {
        try {
            teacherService.assignSubjectsToTeacher(teacherId, subjectIds);
            return ResponseEntity.ok("Subjects assigned successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/upload-timetable")
    public ResponseEntity<?> uploadTimetable(@RequestParam("file") MultipartFile file) {
        try {
            timetableService.processTimetableFile(file);
            return ResponseEntity.ok("Timetable uploaded successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/add-student")
    public ResponseEntity<?> addStudent(@RequestBody StudentAddRequest request) {
        try {
            studentService.addStudentToSection(request);
            return ResponseEntity.ok("Student added successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PutMapping("/update-student/{id}")
    public ResponseEntity<String> updateStudent(
            @PathVariable Long id,
            @RequestBody StudentUpdateRequest request) {

        studentService.updateStudent(id, request);
        return ResponseEntity.ok("Student updated successfully");
    }


    @PostMapping("/add-parent")
    public ResponseEntity<String> addSingleParent(@RequestBody ParentDTO parentDTO) {
        try {
            parentService.saveParentAndMatchStudents(
                    parentDTO.getFirstName(),
                    parentDTO.getLastName(),
                    parentDTO.getEmail(),
                    parentDTO.getContactNumber(),
                    parentDTO.getAddress()
            );
            return ResponseEntity.ok("Parent added successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to add parent: " + e.getMessage());
        }
    }
}

