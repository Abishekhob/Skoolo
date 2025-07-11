package com.example.Skoolo.repo;

import com.example.Skoolo.model.Mark;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MarkRepository extends JpaRepository<Mark, Long> {
    Optional<Mark> findByStudent_IdAndSubject_IdAndClassEntity_IdAndSection_IdAndExamNameAndAcademicYear(
            Long studentId, Long subjectId, Long classEntityId, Long sectionId, String examName, String academicYear);

    List<Mark> findBySubject_IdAndClassEntity_IdAndSection_Id(
            Long subjectId, Long classId, Long sectionId);


}
