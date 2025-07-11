package com.example.Skoolo.service;

import com.example.Skoolo.dto.AttendanceRequestDto;
import com.example.Skoolo.model.*;
import com.example.Skoolo.repo.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.TextStyle;
import java.util.*;

@Service
public class AttendanceService {

    @Autowired private AttendanceRepository attendanceRepository;
    @Autowired private StudentRepository studentRepository;
    @Autowired private TeacherRepository teacherRepository;
    @Autowired private TimetableRepository timetableRepository;

    public String markAttendanceBulk(List<AttendanceRequestDto> dtos, Long teacherId) {
        Teacher teacher = teacherRepository.findById(teacherId).orElseThrow(() -> new RuntimeException("Invalid Teacher"));

        for (AttendanceRequestDto dto : dtos) {
            if (attendanceRepository.existsByStudentIdAndDate(dto.getStudentId(), dto.getDate())) {
                continue; // skip existing
            }

            Student student = studentRepository.findById(dto.getStudentId()).orElseThrow(() -> new RuntimeException("Student not found"));

            Attendance attendance = new Attendance();
            attendance.setDate(dto.getDate());
            attendance.setStatus(dto.getStatus());
            attendance.setStudent(student);
            attendance.setMarkedBy(teacher);

            attendanceRepository.save(attendance);
        }

        return "Attendance saved successfully.";
    }

    public List<Attendance> getAttendanceByClassSectionAndDate(Long classId, Long sectionId, LocalDate date) {
        return attendanceRepository.findByStudent_CurrentClass_IdAndStudent_CurrentSection_IdAndDate(classId, sectionId, date);
    }

    public boolean canTeacherMark(Long teacherId, Long classId, Long sectionId) {
        String today = LocalDate.now().getDayOfWeek().getDisplayName(TextStyle.FULL, Locale.ENGLISH).toUpperCase(); // e.g. MONDAY
        Optional<Timetable> firstPeriod = timetableRepository.findByDayOfWeekAndPeriodAndClassEntity_IdAndSection_Id(today, "1", classId, sectionId);
        return firstPeriod.map(tt -> tt.getTeacher().getId().equals(teacherId)).orElse(false);
    }
}
