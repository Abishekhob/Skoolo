package com.example.Skoolo.repo;

import com.example.Skoolo.model.Conversation;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    // Find all conversations that include a user
    @Query("SELECT c FROM Conversation c JOIN c.participants p WHERE p.id = :userId")
    List<Conversation> findByUserId(Long userId);

    /**
     * Finds an existing 1-on-1 conversation between two specific users.
     * This query works regardless of the order of user1Id and user2Id,
     * and ensures the conversation has exactly these two participants and is not a group chat.
     *
     * @param user1Id ID of the first participant.
     * @param user2Id ID of the second participant.
     * @return An Optional containing the Conversation if found, otherwise empty.
     */
    @Query("SELECT c FROM Conversation c " +
            "JOIN c.participants p1 JOIN c.participants p2 " +
            "WHERE c.isGroup = false " +
            "AND p1.id IN (:user1Id, :user2Id) " +
            "AND p2.id IN (:user1Id, :user2Id) " +
            "GROUP BY c.id " +
            "HAVING COUNT(DISTINCT p1.id) = 2")
    Optional<Conversation> findOneOnOneConversationByParticipants(
            @Param("user1Id") Long user1Id,
            @Param("user2Id") Long user2Id);

    // This method is now effectively replaced by findOneOnOneConversationByParticipants
    // You can remove or keep it if it's used elsewhere, but for the find-or-create logic,
    // the new method is preferred. For now, I'll comment it out to avoid confusion.
    // @Query("SELECT c FROM Conversation c JOIN c.participants p1 JOIN c.participants p2 " +
    //         "WHERE c.isGroup = false AND p1.id = :user1Id AND p2.id = :user2Id")
    // List<Conversation> findOneOnOneConversation(Long user1Id, Long user2Id);

    @Query("SELECT c FROM Conversation c JOIN c.participants p WHERE p.id = :userId")
    List<Conversation> findAllByParticipantId(@Param("userId") Long userId);

}