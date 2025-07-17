package com.example.Skoolo.repo;

import com.example.Skoolo.model.ClassEntity;
import com.example.Skoolo.model.Section;
import com.example.Skoolo.model.Student;
import java.util.List;
import java.util.Set;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {


    List<Student> findByParentIsNullAndParentEmail(String email);


    Long countByCurrentClassAndCurrentSection(ClassEntity classEntity, Section section);

    List<Student> findByCurrentClassAndCurrentSection(ClassEntity classEntity, Section section);



    List<Student> findByCurrentClassId(Long id);

    List<Student> findByCurrentClass_IdAndCurrentSection_Id(Long classId, Long sectionId);

    @Query("SELECT s FROM Student s WHERE s.currentSection.id IN :sectionIds")
    List<Student> findByCurrentSectionIdIn(@Param("sectionIds") Set<Long> sectionIds);

    List<Student> findByParentId(Long parentId);


}

