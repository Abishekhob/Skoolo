package com.example.Skoolo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ConversationSummaryDto {
    private Long id;
    private String name; // ADD THIS LINE
    private Boolean isGroup; // ADD THIS LINE
    private UserSummaryDto otherUser; // For 1-on-1 conversations
    private MessageDto lastMessage;
    private int unreadCount;
    // private LocalDateTime createdAt; // Optional: Add if you want to display creation time in summary
}