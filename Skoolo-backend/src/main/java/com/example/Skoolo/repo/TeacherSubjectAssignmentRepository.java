package com.example.Skoolo.repo;

import com.example.Skoolo.model.Teacher;
import com.example.Skoolo.model.TeacherSubjectAssignment;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TeacherSubjectAssignmentRepository extends JpaRepository<TeacherSubjectAssignment, Long> {
    List<TeacherSubjectAssignment> findByTeacher(Teacher teacher);

    Optional<Object> findByTeacherIdAndSubjectIdAndClassEntityIdAndSectionId(Long teacherId, Long subjectId, Long classId, Long sectionId);

    List<TeacherSubjectAssignment> findByTeacher_Id(Long teacherId);
}

