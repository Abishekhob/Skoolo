package com.example.Skoolo.controller;

import com.example.Skoolo.dto.AttendanceRequestDto;
import com.example.Skoolo.model.Attendance;
import com.example.Skoolo.service.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    @Autowired
    private AttendanceService attendanceService;

    // Bulk Marking
    @PostMapping("/bulk")
    public String markAttendance(@RequestBody List<AttendanceRequestDto> attendanceList,
                                 @RequestParam Long teacherId) {
        return attendanceService.markAttendanceBulk(attendanceList, teacherId);
    }

    // Fetch Attendance
    @GetMapping("/class/{classId}/section/{sectionId}")
    public List<Attendance> getAttendance(@PathVariable Long classId,
                                          @PathVariable Long sectionId,
                                          @RequestParam String date) {
        return attendanceService.getAttendanceByClassSectionAndDate(classId, sectionId, LocalDate.parse(date));
    }

    // Can teacher mark?
    @GetMapping("/can-mark")
    public boolean canMark(@RequestParam Long teacherId,
                           @RequestParam Long classId,
                           @RequestParam Long sectionId) {
        return attendanceService.canTeacherMark(teacherId, classId, sectionId);
    }
}
