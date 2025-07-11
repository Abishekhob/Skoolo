package com.example.Skoolo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ChatMessage {
    private Long conversationId;
    private Long senderId;
    private Long receiverId;
    private String content;
    private String type; // text/file

}

