package com.example.Skoolo.model;

import com.example.Skoolo.model.enums.RequestStatus;
import com.example.Skoolo.model.enums.RequestType;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "service_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ServiceRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Parent who submitted the request
    @ManyToOne
    @JoinColumn(name = "parent_id", nullable = false)
    private Parent parent;

    // Optional - related student
    @ManyToOne
    @JoinColumn(name = "student_id")
    private Student student;

    @Enumerated(EnumType.STRING)
    private RequestType requestType;

    // Only used if requestType == OTHER
    @Column(length = 2000)
    private String customRequest;

    private String title;

    @Column(length = 2000)
    private String description;

    @Enumerated(EnumType.STRING)
    private RequestStatus status = RequestStatus.PENDING;

    private String adminRemarks;

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
