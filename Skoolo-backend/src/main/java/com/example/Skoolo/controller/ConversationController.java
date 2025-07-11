package com.example.Skoolo.controller;

import com.example.Skoolo.dto.ConversationSummaryDto;
import com.example.Skoolo.dto.CreateConversationDto;
import com.example.Skoolo.dto.UserSummaryDto;
import com.example.Skoolo.model.Conversation;
import com.example.Skoolo.model.User;
import com.example.Skoolo.repo.UserRepository;
import com.example.Skoolo.service.ConversationService;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/conversations")
public class ConversationController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ConversationService conversationService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ConversationSummaryDto>> getConversationsForUser(@PathVariable Long userId) {
        return ResponseEntity.ok(conversationService.getConversationsForUser(userId));
    }

    /**
     * Finds an existing one-on-one conversation between two users, or creates a new one if it doesn't exist.
     * This endpoint now serves the "find or create" logic.
     * Changed from POST to GET as it's an idempotent operation.
     *
     * @param user1Id ID of the first participant.
     * @param user2Id ID of the second participant.
     * @return ResponseEntity containing the found or newly created Conversation object.
     */
    @GetMapping("/findOrCreateOneOnOne")
    public ResponseEntity<ConversationSummaryDto> findOrCreateOneOnOneConversation(
            @RequestParam Long user1Id,
            @RequestParam Long user2Id
    ) {
        System.out.println("🎯 /api/conversations/findOrCreateOneOnOne called for user1Id=" + user1Id + ", user2Id=" + user2Id);
        Conversation conv = conversationService.findOrCreateOneOnOneConversation(user1Id, user2Id);
        ConversationSummaryDto dto = conversationService.toConversationSummaryDto(conv, user1Id);
        return ResponseEntity.ok(dto);
    }



    @PostMapping("/group")
    public ResponseEntity<Conversation> createGroupConversation(@RequestBody CreateConversationDto dto) {
        return ResponseEntity.ok(conversationService.createGroupConversation(dto));
    }

    @GetMapping("/{conversationId}/participants")
    public List<UserSummaryDto> getParticipants(@PathVariable Long conversationId) {
        // Assuming userRepository.findUsersByConversationId(conversationId) exists and works
        List<User> users = userRepository.findUsersByConversationId(conversationId);
        return users.stream()
                .map(u -> new UserSummaryDto(u.getId(), u.getFirstName(), u.getLastName(), u.getRole().toString()))
                .collect(Collectors.toList());
    }
}