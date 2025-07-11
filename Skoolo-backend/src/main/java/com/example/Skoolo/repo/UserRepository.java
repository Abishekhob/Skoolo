package com.example.Skoolo.repo;

import com.example.Skoolo.model.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    @Query("""
        SELECT t.user
        FROM Teacher t
        WHERE t.id <> :teacherId
    """)
    List<User> findOtherTeachers(@Param("teacherId") Long teacherId);

    @Query("""
        SELECT u FROM User u
        JOIN ConversationParticipant cp ON u.id = cp.user.id
        WHERE cp.conversation.id = :conversationId
    """)
    List<User> findUsersByConversationId(@Param("conversationId") Long conversationId);
}


