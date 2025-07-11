package com.example.Skoolo.controller;

import com.example.Skoolo.model.Conversation;
import com.example.Skoolo.model.Message;
import com.example.Skoolo.model.User;
import com.example.Skoolo.repo.ConversationRepository;
import com.example.Skoolo.repo.MessageRepository;
import com.example.Skoolo.repo.UserRepository;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    @Autowired
    private MessageRepository messageRepo;

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private ConversationRepository conversationRepo;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<?> sendMessage(
            @RequestParam Long conversationId,
            @RequestParam Long senderId,
            @RequestParam String content,
            @RequestParam Long receiverId,
            @RequestParam String type,
            @RequestParam(required = false) MultipartFile file) {

        System.out.println("🎯 /api/messages called with:");
        System.out.println("conversationId = " + conversationId);
        System.out.println("senderId = " + senderId);
        System.out.println("receiverId = " + receiverId);
        System.out.println("type = " + type);
        System.out.println("content = " + content);
        System.out.println("file = " + (file != null ? file.getOriginalFilename() : "No file"));

        User sender = userRepo.findById(senderId).orElse(null);
        if (sender == null) {
            System.out.println("Sender not found");
            return ResponseEntity.status(404).body("Sender not found");
        }

        User receiver = userRepo.findById(receiverId).orElse(null);
        if (receiver == null) {
            System.out.println("Receiver not found");
            return ResponseEntity.status(404).body("Receiver not found");
        }

        Conversation conversation = conversationRepo.findById(conversationId).orElse(null);
        if (conversation == null) {
            System.out.println("Conversation not found");
            return ResponseEntity.status(404).body("Conversation not found");
        }

        try {
            Message message = new Message();
            message.setSender(sender);
            message.setReceiver(receiver);
            message.setConversation(conversation);
            message.setContent(content);
            message.setType(type);
            message.setTimestamp(LocalDateTime.now());
            message.setRead(false);

            if (file != null && !file.isEmpty()) {
                Path uploadDir = Paths.get("uploads");
                if (!Files.exists(uploadDir)) {
                    Files.createDirectories(uploadDir);
                }
                String filename = System.currentTimeMillis() + "_" + file.getOriginalFilename();
                Path filepath = uploadDir.resolve(filename);
                Files.copy(file.getInputStream(), filepath, StandardCopyOption.REPLACE_EXISTING);
                message.setFileUrl("/uploads/" + filename);
            }

            Message savedMessage = messageRepo.save(message);

            messagingTemplate.convertAndSend(
                    "/topic/conversation." + conversation.getId(),
                    savedMessage
            );

            return ResponseEntity.ok(savedMessage);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Internal Server Error");
        }
    }

    @GetMapping("/conversation/{conversationId}")
    public ResponseEntity<List<Message>> getMessagesByConversation(@PathVariable Long conversationId) {
        return ResponseEntity.ok(messageRepo.findByConversationIdOrderByTimestampAsc(conversationId));
    }
}
