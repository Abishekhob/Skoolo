package com.example.Skoolo.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "messages")
@Data
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Conversation conversation;

    @ManyToOne
    private User sender;

    @ManyToOne
    @JoinColumn(name = "receiver_id")
    private User receiver;


    private String content;
    private String fileUrl;
    private LocalDateTime timestamp;
    private boolean isRead;
    private String type; // text, file, etc.
}
