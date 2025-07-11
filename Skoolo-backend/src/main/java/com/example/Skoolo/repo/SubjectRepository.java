package com.example.Skoolo.repo;

import com.example.Skoolo.model.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, Long> {

    Optional<Subject> findBySubjectNameIgnoreCase(String subjectName);

    Subject findBySubjectName(String subjectName);

}
