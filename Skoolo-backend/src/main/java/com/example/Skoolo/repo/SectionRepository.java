package com.example.Skoolo.repo;

import com.example.Skoolo.model.ClassEntity;
import com.example.Skoolo.model.Section;
import com.example.Skoolo.model.Teacher;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface SectionRepository extends JpaRepository<Section, Long> {
    List<Section> findByClassEntityId(Long classId);


    Optional<Section> findBySectionNameAndClassEntity(String sectionName, ClassEntity classEntity);

    @Query("SELECT s FROM Section s WHERE s.classEntity.id = :classId AND s.id = :sectionId")
    Optional<Section> findByClassIdAndSectionId(Long classId, Long sectionId);

    List<Section> findByClassTeacherId(Long teacherId);

    List<Section> findByClassTeacher(Teacher teacher);

    List<Section> findByClassEntityIdInAndIdIn(Collection<Long> classIds, Collection<Long> sectionIds);


    boolean existsByClassTeacher(Teacher teacher);

    List<Section> findAllByClassTeacherId(Long teacherId);
}

