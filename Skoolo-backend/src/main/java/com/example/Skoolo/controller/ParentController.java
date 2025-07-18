package com.example.Skoolo.controller;

import com.example.Skoolo.dto.AttendanceDTO;
import com.example.Skoolo.dto.MarkResponseDTO;
import com.example.Skoolo.dto.ParentTimetableResponseDTO;
import com.example.Skoolo.dto.TimetableResponseDTO;
import com.example.Skoolo.model.*;
import com.example.Skoolo.repo.*;
import com.example.Skoolo.service.ParentService;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/parents")
@RequiredArgsConstructor
public class ParentController {


    @Autowired
    private ParentRepository parentRepository;

    private final ParentService parentService;

    private final MarkRepository markRepository;

    private final TimetableRepository timetableRepository;

    private final StudentRepository studentRepository;

    private final AssignmentRepository assignmentRepository;

    private final AttendanceRepository attendanceRepository;

    private final FeeRepository feeRepository;

    @GetMapping
    public List<Parent> getAllParents() {
        return parentRepository.findAll(); // or with DTO
    }

    @GetMapping("/{parentId}")
    public ResponseEntity<?> getParentById(@PathVariable Long parentId) {
        return parentRepository.findById(parentId)
                .map(parent -> {
                    return ResponseEntity.ok(new ParentUserIdDTO(parent.getId(), parent.getUser().getId()));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // DTO class to return minimal data
    static class ParentUserIdDTO {
        private Long parentId;
        private Long userId;

        public ParentUserIdDTO(Long parentId, Long userId) {
            this.parentId = parentId;
            this.userId = userId;
        }

        public Long getParentId() {
            return parentId;
        }

        public Long getUserId() {
            return userId;
        }
    }



    @GetMapping("/{parentId}/children")
    public List<Student> getChildren(@PathVariable Long parentId) {
        return parentService.getChildrenOfParent(parentId);
    }

    @GetMapping("/{parentId}/marks")
    public List<MarkResponseDTO> getMarksForChildren(@PathVariable Long parentId) {
        Parent parent = parentRepository.findById(parentId)
                .orElseThrow(() -> new RuntimeException("Parent not found"));

        List<Student> children = parent.getChildren();

        List<Mark> marks = markRepository.findByStudentInWithDetails(children);

        return marks.stream().map(mark -> {
            MarkResponseDTO dto = new MarkResponseDTO();
            dto.setMarkId(mark.getId());
            dto.setChildName(mark.getStudent().getFullName());
            dto.setSubjectName(mark.getSubject().getSubjectName());
            dto.setExamName(mark.getExamName());
            dto.setMarksObtained(mark.getMarksObtained());
            dto.setMaxMarks(mark.getMaxMarks());
            dto.setGrade(mark.getGrade());
            dto.setAcademicYear(mark.getAcademicYear());
            return dto;
        }).collect(Collectors.toList());
    }


    @GetMapping("/{parentId}/timetable")
    public ParentTimetableResponseDTO getTimetableForParent(@PathVariable Long parentId) {
        Parent parent = parentRepository.findById(parentId)
                .orElseThrow(() -> new RuntimeException("Parent not found"));

        List<Student> children = parent.getChildren();
        if (children.isEmpty()) {
            throw new RuntimeException("No children found for parent");
        }

        Student student = children.get(0);

        List<Timetable> timetable = timetableRepository.findByClassEntityAndSection(
                student.getCurrentClass(),
                student.getCurrentSection()
        );

        List<TimetableResponseDTO> timetableDTOs = timetable.stream().map(entry -> {
            TimetableResponseDTO dto = new TimetableResponseDTO();
            dto.setDayOfWeek(entry.getDayOfWeek());
            dto.setPeriod(entry.getPeriod());
            dto.setStartTime(entry.getStartTime());
            dto.setEndTime(entry.getEndTime());
            dto.setSubjectName(entry.getSubject().getSubjectName());
            dto.setTeacherName(entry.getTeacher() != null ? entry.getTeacher().getFullName() : "N/A");
            dto.setClassName(entry.getClassEntity().getClassName());
            dto.setSectionName(entry.getSection().getSectionName());
            return dto;
        }).collect(Collectors.toList());

        ParentTimetableResponseDTO response = new ParentTimetableResponseDTO();
        response.setStudentName(student.getFullName()); // or getFirstName() + " " + getLastName()
        response.setTimetable(timetableDTOs);

        return response;
    }


    @GetMapping("/{parentId}/assignments")
    public ResponseEntity<?> getAssignmentsForParent(@PathVariable Long parentId) {
        // 1. Get the student by parentId
        List<Student> students = studentRepository.findByParentId(parentId);

        if (students.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No child found for this parent");
        }

        // Assuming one student per parent for now, or just getting the first
        Student student = students.get(0);

        // 2. Get the assignments for the student's class and section
        List<Assignment> assignments = assignmentRepository.findByClassEntityAndSection(
                student.getCurrentClass(),
                student.getCurrentSection()
        );

        return ResponseEntity.ok(assignments);
    }

    @GetMapping("/{parentId}/attendance")
    public List<AttendanceDTO> getAttendanceByParent(@PathVariable Long parentId) {
        List<Student> students = studentRepository.findByParentId(parentId);
        if (students.isEmpty()) {
            throw new RuntimeException("No students found for this parent");
        }

        List<Attendance> attendanceList = attendanceRepository.findByStudentInOrderByDateDesc(students);

        return attendanceList.stream()
                .map(att -> new AttendanceDTO(
                        att.getId(),
                        att.getDate(),
                        att.getStatus(),
                        att.getStudent().getFullName(),
                        att.getMarkedBy() != null ? att.getMarkedBy().getFullName() : "N/A"
                ))
                .collect(Collectors.toList());
    }

    @GetMapping("/user-id/{parentId}")
    public Long getUserIdByParentId(@PathVariable Long parentId) {
        Optional<Parent> parent = parentRepository.findById(parentId);
        return parent.map(p -> p.getUser().getId())
                .orElseThrow(() -> new RuntimeException("Parent not found"));
    }


    @GetMapping("/fees/{parentId}")
    public List<Fee> getFeesForParent(@PathVariable Long parentId) {
        // Get student(s) for the parent
        List<Student> students = studentRepository.findByParentId(parentId);

        if (students.isEmpty()) {
            throw new RuntimeException("No student found for this parent");
        }

        // Assuming one student per parent for now
        Student student = students.get(0);
        Long classId = student.getCurrentClass().getId();
        Long sectionId = student.getCurrentSection().getId();

        return feeRepository.findByClassEntityIdAndSectionId(classId, sectionId);
    }
}
