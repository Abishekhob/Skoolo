package com.example.Skoolo.repo;

import com.example.Skoolo.model.Assignment;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment,Long> {

    List<Assignment> findByClassEntity_IdAndSection_Id(Long classId, Long sectionId);
}
