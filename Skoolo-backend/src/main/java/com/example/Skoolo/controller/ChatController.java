package com.example.Skoolo.controller;

import com.example.Skoolo.dto.ChatMessage;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;

    public ChatController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    // Client sends message to /app/chat.sendMessage
    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload ChatMessage chatMessage) {
        // Broadcast to /topic/conversation.{conversationId}
        messagingTemplate.convertAndSend("/topic/conversation." + chatMessage.getConversationId(), chatMessage);
    }
}

