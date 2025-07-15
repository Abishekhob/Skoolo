package com.example.Skoolo.controller;

import com.example.Skoolo.dto.ChatUserDTO;
import com.example.Skoolo.dto.ConversationDTO;
import com.example.Skoolo.service.ConversationService;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/conversations")
public class ConversationController {

    @Autowired
    private ConversationService conversationService;

    // Get all conversations for a user
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ConversationDTO>> getUserConversations(@PathVariable Long userId) {
        List<ConversationDTO> conversations = conversationService.getUserConversationsAsDTO(userId);
        return ResponseEntity.ok(conversations);
    }


    // Create a new conversation between two users (if permitted)
    @PostMapping
    public ResponseEntity<?> createConversation(@RequestParam Long userId1, @RequestParam Long userId2) {
        return conversationService.createConversation(userId1, userId2)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(403).body("Users cannot chat"));
    }

    // ✅ NEW: Get all users this user can start a chat with
    @GetMapping("/available-users/{userId}")
    public List<ChatUserDTO> getAvailableUsers(@PathVariable Long userId) {
        return conversationService.getAvailableUsersToChat(userId);
    }



}
