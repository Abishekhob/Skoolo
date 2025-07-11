package com.example.Skoolo.repo;

import com.example.Skoolo.model.ClassEntity;
import com.example.Skoolo.model.Section;
import com.example.Skoolo.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {


    List<Student> findByParentIsNullAndParentEmail(String email);


    Long countByCurrentClassAndCurrentSection(ClassEntity classEntity, Section section);

    List<Student> findByCurrentClassAndCurrentSection(ClassEntity classEntity, Section section);



    List<Student> findByCurrentClassId(Long id);

    List<Student> findByCurrentClass_IdAndCurrentSection_Id(Long classId, Long sectionId);
}

