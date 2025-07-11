package com.example.Skoolo.controller;

import com.example.Skoolo.dto.MarkRequest;
import com.example.Skoolo.model.*;
import com.example.Skoolo.repo.*;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/marks")
@RequiredArgsConstructor
public class MarkController {

    private final StudentRepository studentRepo;
    private final SubjectRepository subjectRepo;
    private final SectionRepository sectionRepo;
    private final ClassRepository classRepo;
    private final MarkRepository markRepo;
    private final TeacherSubjectAssignmentRepository teacherSubjectAssignmentRepository;

    @PostMapping
    public ResponseEntity<?> saveMarks(@RequestBody List<MarkRequest> marks) {
        for (MarkRequest req : marks) {
            Student student = studentRepo.findById(req.getStudentId()).orElse(null);
            Subject subject = subjectRepo.findById(req.getSubjectId()).orElse(null);
            Section section = sectionRepo.findById(req.getSectionId()).orElse(null);
            ClassEntity classEntity = classRepo.findById(req.getClassId()).orElse(null);

            if (student == null || subject == null || section == null || classEntity == null) continue;

            // ❗ Avoid duplicates
            boolean exists = markRepo
                    .findByStudent_IdAndSubject_IdAndClassEntity_IdAndSection_IdAndExamNameAndAcademicYear(
                            req.getStudentId(), req.getSubjectId(), req.getClassId(), req.getSectionId(),
                            req.getExamName(), req.getAcademicYear()
                    )
                    .isPresent();

            if (exists) continue;

            Mark mark = new Mark();
            mark.setStudent(student);
            mark.setSubject(subject);
            mark.setSection(section);
            mark.setClassEntity(classEntity);
            mark.setMarksObtained(req.getMarksObtained());
            mark.setMaxMarks(req.getMaxMarks());
            mark.setExamName(req.getExamName());
            mark.setAcademicYear(req.getAcademicYear());
            mark.setGrade(calculateGrade(req.getMarksObtained(), req.getMaxMarks()));

            markRepo.save(mark);
        }


        return ResponseEntity.ok("Marks saved successfully");
    }

    private String calculateGrade(int marks, int max) {
        double percent = (double) marks / max * 100;
        if (percent >= 90) return "A+";
        if (percent >= 75) return "A";
        if (percent >= 60) return "B";
        if (percent >= 45) return "C";
        if (percent >= 35) return "D";
        return "F";
    }

    @GetMapping("/by-teacher")
    public ResponseEntity<?> getMarksUploadedByTeacher(@RequestParam Long teacherId) {
        List<TeacherSubjectAssignment> assignments = teacherSubjectAssignmentRepository.findByTeacher_Id(teacherId);
        List<Mark> allMarks = new ArrayList<>();

        for (TeacherSubjectAssignment assign : assignments) {
            List<Mark> subjectMarks = markRepo.findBySubject_IdAndClassEntity_IdAndSection_Id(
                    assign.getSubject().getId(),
                    assign.getClassEntity().getId(),
                    assign.getSection().getId()
            );
            allMarks.addAll(subjectMarks);
        }

        return ResponseEntity.ok(allMarks);
    }

}
