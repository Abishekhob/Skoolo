package com.example.Skoolo.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "conversation_participants")
@Data
public class ConversationParticipant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "conversation_id")
    private Conversation conversation;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private LocalDateTime joinedAt;
}
