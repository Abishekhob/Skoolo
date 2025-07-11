package com.example.Skoolo.repo;

import com.example.Skoolo.model.ClassHistory;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ClassHistoryRepository extends CrudRepository<ClassHistory, Long> {
}
