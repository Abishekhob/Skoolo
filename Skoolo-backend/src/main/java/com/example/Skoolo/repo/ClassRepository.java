package com.example.Skoolo.repo;

import com.example.Skoolo.model.ClassEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ClassRepository extends JpaRepository<ClassEntity, Long> {
    boolean existsByClassName(String className);

    Optional<ClassEntity> findByClassName(String className);
}
