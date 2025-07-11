package com.example.Skoolo.controller;

import com.example.Skoolo.dto.CreateClassRequest;
import com.example.Skoolo.model.ClassEntity;
import com.example.Skoolo.model.Section;
import com.example.Skoolo.model.Student;
import com.example.Skoolo.model.Timetable;
import com.example.Skoolo.repo.ClassRepository;
import com.example.Skoolo.repo.SectionRepository;
import com.example.Skoolo.repo.StudentRepository;
import com.example.Skoolo.service.ClassService;
import com.example.Skoolo.service.TimetableService;
import java.util.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/classes")
@RequiredArgsConstructor
public class ClassController {

    @Autowired
    private ClassRepository classRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private SectionRepository sectionRepository;

    @Autowired
    private TimetableService timetableService;

    @Autowired
    private ClassService classService;

    @GetMapping
    public List<ClassEntity> getAllClasses() {
        return classRepository.findAll();
    }

    // GET class by ID
    @GetMapping("/{id}")
    public ResponseEntity<ClassEntity> getClassById(@PathVariable Long id) {
        return classService.getClassById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // PUT (Update) an existing class
    @PutMapping("/{id}")
    public ResponseEntity<?> updateClass(@PathVariable Long id, @RequestBody CreateClassRequest request) {
        try {
            ClassEntity updatedClass = classService.updateClassWithSections(id, request);
            return ResponseEntity.ok(updatedClass);
        } catch (IllegalArgumentException e) {
            // e.g., class not found, or new class name already exists
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred: " + e.getMessage());
        }
    }

    // DELETE a class
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteClass(@PathVariable Long id) {
        try {
            classService.deleteClass(id);
            return ResponseEntity.noContent().build(); // 204 No Content for successful deletion
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred: " + e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<ClassEntity> createClass(@RequestBody CreateClassRequest request) {
        ClassEntity createdClass = classService.createClassWithSections(request);
        return ResponseEntity.ok(createdClass);
    }

    @GetMapping("/{classId}/sections")
    public ResponseEntity<?> getSectionsByClass(@PathVariable Long classId) {
        Optional<ClassEntity> classOpt = classRepository.findById(classId);
        if (classOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Class not found");
        }

        ClassEntity classEntity = classOpt.get();

        List<Map<String, Object>> sectionList = new ArrayList<>();

        for (Section section : classEntity.getSections()) {
            Map<String, Object> sectionData = new HashMap<>();
            sectionData.put("id", section.getId());
            sectionData.put("name", section.getSectionName());

            // Count students in this section for this class
            Long studentCount = studentRepository.countByCurrentClassAndCurrentSection(classEntity, section);
            sectionData.put("totalStudents", studentCount);

            // Get class teacher name (if assigned)
            String teacherName = (section.getClassTeacher() != null)
                    ? section.getClassTeacher().getFullName() // assuming a getFullName() or getFirstName()
                    : "Not Assigned";
            sectionData.put("classTeacher", teacherName);

            sectionList.add(sectionData);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("className", classEntity.getClassName());
        response.put("sections", sectionList);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{classId}/sections/{sectionId}/details")
    public ResponseEntity<?> getSectionDetails(
            @PathVariable Long classId,
            @PathVariable Long sectionId) {

        Optional<ClassEntity> classOpt = classRepository.findById(classId);
        Optional<Section> sectionOpt = sectionRepository.findById(sectionId);

        if (classOpt.isEmpty() || sectionOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Class or Section not found");
        }

        ClassEntity classEntity = classOpt.get();
        Section section = sectionOpt.get();

        // Fetch all students in that class and section
        List<Student> students = studentRepository.findByCurrentClassAndCurrentSection(classEntity, section);

        // Count male/female
        long total = students.size();
        long maleCount = students.stream().filter(s -> "male".equalsIgnoreCase(s.getGender())).count();
        long femaleCount = students.stream().filter(s -> "female".equalsIgnoreCase(s.getGender())).count();

        // Convert each student object to a Map (JSON-friendly)
        List<Map<String, Object>> studentList = students.stream().map(s -> {
            Map<String, Object> studentData = new HashMap<>();
            studentData.put("id", s.getId());
            studentData.put("firstName", s.getFirstName());
            studentData.put("lastName", s.getLastName());
            studentData.put("gender", s.getGender());
            studentData.put("dob", s.getDob());
            studentData.put("contactNumber", s.getContactNumber());
            studentData.put("address",s.getAddress());
            studentData.put("enrollmentDate",s.getEnrollmentDate());
            studentData.put("parentName", s.getParent() != null
                    ? s.getParent().getFullName()
                    : "Not Available");

            return studentData;
        }).toList();

        Map<String, Object> response = new HashMap<>();
        response.put("totalStudents", total);
        response.put("maleCount", maleCount);
        response.put("femaleCount", femaleCount);
        response.put("classTeacher", section.getClassTeacher() != null
                ? section.getClassTeacher().getFullName()
                : "Not Assigned");
        response.put("students", studentList);
        response.put("className", classEntity.getClassName());
        response.put("sectionName", section.getSectionName());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{classId}/sections/{sectionId}/timetable")
    public ResponseEntity<?> getTimetable(
            @PathVariable Long classId,
            @PathVariable Long sectionId
    ) {
        try {
            List<Timetable> timetableList = timetableService.getTimetableForSection(classId, sectionId);
            return ResponseEntity.ok(timetableList);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to retrieve timetable.");
        }
    }

    // --- New endpoint for reordering classes ---
    @PutMapping("/reorder")
    public ResponseEntity<?> reorderClasses(@RequestBody List<Map<String, Object>> classUpdates) {
        try {
            classService.updateClassPositions(classUpdates);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to reorder classes: " + e.getMessage());
        }
    }

}
