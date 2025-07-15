// controller/TeacherProfileController.java
package com.example.Skoolo.controller;

import com.example.Skoolo.dto.ProfileUpdateRequest;
import com.example.Skoolo.dto.TeacherProfileResponse;
import com.example.Skoolo.model.Section;
import com.example.Skoolo.model.Teacher;
import com.example.Skoolo.model.TeacherSubjectAssignment;
import com.example.Skoolo.repo.SectionRepository;
import com.example.Skoolo.repo.TeacherRepository;
import com.example.Skoolo.repo.TeacherSubjectAssignmentRepository;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/teacher/profile")
@RequiredArgsConstructor
public class TeacherProfileController {

    private final TeacherRepository teacherRepository;
    private final TeacherSubjectAssignmentRepository assignmentRepository;
    private final SectionRepository sectionRepository;


    @GetMapping("/{teacherId}")
    public TeacherProfileResponse getProfile(@PathVariable Long teacherId) {
        Teacher teacher = teacherRepository.findById(teacherId).orElseThrow();

        TeacherProfileResponse dto = new TeacherProfileResponse();
        dto.setTeacherId(teacher.getId());
        dto.setFirstName(teacher.getFirstName());
        dto.setLastName(teacher.getLastName());
        dto.setContactNumber(teacher.getContactNumber());
        dto.setProfilePicUrl(teacher.getProfilePicUrl());

        // Check if teacher is class teacher of any section
        List<Section> classTeacherSections = sectionRepository.findAllByClassTeacherId(teacherId);

        if (!classTeacherSections.isEmpty()) {
            List<TeacherProfileResponse.ClassTeacherDTO> classTeacherList = classTeacherSections.stream().map(section -> {
                TeacherProfileResponse.ClassTeacherDTO ct = new TeacherProfileResponse.ClassTeacherDTO();
                ct.setClassName(section.getClassEntity().getClassName());
                ct.setSectionName(section.getSectionName());
                return ct;
            }).collect(Collectors.toList());

            dto.setClassTeacherOf(classTeacherList);
        }

        // Get subjects
        List<String> subjectNames = teacher.getSubjects().stream()
                .map(subject -> subject.getSubjectName())
                .collect(Collectors.toList());
        dto.setSubjects(subjectNames);

        // Get class-section-subject assignments
        List<TeacherSubjectAssignment> assignments = assignmentRepository.findByTeacherId(teacherId);
        List<TeacherProfileResponse.ClassSectionSubjectDTO> classAssignments = assignments.stream().map(assignment -> {
            TeacherProfileResponse.ClassSectionSubjectDTO ca = new TeacherProfileResponse.ClassSectionSubjectDTO();
            ca.setClassName(assignment.getClassEntity().getClassName());
            ca.setSectionName(assignment.getSection().getSectionName());
            ca.setSubjectName(assignment.getSubject().getSubjectName());
            return ca;
        }).collect(Collectors.toList());

        dto.setClassAssignments(classAssignments);

        return dto;
    }

    @PutMapping("/{teacherId}")
    public ResponseEntity<?> updateProfile(@PathVariable Long teacherId, @RequestBody ProfileUpdateRequest request) {
        Teacher teacher = teacherRepository.findById(teacherId).orElseThrow();

        teacher.setFirstName(request.getFirstName());
        teacher.setLastName(request.getLastName());
        teacher.setContactNumber(request.getContactNumber());
        teacher.setProfilePicUrl(request.getProfilePicUrl());

        teacherRepository.save(teacher);
        return ResponseEntity.ok("Profile updated");
    }

    @PostMapping("/upload-profile-pic")
    public ResponseEntity<String> uploadProfilePic(@RequestParam("file") MultipartFile file) {
        try {
            String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            String uploadDir = "uploads/profile_pics/";

            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            Path filePath = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            String fileUrl = "/uploads/profile_pics/" + fileName; // update if served from different location
            return ResponseEntity.ok(fileUrl);
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Upload failed");
        }
    }

    @GetMapping("/teacherId-by-userId/{userId}")
    public ResponseEntity<Long> getTeacherIdByUserId(@PathVariable Long userId) {
        Teacher teacher = teacherRepository.findByUserId(userId);
        if (teacher == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(teacher.getId());
    }

}
