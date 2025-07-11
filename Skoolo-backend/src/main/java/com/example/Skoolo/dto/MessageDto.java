package com.example.Skoolo.dto;

import java.time.LocalDateTime;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class MessageDto {
    private Long senderId;
    private Long receiverId;
    private Long conversationId;
    private String content;
    private String fileUrl;  // optional file link
    private String type;
    private LocalDateTime timestamp;


    private MultipartFile file; // add this to accept uploaded file


}
