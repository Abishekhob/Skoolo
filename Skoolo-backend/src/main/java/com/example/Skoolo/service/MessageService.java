package com.example.Skoolo.service;

import com.example.Skoolo.dto.MessageDto; // Your MessageDto
import com.example.Skoolo.model.Conversation;
import com.example.Skoolo.model.Message;
import com.example.Skoolo.model.User;
import com.example.Skoolo.repo.ConversationRepository;
import com.example.Skoolo.repo.MessageRepository;
import com.example.Skoolo.repo.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate; // Import SimpMessagingTemplate
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class MessageService {

    @Autowired
    private MessageRepository messageRepo;

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private ConversationRepository conversationRepo;

    @Autowired
    private SimpMessagingTemplate messagingTemplate; // Injected for WebSocket broadcasting

    @Transactional
    public Message sendMessage(MessageDto dto) {
        User sender = userRepo.findById(dto.getSenderId())
                .orElseThrow(() -> new RuntimeException("Sender not found"));

        User receiver = null;
        if (dto.getReceiverId() != null) {
            receiver = userRepo.findById(dto.getReceiverId())
                    .orElseThrow(() -> new RuntimeException("Receiver not found"));
        }

        Conversation conversation = conversationRepo.findById(dto.getConversationId())
                .orElseThrow(() -> new RuntimeException("Conversation not found"));

        Message message = new Message();
        message.setSender(sender);
        message.setReceiver(receiver);
        message.setConversation(conversation);
        message.setContent(dto.getContent());
        message.setFileUrl(dto.getFileUrl());
        message.setTimestamp(LocalDateTime.now());
        message.setType(dto.getType());
        message.setRead(false); // New messages are initially unread

        Message savedMessage = messageRepo.save(message); // Save to database

        // --- WEBSTOCKET BROADCASTING ---
        // Create a MessageDto to send over WebSocket, using only fields available in your DTO
        MessageDto broadcastDto = new MessageDto();
        // NOTE: Your MessageDto does not have an 'id' field for the message itself,
        // but it's common practice to include it for frontend reconciliation.
        // If your frontend needs it, you'll need to add 'private Long id;' to MessageDto.
        // For now, I'm assuming you don't need it in the DTO for broadcasting.

        broadcastDto.setSenderId(savedMessage.getSender().getId());
        broadcastDto.setReceiverId(savedMessage.getReceiver() != null ? savedMessage.getReceiver().getId() : null);
        broadcastDto.setConversationId(savedMessage.getConversation().getId());
        broadcastDto.setContent(savedMessage.getContent());
        broadcastDto.setFileUrl(savedMessage.getFileUrl());
        broadcastDto.setTimestamp(savedMessage.getTimestamp());
        broadcastDto.setType(savedMessage.getType());
        // Note: Your MessageDto does not have an 'isRead' field for broadcast, only for storage.

        // Define the WebSocket topic. This MUST match what the frontend subscribes to.
        String destination = "/topic/conversations/" + conversation.getId();
        System.out.println("Broadcasting message to WebSocket topic: " + destination);
        messagingTemplate.convertAndSend(destination, broadcastDto); // Broadcast the DTO

        return savedMessage;
    }

    public List<Message> getMessagesByConversation(Long conversationId) {
        return messageRepo.findByConversationIdOrderByTimestampAsc(conversationId);
    }
}