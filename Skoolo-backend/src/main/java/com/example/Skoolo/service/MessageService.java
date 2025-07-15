package com.example.Skoolo.service;

import com.example.Skoolo.model.Conversation;
import com.example.Skoolo.model.Message;
import com.example.Skoolo.model.User;
import com.example.Skoolo.repo.ConversationRepository;
import com.example.Skoolo.repo.MessageRepository;
import com.example.Skoolo.repo.UserRepository;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class MessageService {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private ConversationRepository conversationRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;


    @Autowired
    private UserRepository userRepository;

    public List<Message> getMessagesByConversation(Long conversationId) {
        return messageRepository.findByConversationIdOrderByTimestampAsc(conversationId);
    }

    public Message saveMessage(Message message) {
        return messageRepository.save(message);
    }

    // ✅ Send message method with full logic
      public Message sendMessage(Long conversationId, Long senderId, Long receiverId, String content, String type, MultipartFile file) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Sender not found"));

        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new RuntimeException("Receiver not found"));

        Message message = new Message();
        message.setConversation(conversation);
        message.setSender(sender);
        message.setReceiver(receiver);
        message.setContent(content);
        message.setType(type);
        message.setTimestamp(LocalDateTime.now());

          if (file != null && !file.isEmpty()) {
              try {
                  String uploadsDir = "uploads/";
                  Path uploadsPath = Paths.get(uploadsDir);

                  if (!Files.exists(uploadsPath)) {
                      Files.createDirectories(uploadsPath);
                  }

                  // ✅ Sanitize filename (remove spaces and special characters)
                  String originalName = file.getOriginalFilename().replaceAll("\\s+", "_").replaceAll("[^a-zA-Z0-9._-]", "");
                  String filename = System.currentTimeMillis() + "_" + originalName;

                  Path filePath = uploadsPath.resolve(filename);

                  Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

                  message.setAttachment(filename);
              } catch (IOException e) {
                  throw new RuntimeException("Failed to save file", e);
              }
          }

          // Save message entity
        return messageRepository.save(message);
    }


}
