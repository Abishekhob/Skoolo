package com.example.Skoolo.repo;

import com.example.Skoolo.model.Parent;
import com.example.Skoolo.model.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ParentRepository extends JpaRepository<Parent, Long> {
    Optional<Parent> findByUserEmail(String email);

    Optional<Parent> findByUser(User user);

    @Query("""
    SELECT DISTINCT p
    FROM Parent p
    JOIN p.children s
    JOIN s.currentClass c,
         Teacher t
    WHERE t.id = :teacherId
      AND c MEMBER OF t.classes
            
""")
    List<Parent> findParentsByTeacherId(@Param("teacherId") Long teacherId);




}
