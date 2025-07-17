package com.example.Skoolo.repo;

import com.example.Skoolo.model.Attendance;
import com.example.Skoolo.model.Student;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    boolean existsByStudentIdAndDate(Long studentId, LocalDate date);
    List<Attendance> findByStudent_CurrentClass_IdAndStudent_CurrentSection_IdAndDate(Long classId, Long sectionId, LocalDate date);

    List<Attendance> findByStudentInOrderByDateDesc(List<Student> students);
}
