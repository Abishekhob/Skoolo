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
import com.example.Skoolo.service.CloudinaryService;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
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

    @Autowired
    private CloudinaryService cloudinaryService;

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

    @PostMapping("/upload-profile-pic/{teacherId}")
    public ResponseEntity<String> uploadProfilePic(@PathVariable Long teacherId,
                                                   @RequestParam("file") MultipartFile file) {
        try {
            // Find the teacher in DB
            Teacher teacher = teacherRepository.findById(teacherId)
                    .orElseThrow(() -> new RuntimeException("Teacher not found with ID: " + teacherId));

            // If old image exists, delete it from Cloudinary
            String oldImageUrl = teacher.getProfilePicUrl();
            if (oldImageUrl != null && oldImageUrl.contains("cloudinary.com")) {
                String publicId = extractPublicIdFromUrl(oldImageUrl);
                cloudinaryService.deleteImage(publicId);
            }

            // Use a folder like "teachers/{teacherId}" for organization
            String folderName = "teachers/" + teacherId;

            // Upload new image to Cloudinary with dynamic folder
            Map<String, String> result = cloudinaryService.uploadFileWithPublicId(file, folderName);
            String imageUrl = result.get("url");


            // Save the new image URL
            teacher.setProfilePicUrl(imageUrl);
            teacherRepository.save(teacher);

            return ResponseEntity.ok(imageUrl);
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Upload failed");
        }
    }

    private String extractPublicIdFromUrl(String imageUrl) {
        // Example: https://res.cloudinary.com/demo/image/upload/v1234567890/profile_pics/abc123.jpg
        // You want: profile_pics/abc123 (excluding extension and domain)

        int lastSlash = imageUrl.lastIndexOf('/');
        int dot = imageUrl.lastIndexOf('.');
        if (lastSlash != -1 && dot != -1 && dot > lastSlash) {
            return imageUrl.substring(imageUrl.indexOf("upload/") + 7, dot);
        }
        return null;
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
