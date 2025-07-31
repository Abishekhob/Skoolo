package com.example.Skoolo.service;

import com.example.Skoolo.model.Conversation;
import com.example.Skoolo.model.Message;
import com.example.Skoolo.model.User;
import com.example.Skoolo.repo.ConversationRepository;
import com.example.Skoolo.repo.MessageRepository;
import com.example.Skoolo.repo.UserRepository;
import java.io.IOException;
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
    private CloudinaryService cloudinaryService;


    @Autowired
    private UserRepository userRepository;

    public List<Message> getMessagesByConversation(Long conversationId) {
        return messageRepository.findByConversationIdOrderByTimestampAsc(conversationId);
    }

    public Message saveMessage(Message message) {
        return messageRepository.save(message);
    }

    // ✅ Send message method with full logic
    public Message sendMessage(Long conversationId, Long senderId, Long receiverId, String content, String type, MultipartFile file) throws IOException {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Sender not found"));

        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new RuntimeException("Receiver not found"));

        if (!(
                (conversation.getUser1().getId().equals(senderId) && conversation.getUser2().getId().equals(receiverId)) ||
                        (conversation.getUser1().getId().equals(receiverId) && conversation.getUser2().getId().equals(senderId))
        )) {
            throw new RuntimeException("Users not part of this conversation");
        }

        Message message = new Message();
        message.setConversation(conversation);
        message.setSender(sender);
        message.setReceiver(receiver);
        message.setTimestamp(LocalDateTime.now());

        if (file != null && !file.isEmpty()) {
            String cloudinaryUrl = cloudinaryService.uploadImage(file, "chat_files");
            message.setAttachment(cloudinaryUrl); // store in attachment
            message.setType("FILE");
            message.setContent(null); // clear content
        } else {
            message.setContent(content); // plain text
            message.setType(type);
            message.setAttachment(null); // clear attachment
        }

        return messageRepository.save(message);
    }




}
