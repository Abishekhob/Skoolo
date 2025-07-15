package com.example.Skoolo.controller;

import com.example.Skoolo.dto.ChatMessageDTO;
import com.example.Skoolo.model.Message;
import com.example.Skoolo.repo.UserRepository;
import com.example.Skoolo.service.ConversationService;
import com.example.Skoolo.service.MessageService;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class ChatWebSocketController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private ConversationService conversationService;

    @Autowired
    private MessageService messageService;

    @Autowired
    private UserRepository userRepository;

    @MessageMapping("/chat.sendMessage")
    public void sendMessage(ChatMessageDTO chatMessage) {
        var conversationOpt = conversationService.getConversationById(chatMessage.getConversationId());
        if (conversationOpt.isEmpty()) {
            return;
        }
        var conversation = conversationOpt.get();

        // Fetch full User entities (to get names)
        var senderOpt = userRepository.findById(chatMessage.getSenderId());
        var receiverOpt = userRepository.findById(chatMessage.getReceiverId());
        if (senderOpt.isEmpty() || receiverOpt.isEmpty()) {
            return;
        }
        var sender = senderOpt.get();
        var receiver = receiverOpt.get();

        // Create and save Message entity
        Message message = new Message();
        message.setConversation(conversation);
        message.setSender(sender);
        message.setReceiver(receiver);
        message.setContent(chatMessage.getContent());
        message.setType(chatMessage.getType() != null ? chatMessage.getType() : "TEXT");
        message.setTimestamp(LocalDateTime.now());

        Message savedMessage = messageService.saveMessage(message);

        // Build enriched payload with full user info
        Map<String, Object> payload = new HashMap<>();
        payload.put("id", savedMessage.getId());
        payload.put("conversation", Map.of("id", conversation.getId()));
        payload.put("content", savedMessage.getContent());
        payload.put("type", savedMessage.getType());
        payload.put("timestamp", savedMessage.getTimestamp());

        payload.put("sender", Map.of(
                "id", sender.getId(),
                "firstName", sender.getFirstName(),
                "lastName", sender.getLastName()
        ));
        payload.put("receiver", Map.of(
                "id", receiver.getId(),
                "firstName", receiver.getFirstName(),
                "lastName", receiver.getLastName()
        ));

        // Broadcast enriched message
        messagingTemplate.convertAndSend(
                "/topic/messages/" + conversation.getId(),
                payload
        );
    }

}

