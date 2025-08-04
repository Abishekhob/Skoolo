package com.example.Skoolo.controller;

import com.example.Skoolo.dto.AssignTeacherSubjectRequest;
import com.example.Skoolo.dto.TimetableEntryDto;
import com.example.Skoolo.model.Subject;
import com.example.Skoolo.repo.TimetableRepository;
import com.example.Skoolo.service.TimetableService;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
@RestController
@RequestMapping("/api/timetable")
public class TimetableController {

    @Autowired
    private TimetableService timetableService;
    @Autowired
    private TimetableRepository timetableRepository;

    @PutMapping("/update")
    public ResponseEntity<?> updateTimetable(@RequestBody List<TimetableEntryDto> entries) {
        timetableService.updateTimetable(entries);
        return ResponseEntity.ok("Timetable updated successfully");
    }

    @PostMapping("/assign-teacher-to-subject")
    public ResponseEntity<?> assignTeacherToSubjectInTimetable(
            @RequestBody AssignTeacherSubjectRequest request
    ) {
        try {
            timetableService.assignTeacherToSubjectInSection(
                    request.getClassId(),
                    request.getSectionId(),
                    request.getSubjectId(), // ✅ changed
                    request.getTeacherId()
            );
            return ResponseEntity.ok("Teacher assigned to all matching subject rows.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Assignment failed: " + e.getMessage());
        }
    }

    @GetMapping("/subjects")
    public ResponseEntity<?> getSubjectsByClassAndSection(
            @RequestParam Long classId,
            @RequestParam Long sectionId) {

        List<Subject> subjects = timetableRepository.findSubjectsByClassAndSection(classId, sectionId);

        if (subjects.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Timetable not assigned for this class and section.");
        }

        List<Map<String, Object>> response = subjects.stream().map(subject -> {
            Map<String, Object> subMap = new HashMap<>();
            subMap.put("id", subject.getId());
            subMap.put("subjectName", subject.getSubjectName());
            return subMap;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

}

