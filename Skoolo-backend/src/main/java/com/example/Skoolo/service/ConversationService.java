package com.example.Skoolo.service;

import com.example.Skoolo.dto.ConversationSummaryDto;
import com.example.Skoolo.dto.CreateConversationDto;
import com.example.Skoolo.dto.MessageDto;
import com.example.Skoolo.dto.UserSummaryDto;
import com.example.Skoolo.model.Conversation;
import com.example.Skoolo.model.Message;
import com.example.Skoolo.model.User;
import com.example.Skoolo.repo.ConversationRepository;
import com.example.Skoolo.repo.MessageRepository;
import com.example.Skoolo.repo.UserRepository;
import java.time.LocalDateTime;
import java.util.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ConversationService {

    @Autowired
    private ConversationRepository conversationRepo;

    @Autowired
    private MessageRepository messageRepo;

    @Autowired
    private UserRepository userRepo;

    public List<ConversationSummaryDto> getConversationsForUser(Long userId) {
        List<Conversation> conversations = conversationRepo.findAllByParticipantId(userId);
        List<ConversationSummaryDto> result = new ArrayList<>();

        for (Conversation conv : conversations) {
            User otherUser = null;
            String displayName = conv.getName(); // Start with conversation's defined name

            // Determine display name and otherUser for the DTO
            if (conv.getIsGroup() != null && !conv.getIsGroup()) { // It's a 1-on-1 chat
                otherUser = conv.getParticipants()
                        .stream()
                        .filter(u -> !u.getId().equals(userId))
                        .findFirst()
                        .orElse(null);
                if (otherUser != null) {
                    // If conversation name is not set, use other user's name
                    if (displayName == null || displayName.trim().isEmpty()) {
                        displayName = otherUser.getFirstName() + " " + otherUser.getLastName();
                    }
                }
            } else if (conv.getIsGroup() != null && conv.getIsGroup()) { // It's a group chat
                // If group name is not set, provide a generic one
                if (displayName == null || displayName.trim().isEmpty()) {
                    displayName = "Group Chat (" + conv.getParticipants().size() + " participants)";
                }
            } else { // Fallback if isGroup is null (shouldn't happen with @Column(nullable=false) and default)
                displayName = "Unknown Chat";
            }


            // Find latest message
            Message lastMessage = messageRepo.findTopByConversationOrderByTimestampDesc(conv);

            // Count unread messages for this user
            int unreadCount = messageRepo.countByConversationIdAndReceiverIdAndIsReadFalse(conv.getId(), userId);

            ConversationSummaryDto dto = new ConversationSummaryDto();
            dto.setId(conv.getId());
            dto.setName(displayName); // Now ConversationSummaryDto has 'name' field
            dto.setIsGroup(conv.getIsGroup()); // Now ConversationSummaryDto has 'isGroup' field

            if (otherUser != null) { // Only set otherUser for 1-on-1 chats
                dto.setOtherUser(new UserSummaryDto(
                        otherUser.getId(),
                        otherUser.getFirstName(),
                        otherUser.getLastName(),
                        otherUser.getRole().toString()
                ));
            }

            if (lastMessage != null) {
                MessageDto msgDto = new MessageDto();
                msgDto.setContent(lastMessage.getContent());
                msgDto.setTimestamp(lastMessage.getTimestamp());
                msgDto.setSenderId(lastMessage.getSender().getId());
                msgDto.setReceiverId(lastMessage.getReceiver() != null ? lastMessage.getReceiver().getId() : null);
                msgDto.setType(lastMessage.getType());
                msgDto.setFileUrl(lastMessage.getFileUrl());
                dto.setLastMessage(msgDto);
            }

            dto.setUnreadCount(unreadCount);
            // If you add createdAt to ConversationSummaryDto, uncomment and use it:
            // dto.setCreatedAt(conv.getCreatedAt());

            result.add(dto);
        }

        return result;
    }

    @Transactional
    public Conversation findOrCreateOneOnOneConversation(Long currentUserId, Long otherUserId) {
        if (currentUserId.equals(otherUserId)) {
            throw new IllegalArgumentException("Cannot create a one-on-one conversation with the same user.");
        }

        Optional<User> currentUserOpt = userRepo.findById(currentUserId);
        Optional<User> otherUserOpt = userRepo.findById(otherUserId);

        if (currentUserOpt.isEmpty() || otherUserOpt.isEmpty()) {
            throw new RuntimeException("One or both users not found for conversation creation.");
        }

        Optional<Conversation> existingConversation = conversationRepo.findOneOnOneConversationByParticipants(currentUserId, otherUserId);

        if (existingConversation.isPresent()) {
            return existingConversation.get();
        } else {
            Conversation newConversation = new Conversation();
            newConversation.setIsGroup(false);
            newConversation.setCreatedAt(LocalDateTime.now());

            Set<User> participants = new HashSet<>();
            participants.add(currentUserOpt.get());
            participants.add(otherUserOpt.get());
            newConversation.setParticipants(participants);

            // Use current user first
            newConversation.setName(currentUserOpt.get().getFirstName() + " & " + otherUserOpt.get().getFirstName());

            return conversationRepo.save(newConversation);
        }
    }


    @Transactional
    public Conversation createGroupConversation(CreateConversationDto dto) {
        Conversation conversation = new Conversation();
        conversation.setIsGroup(true); // Now setIsGroup should work
        conversation.setName(dto.getName()); // Now setName should work
        conversation.setCreatedAt(LocalDateTime.now()); // Now setCreatedAt should work

        Set<User> participants = new HashSet<>();
        for (Long userId : dto.getUserIds()) {
            User user = userRepo.findById(userId).orElseThrow(() -> new RuntimeException("User not found: " + userId));
            participants.add(user);
        }

        if (participants.size() < 2) {
            throw new IllegalArgumentException("Group conversation must have at least two participants.");
        }

        conversation.setParticipants(participants);

        return conversationRepo.save(conversation);
    }

    public ConversationSummaryDto toConversationSummaryDto(Conversation conv, Long currentUserId) {
        User otherUser = null;
        String displayName = conv.getName();

        if (conv.getIsGroup() != null && !conv.getIsGroup()) {
            otherUser = conv.getParticipants().stream()
                    .filter(u -> !u.getId().equals(currentUserId))
                    .findFirst()
                    .orElse(null);

            if (otherUser != null && (displayName == null || displayName.trim().isEmpty())) {
                displayName = otherUser.getFirstName() + " " + otherUser.getLastName();
            }
        } else if (conv.getIsGroup() != null && conv.getIsGroup()) {
            if (displayName == null || displayName.trim().isEmpty()) {
                displayName = "Group Chat (" + conv.getParticipants().size() + " participants)";
            }
        } else {
            displayName = "Unknown Chat";
        }

        ConversationSummaryDto dto = new ConversationSummaryDto();
        dto.setId(conv.getId());
        dto.setName(displayName);
        dto.setIsGroup(conv.getIsGroup());

        if (otherUser != null) {
            dto.setOtherUser(new UserSummaryDto(
                    otherUser.getId(),
                    otherUser.getFirstName(),
                    otherUser.getLastName(),
                    otherUser.getRole().toString()
            ));
        }

        // You can add lastMessage and unreadCount here if needed, or omit them

        return dto;
    }

}