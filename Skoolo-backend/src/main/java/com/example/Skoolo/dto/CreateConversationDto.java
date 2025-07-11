package com.example.Skoolo.dto;

import lombok.Data;

import java.util.List;

@Data
public class CreateConversationDto {
    private String name;           // for group chats
    private List<Long> userIds;    // participants
}
