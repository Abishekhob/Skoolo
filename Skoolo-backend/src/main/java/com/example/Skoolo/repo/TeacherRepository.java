package com.example.Skoolo.repo;

import com.example.Skoolo.model.Teacher;
import com.example.Skoolo.model.User;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TeacherRepository extends JpaRepository<Teacher, Long> {

    @Query("SELECT t FROM Teacher t JOIN t.subjects s WHERE s.id = :subjectId")
    List<Teacher> findBySubjectId(@Param("subjectId") Long subjectId);

    Optional<Teacher> findByUser(User user);

    Optional<Teacher> findById(Long id);

}
