package com.example.Skoolo.repo;

import com.example.Skoolo.model.Mark;
import com.example.Skoolo.model.Student;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MarkRepository extends JpaRepository<Mark, Long> {
    Optional<Mark> findByStudent_IdAndSubject_IdAndClassEntity_IdAndSection_IdAndExamNameAndAcademicYear(
            Long studentId, Long subjectId, Long classEntityId, Long sectionId, String examName, String academicYear);

    List<Mark> findBySubject_IdAndClassEntity_IdAndSection_Id(
            Long subjectId, Long classId, Long sectionId);


    @Query("SELECT m FROM Mark m " +
            "JOIN FETCH m.student s " +
            "JOIN FETCH m.subject subj " +
            "WHERE m.student IN :students")
    List<Mark> findByStudentInWithDetails(@Param("students") List<Student> students);


}
