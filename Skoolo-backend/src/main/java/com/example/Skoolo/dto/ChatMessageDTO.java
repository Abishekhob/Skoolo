package com.example.Skoolo.dto;

import lombok.Data;

@Data
public class ChatMessageDTO {
    private Long conversationId;
    private Long senderId;
    private Long receiverId;
    private String content;
    private String type; // "TEXT", "FILE" etc.
}

