package com.example.Skoolo.repo;

import com.example.Skoolo.model.ConversationParticipant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import org.springframework.stereotype.Repository;

@Repository
public interface ConversationParticipantRepository extends JpaRepository<ConversationParticipant, Long> {

    List<ConversationParticipant> findByConversationId(Long conversationId);

    List<ConversationParticipant> findByUserId(Long userId);
}
