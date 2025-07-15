package com.example.Skoolo.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ConversationDTO {
    private Long id;
    private ChatUserDTO user1;
    private ChatUserDTO user2;
    private LocalDateTime createdAt;


}
