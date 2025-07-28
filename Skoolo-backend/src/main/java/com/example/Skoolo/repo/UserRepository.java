package com.example.Skoolo.repo;

import com.example.Skoolo.model.User;
import com.example.Skoolo.model.enums.Role;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);


    boolean existsByRole(Role role);
}


