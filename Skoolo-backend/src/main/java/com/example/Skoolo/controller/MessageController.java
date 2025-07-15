package com.example.Skoolo.controller;

import com.example.Skoolo.model.Message;
import com.example.Skoolo.model.User;
import com.example.Skoolo.service.MessageService;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    @Autowired
    private MessageService messageService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;


    // Get messages by conversation ID
    @GetMapping("/conversation/{conversationId}")
    public ResponseEntity<List<Message>> getMessages(@PathVariable Long conversationId) {
        List<Message> messages = messageService.getMessagesByConversation(conversationId);
        return ResponseEntity.ok(messages);
    }

    // MessageController.java
    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<?> sendMessage(
            @RequestParam Long conversationId,
            @RequestParam Long senderId,
            @RequestParam String content,
            @RequestParam Long receiverId,
            @RequestParam String type,
            @RequestPart(required = false) MultipartFile file
    ) {
        Message savedMessage = messageService.sendMessage(conversationId, senderId, receiverId, content, type, file);

        User sender = savedMessage.getSender();
        User receiver = savedMessage.getReceiver();

        Map<String, Object> payload = new HashMap<>();
        payload.put("id", savedMessage.getId());
        payload.put("conversation", Map.of("id", conversationId));
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

        // Broadcast enriched message to WebSocket
        messagingTemplate.convertAndSend("/topic/messages/" + conversationId, payload);

        // Return enriched DTO in response
        return ResponseEntity.ok(payload);
    }


}

