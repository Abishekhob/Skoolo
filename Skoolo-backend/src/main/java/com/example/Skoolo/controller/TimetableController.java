package com.example.Skoolo.controller;

import com.example.Skoolo.dto.AssignTeacherSubjectRequest;
import com.example.Skoolo.dto.TimetableEntryDto;
import com.example.Skoolo.service.TimetableService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
@RestController
@RequestMapping("/api/timetable")
public class TimetableController {

    @Autowired
    private TimetableService timetableService;


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



}

