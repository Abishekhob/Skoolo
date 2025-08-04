package com.example.Skoolo.repo;

import com.example.Skoolo.model.ClassEntity;
import com.example.Skoolo.model.Section;
import com.example.Skoolo.model.Subject;
import com.example.Skoolo.model.Timetable;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TimetableRepository extends JpaRepository<Timetable, Long> {

    List<Timetable> findByClassEntityIdAndSectionId(Long classId, Long sectionId);

    Optional<Timetable> findByDayOfWeekAndPeriod(String dayOfWeek, String period);

    Optional<Timetable> findByDayOfWeekAndPeriodAndClassEntityIdAndSectionId(
            String dayOfWeek,
            String period,
            Long classId,
            Long sectionId
    );


    List<Timetable> findByClassEntityIdAndSectionIdAndSubjectId(Long classId, Long sectionId, Long subjectId);


    List<Timetable> findByTeacherId(Long teacherId);

    Optional<Timetable> findByDayOfWeekAndPeriodAndClassEntity_IdAndSection_Id(String dayOfWeek, String period, Long classId, Long sectionId);

    List<Timetable> findByClassEntityAndSection(ClassEntity classEntity, Section section);

    @Query("SELECT DISTINCT t.subject FROM Timetable t WHERE t.classEntity.id = :classId AND t.section.id = :sectionId")
    List<Subject> findSubjectsByClassAndSection(@Param("classId") Long classId, @Param("sectionId") Long sectionId);

}
