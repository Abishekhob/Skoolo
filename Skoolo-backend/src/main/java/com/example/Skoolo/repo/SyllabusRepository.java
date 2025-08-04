package com.example.Skoolo.repo;

import com.example.Skoolo.model.Syllabus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SyllabusRepository extends JpaRepository<Syllabus, Long> {
    List<Syllabus> findByClassEntityIdAndSectionId(Long classId, Long sectionId);
    List<Syllabus> findByClassEntityIdAndSectionIdAndSubjectId(Long classId, Long sectionId, Long subjectId);

    List<Syllabus> findByClassEntityId(Long classId);
}
