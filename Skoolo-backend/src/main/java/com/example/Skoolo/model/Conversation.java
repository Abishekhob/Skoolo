package com.example.Skoolo.model;

import jakarta.persistence.*;
import java.time.LocalDateTime; // Import LocalDateTime
import java.util.Set;
import lombok.Data; // Ensure Lombok is correctly imported and configured

@Entity
@Data // This Lombok annotation generates getters, setters, equals, hashCode, and toString
public class Conversation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name; // optional for groups, now also for 1-on-1 display

    @Column(nullable = false) // isGroup should not be null
    private Boolean isGroup = false; // Default to false (not a group)

    private LocalDateTime createdAt; // ADD THIS LINE

    @ManyToMany
    @JoinTable(
            name = "conversation_participants",
            joinColumns = @JoinColumn(name = "conversation_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private Set<User> participants;

    // You can add a constructor or @Builder for convenience if needed,
    // but @Data handles basic getter/setter generation.
}