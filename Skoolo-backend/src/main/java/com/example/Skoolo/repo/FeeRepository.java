package com.example.Skoolo.repo;

import com.example.Skoolo.model.Fee;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FeeRepository extends JpaRepository<Fee, Long> {
    List<Fee> findByClassEntityIdAndSectionId(Long classId, Long sectionId);
}
