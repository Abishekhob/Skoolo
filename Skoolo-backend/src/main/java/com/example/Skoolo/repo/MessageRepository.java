package com.example.Skoolo.repo;

import com.example.Skoolo.model.Conversation;
import com.example.Skoolo.model.Message;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    List<Message> findByConversationIdOrderByTimestampAsc(Long conversationId);

    Message findTopByConversationOrderByTimestampDesc(Conversation conversation);

    int countByConversationIdAndReceiverIdAndIsReadFalse(Long conversationId, Long receiverId);

}
