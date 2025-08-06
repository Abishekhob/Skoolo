package com.example.Skoolo.controller;

import com.example.Skoolo.dto.SyllabusDto;
import com.example.Skoolo.model.*;
import com.example.Skoolo.repo.*;
import com.example.Skoolo.service.CloudinaryService;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/syllabus")
@RequiredArgsConstructor
public class SyllabusController {

    private final SyllabusRepository syllabusRepository;
    private final ClassRepository classRepository;
    private final SectionRepository sectionRepository;
    private final SubjectRepository subjectRepository;
    private final StudentRepository studentRepository;
    private final CloudinaryService cloudinaryService;

    @PostMapping("/upload")
    public ResponseEntity<String> uploadSyllabus(
            @RequestParam Long classId,
            @RequestParam Long sectionId,
            @RequestParam Long subjectId,
            @RequestParam MultipartFile file
    ) {
        try {
            ClassEntity classEntity = classRepository.findById(classId).orElseThrow();
            Section section = sectionRepository.findById(sectionId).orElseThrow();
            Subject subject = subjectRepository.findById(subjectId).orElseThrow();

            Map<String, String> uploadResult = cloudinaryService.uploadFileWithPublicId(file, "syllabus");

            String fileUrl = uploadResult.get("url");
            String publicId = uploadResult.get("publicId");


            Syllabus syllabus = new Syllabus();
            syllabus.setClassEntity(classEntity);
            syllabus.setSection(section);
            syllabus.setSubject(subject);
            syllabus.setFileName(file.getOriginalFilename());
            syllabus.setFileUrl(fileUrl);
            syllabus.setPublicId(publicId);
            syllabus.setUploadedAt(LocalDate.now());

            syllabusRepository.save(syllabus);

            return ResponseEntity.ok("Syllabus uploaded successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Upload failed: " + e.getMessage());
        }
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<SyllabusDto>> getSyllabusForStudent(@PathVariable Long studentId) {
        Student student = studentRepository.findById(studentId).orElseThrow();
        Long classId = student.getCurrentClass().getId();
        Long sectionId = student.getCurrentSection().getId();

        List<Syllabus> syllabi = syllabusRepository.findByClassEntityIdAndSectionId(classId, sectionId);

        List<SyllabusDto> result = syllabi.stream()
                .map(s -> new SyllabusDto(
                        s.getId(),
                        s.getClassEntity().getClassName(),    // Added class name
                        s.getSection().getSectionName(),              // Added section name
                        s.getSubject().getSubjectName(),
                        s.getFileName(),
                        s.getFileUrl(),
                        s.getUploadedAt().toString()
                )).collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }


    @GetMapping("/all")
    public ResponseEntity<List<SyllabusDto>> getAllSyllabus(
            @RequestParam(required = false) Long classId,
            @RequestParam(required = false) Long sectionId,
            @RequestParam(required = false) Long subjectId
    ) {
        List<Syllabus> syllabi;

        if (classId != null && sectionId != null && subjectId != null) {
            syllabi = syllabusRepository.findByClassEntityIdAndSectionIdAndSubjectId(classId, sectionId, subjectId);
        } else if (classId != null && sectionId != null) {
            syllabi = syllabusRepository.findByClassEntityIdAndSectionId(classId, sectionId);
        } else if (classId != null) {
            syllabi = syllabusRepository.findByClassEntityId(classId);
        } else {
            syllabi = syllabusRepository.findAll();
        }

        List<SyllabusDto> result = syllabi.stream()
                .map(s -> new SyllabusDto(
                        s.getId(),
                        s.getClassEntity().getClassName(),    // added
                        s.getSection().getSectionName(),              // added
                        s.getSubject().getSubjectName(),
                        s.getFileName(),
                        s.getFileUrl(),
                        s.getUploadedAt().toString()
                )).collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteSyllabus(@PathVariable Long id) {
        try {
            Syllabus syllabus = syllabusRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Syllabus not found"));

            cloudinaryService.deleteImage(syllabus.getPublicId());
            syllabusRepository.deleteById(id);

            return ResponseEntity.ok("Syllabus deleted successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Deletion failed: " + e.getMessage());
        }
    }

}
